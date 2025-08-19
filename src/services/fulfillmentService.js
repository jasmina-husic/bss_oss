/*
 * fulfillmentService.js
 *
 * This module generates wizard data dynamically based on the selected
 * offering and its component products.  It decomposes an offering
 * into products, then looks up product pricing and inventory to
 * construct the equipment breakdown, required equipment and order
 * totals.  The resulting object conforms to the structure expected
 * by the order wizard and can be persisted in localStorage via
 * orderWizardService.setWizardData().
 *
 * The decomposition aligns with TM Forum SID: offerings reference
 * products, each product references customer facing services (CFS)
 * and resource facing services (RFS).  This service focuses on
 * hardware and license products for demonstration and does not yet
 * extract services/resources.  However, the mapping between
 * products, CFS and RFS is available in the data files
 * (productCfs.json and cfsRfs.json) and can be used to further
 * extend this implementation.
 */

import { fetchOfferingsPage, getOfferingById } from './offeringService.js';
import { fetchProductsPage, getProductById } from './productService.js';
import { getPriceById } from './priceService.js';
import inventoryService from './inventoryService.js';
import { loadDeviceTemplates } from './deviceTemplateService.js';

// Load the base wizard template from the public data folder.  The
// template provides default values for fields that are not
// dynamically generated (e.g. tests, validation checklists).
async function loadTemplate() {
  const res = await fetch('/data/order_wizard_data.json');
  if (!res.ok) throw new Error('Failed to fetch wizard template');
  return await res.json();
}

/**
 * Ensure the offering and product caches are loaded.  Some helper
 * functions (getOfferingById/getProductById) rely on their internal
 * cache being populated; calling the paged fetchers once will
 * initialise the caches.
 */
async function ensureCaches() {
  // load a single page to prime the caches
  await fetchOfferingsPage(0, 1);
  await fetchProductsPage(0, 1);
}

/**
 * Generate wizard data for a given offering id.  Returns a copy of
 * the base template with customised equipment and required
 * equipment lists and updated totals.  If the offering or its
 * products cannot be found this returns null.
 *
 * @param {number|string} offeringId
 * @returns {Promise<object|null>} wizard data object or null
 */
export async function generateWizardData(offeringId) {
  await ensureCaches();
  await inventoryService.loadInventory();
  const template = await loadTemplate();
  const offId = Number(offeringId);
  const offering = getOfferingById(offId);
  if (!offering) return null;

  // Build equipment breakdown based on offering components
  const equipmentBreakdown = [];
  // We'll also collect device metadata (resourceId, qty, displayName, deviceFamily)
  const deviceInfoList = [];
  let equipmentSubtotal = 0;
  // We'll also build device configuration objects keyed by a normalised
  // resource id (e.g. FG100F).  The normalisation rules strip
  // hyphens and take only the first two segments of the product SKU.
  const deviceConfigs = {};

  // Iterate each product component in the offering
  if (Array.isArray(offering.components)) {
    for (const comp of offering.components) {
      const prodId = comp.productId;
      const qty = comp.qty || 1;
      const product = getProductById(prodId);
      if (!product) continue;
      // price lookup
      let unitPrice = 0;
      try {
        const priceRec = await getPriceById(product.priceId);
        // prefer oneOff price if present; else monthly or usage as fallback
        unitPrice = priceRec?.oneOff ?? priceRec?.monthly ?? priceRec?.usage ?? 0;
      } catch {
        // ignore pricing errors; use zero
      }
      const total = unitPrice * qty;
      // derive a normalised resourceId from the product.  Prefer
      // the explicit deviceTemplateId field (if present), falling
      // back to the SKU-based derivation.  The SKU-based approach
      // takes the first two segments split by dash and removes
      // any non-alphanumeric characters.
      let resourceId = '';
      if (Object.prototype.hasOwnProperty.call(product, 'deviceTemplateId') && product.deviceTemplateId) {
        resourceId = product.deviceTemplateId.toUpperCase();
      } else if (product.sku) {
        const parts = product.sku.split('-');
        const base = (parts[0] || '') + (parts[1] || '');
        resourceId = base.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      }
      // Determine if this product requires inventory allocation.  Products
      // categorised as "service", "itsm" or other non-hardware (e.g. "ai")
      // do not consume physical stock and therefore should not appear in the
      // Required Equipment list.  We include a flag on each breakdown item
      // so downstream logic can filter appropriately.
      // Determine if this product requires inventory allocation.  Use
      // explicit `inventory` flag on the product if provided; fall
      // back to category heuristics for legacy data.  Products
      // categorised as "service", "itsm" or "ai" are considered
      // non-allocatable by default.
      let allocatable = true;
      if (Object.prototype.hasOwnProperty.call(product, 'inventory')) {
        allocatable = Boolean(product.inventory);
      } else {
        allocatable = !['service', 'itsm', 'ai'].includes(
          (product.category || '').toLowerCase()
        );
      }
      equipmentBreakdown.push({
        item: product.name,
        sku: product.sku,
        qty,
        unitPrice,
        total,
        resourceId,
        allocatable,
      });
      equipmentSubtotal += total;
      // If allocatable, store device metadata for later template lookup.
      if (allocatable) {
        deviceInfoList.push({
          resourceId,
          qty,
          displayName: product.name,
          deviceFamily: product.deviceFamily || '',
        });
      }
    }
  }

  // Compute required equipment based on inventory
  const requiredEquipment = equipmentBreakdown
    .filter((it) => it.allocatable)
    .map((it) => {
      const stock = inventoryService.getAvailableStock(it.item);
      let status;
      if (stock === undefined) status = 'Not Available';
      else if (stock >= it.qty) status = 'Available';
      else status = 'Low Stock';
      return {
        name: it.item,
        need: it.qty,
        stock: stock ?? 0,
        status,
      };
    });

  // Load device templates so we can prefill configuration
  let templates = {};
  try {
    templates = await loadDeviceTemplates();
  } catch (err) {
    console.warn('fulfillmentService: could not load device templates', err);
  }

  // Build device configuration entries by using templates and/or product family.
  // We iterate over the collected deviceInfoList, which includes only
  // allocatable products.  For each device we look up a template by
  // resourceId and derive its type from either the template or the
  // product's deviceFamily.  Devices without a type or template are
  // ignored.  When a template is absent we create a simple free‑form
  // configuration section.
  for (const info of deviceInfoList) {
    const rid = info.resourceId;
    const qty = info.qty || 1;
    const tpl = templates[rid];
    // Determine device type: prefer template.type, else product's family
    const baseType = tpl?.type || (info.deviceFamily || '').toLowerCase();
    if (!baseType) {
      continue; // cannot classify device, skip creating config
    }
    for (let idx = 1; idx <= qty; idx++) {
      const key = qty > 1 ? `${rid}-${idx}` : rid;
      if (tpl) {
        const clone = JSON.parse(JSON.stringify(tpl));
        clone.type = baseType;
        clone.displayName = info.displayName;
        deviceConfigs[key] = clone;
      } else {
        // create placeholder configuration for devices without a template
        deviceConfigs[key] = {
          type: baseType,
          displayName: info.displayName,
          sections: [
            {
              title: 'Custom Configuration',
              fields: [
                { label: 'Configuration', value: '' },
              ],
            },
          ],
        };
      }
    }
  }

  // Fill out the wizard data by copying the template and overriding
  const wizardData = JSON.parse(JSON.stringify(template));
  wizardData.equipmentBreakdown = equipmentBreakdown;
  wizardData.equipmentSubtotal = equipmentSubtotal;
  // retain installationServices from template or default to 0
  const installFee = wizardData.installationServices || 0;
  wizardData.totalOrderValue = equipmentSubtotal + installFee;
  wizardData.requiredEquipment = requiredEquipment;
  wizardData.allocatedEquipment = [];
  // attach deviceConfigs to the wizard data
  wizardData.deviceConfigs = deviceConfigs;

  return wizardData;
}

export default {
  generateWizardData,
};