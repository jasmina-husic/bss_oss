// Updated Order Wizard Service supporting per-order wizard data and ESM import of inventoryService

/* eslint-disable no-console */

// This service manages wizard data on a per-order basis. For each order
// created with the Spring Promo Bundle, a copy of the base template
// (order_wizard_data.json) is stored under the key
// `orderWizardData_<orderId>`. Use `initWizardForOrder(orderId)` to
// ensure the data is loaded/cached before rendering the wizard.

import inventoryService from './inventoryService.js';

let currentOrderId = null;

/**
 * Construct the storage key for a given order. If no id is passed, fall
 * back to a default key `orderWizardData` for backward compatibility.
 * @param {number|string} [id]
 */
function keyFor(id) {
  return id ? `orderWizardData_${id}` : 'orderWizardData';
}

/**
 * Load the base wizard template from `/data/order_wizard_data.json`. Returns
 * the parsed object.
 */
async function loadTemplate() {
  const res = await fetch('/data/order_wizard_data.json');
  if (!res.ok) throw new Error('Failed to fetch order wizard template');
  const data = await res.json();
  return data;
}

/**
 * Initialise wizard data for a given order id. If data is already
 * present in localStorage this is a no-op. Sets `currentOrderId`.
 * @param {number|string} id
 */
export async function initWizardForOrder(id) {
  currentOrderId = id;
  const key = keyFor(id);
  const stored = localStorage.getItem(key);
  if (stored) return;
  try {
    const template = await loadTemplate();
    localStorage.setItem(key, JSON.stringify(template));
  } catch (err) {
    console.error('orderWizardService.initWizardForOrder:', err);
  }
}

/**
 * Set the current order id. Use when rendering the wizard so that
 * subsequent helper calls know which record to update.
 * @param {number|string} id
 */
export function setCurrentOrderId(id) {
  currentOrderId = id;
}

/**
 * Retrieve the wizard data synchronously for the current order. Returns
 * undefined if not loaded. Call `initWizardForOrder` beforehand.
 */
export function getCurrentOrder() {
  const key = keyFor(currentOrderId);
  const stored = localStorage.getItem(key);
  if (!stored) return undefined;
  try {
    return JSON.parse(stored);
  } catch (err) {
    console.error('orderWizardService.getCurrentOrder:', err);
    return undefined;
  }
}

/**
 * Persist the wizard data for the current order back to localStorage.
 * @param {object} data
 */
function saveCurrentOrder(data) {
  const key = keyFor(currentOrderId);
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Overwrite wizard data for a specific order id.  This function is
 * useful when generating wizard data dynamically (e.g. via the
 * fulfillmentService).  It sets the current order id and then
 * persists the provided data under the appropriate key.
 * @param {number|string} id
 * @param {object} data
 */
export function setWizardData(id, data) {
  const key = keyFor(id);
  currentOrderId = id;
  localStorage.setItem(key, JSON.stringify(data));
}

// ----- Generic update helpers -----

export function updateDeploymentLocation(key, value) {
  const data = getCurrentOrder();
  if (!data || !data.deploymentLocations) return;
  if (!(key in data.deploymentLocations)) return;
  data.deploymentLocations[key] = value;
  saveCurrentOrder(data);
}

export function updateProjectTimeline(key, value) {
  const data = getCurrentOrder();
  if (!data || !data.projectTimeline) return;
  if (!(key in data.projectTimeline)) return;
  data.projectTimeline[key] = value;
  saveCurrentOrder(data);
}

export function updateAllocationNotes(notes) {
  const data = getCurrentOrder();
  if (!data) return;
  data.allocationNotes = Array.isArray(notes) ? notes : [];
  saveCurrentOrder(data);
}

/**
 * Allocate an equipment item by name for the current order. Uses
 * inventoryService to reduce stock. Returns true if allocation
 * succeeded, false if not enough stock.
 * @param {string} name
 */
export function allocateEquipmentItem(name) {
  const data = getCurrentOrder();
  if (!data || !Array.isArray(data.requiredEquipment)) return false;
  const item = data.requiredEquipment.find((i) => i.name === name);
  if (!item) return false;
  const qty = item.need || 1;
  const ok = inventoryService.allocateItem(name, qty);
  if (ok) {
    item.status = 'Allocated';
    if (!Array.isArray(data.allocatedEquipment)) data.allocatedEquipment = [];
    if (!data.allocatedEquipment.some((i) => i.name === name)) {
      data.allocatedEquipment.push({ name, status: 'Allocated' });
    }
    saveCurrentOrder(data);
    return true;
  }
  item.status = 'Not Available';
  saveCurrentOrder(data);
  return false;
}

export function startTest(category, testName) {
  const data = getCurrentOrder();
  if (!data || !Array.isArray(data[category])) return;
  const test = data[category].find((t) => t.test === testName);
  if (test) {
    test.status = 'Running';
    saveCurrentOrder(data);
  }
}

export function resetTest(category, testName) {
  const data = getCurrentOrder();
  if (!data || !Array.isArray(data[category])) return;
  const test = data[category].find((t) => t.test === testName);
  if (test) {
    test.status = 'Pending';
    saveCurrentOrder(data);
  }
}

export function updateTimelineStage(index, status) {
  const data = getCurrentOrder();
  if (!data || !Array.isArray(data.deploymentTimeline)) return;
  const item = data.deploymentTimeline[index];
  if (item) {
    item.status = status;
    saveCurrentOrder(data);
  }
}

/**
 * Update a nested device configuration field.  Device configs are
 * stored under wizardData.deviceConfigs[resourceId]. Each config
 * contains an array of sections, and each section has an array of
 * fields.  This function updates the value of a particular field
 * given its indices.
 *
 * @param {string} resourceId Normalised resource identifier
 * @param {number} sectionIndex Index of the section in the template
 * @param {number} fieldIndex Index of the field within the section
 * @param {string} value New value for the field
 */
export function updateDeviceConfig(resourceId, sectionIndex, fieldIndex, value) {
  const data = getCurrentOrder();
  if (!data || !data.deviceConfigs) return;
  const cfg = data.deviceConfigs[resourceId];
  if (!cfg || !Array.isArray(cfg.sections)) return;
  const sect = cfg.sections[sectionIndex];
  if (!sect || !Array.isArray(sect.fields)) return;
  const fld = sect.fields[fieldIndex];
  if (!fld) return;
  fld.value = value;
  saveCurrentOrder(data);
}

export function updateValidationStatus(section, index, status) {
  const data = getCurrentOrder();
  if (!data || !Array.isArray(data[section])) return;
  const item = data[section][index];
  if (item) {
    item.status = status;
    saveCurrentOrder(data);
  }
}

// default export for convenience
export async function getWizardData() {
  return getCurrentOrder();
}

export default {
  getWizardData,
  initWizardForOrder,
  setCurrentOrderId,
  getCurrentOrder,
  updateDeploymentLocation,
  updateProjectTimeline,
  updateAllocationNotes,
  allocateEquipmentItem,
  startTest,
  resetTest,
  updateTimelineStage,
  updateValidationStatus,
  setWizardData,
};
