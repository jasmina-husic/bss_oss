/*
 * Extended orderService.js
 *
 * This version enhances the existing order service with support for
 * per-offering workflows and per-product provisioning tasks.  Each
 * offering references a workflow via `workflowId`, and products
 * define their own `sequence` of realisation steps (e.g. procure,
 * install, enable).  When creating a new order via `addOrder`, the
 * service looks up the selected offering, copies its workflow id and
 * activation sequence, and generates a `provisioning` array.  The
 * provisioning array contains one entry per product step with a
 * status of `pending`.  Seeded orders loaded from `orders.json` may
 * already include workflowId and provisioning arrays and are
 * preserved.  For backwards compatibility the activationSequence and
 * activationIndex fields remain on the order record but may be
 * unused by newer UI components.
 */

import { fetchOfferingsPage, getOfferingById } from "./offeringService.js";
import { fetchProductsPage, getProductById } from "./productService.js";

const LS = "bss_orders";
let cache = null;

/* Save helper */
function save() {
  localStorage.setItem(LS, JSON.stringify(cache));
}

/*
 * Seed default orders if cache is empty.  We preserve any
 * activationSequence defined in the JSON seed to allow orders to
 * carry their configured workflow.  Missing createdAt timestamps
 * are assigned a default ISO value.
 */
async function seedIfEmpty() {
  if (cache.length) return; // already seeded
  try {
    const res = await fetch("/data/orders.json");
    if (!res.ok) return;
    const seed = await res.json();
    if (Array.isArray(seed) && seed.length) {
      seed.forEach((o) => {
        // Ensure createdAt exists for sorting/history; default to now
        if (!o.createdAt) {
          o.createdAt = new Date().toISOString();
        }
        cache.push({ ...o });
      });
      save();
    }
  } catch {
    // ignore network errors
  }
}

/* Load orders from LocalStorage and seed if necessary */
async function load() {
  if (cache) return cache;
  const stored = localStorage.getItem(LS);
  cache = stored ? JSON.parse(stored) : [];
  await seedIfEmpty();
  return cache;
}

/* Queries */
export async function fetchOrders() {
  // Return a shallow copy of cached orders with a computed total value
  const list = await load();
  return list.map((o) => {
    // Compute total value from line items if available
    let totalValue = 0;
    if (Array.isArray(o.items) && o.items.length) {
      totalValue = o.items.reduce((sum, it) => sum + (it.total || 0), 0);
    }
    // Compute days remaining until due date, if a dueDate is defined
    let daysRemaining;
    if (o.dueDate) {
      const due = new Date(o.dueDate);
      if (!Number.isNaN(due.getTime())) {
        const diffMs = due.getTime() - Date.now();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }
    }
    return { ...o, totalValue, daysRemaining };
  });
}

export async function searchOrders(term = "") {
  term = term.toLowerCase();
  const list = await fetchOrders();
  return list.filter((o) => {
    const idMatch = ("" + o.id).includes(term);
    const contractMatch = (o.contractNumber || "").toLowerCase().includes(term);
    const customerMatch = (o.customerName || "").toLowerCase().includes(term);
    return idMatch || contractMatch || customerMatch;
  });
}

export async function getOrderById(id) {
  await load();
  return cache.find((o) => o.id === id) || null;
}

/* Mutations */
export async function addOrder(o) {
  await load();
  const id = Math.max(0, ...cache.map((x) => x.id)) + 1;
  // Determine workflow, activation sequence and provisioning based on the selected offering.
  let activationSequence = [];
  let workflowId = null;
  let provisioning = [];
  try {
    // prime caches so lookup functions return data
    await fetchOfferingsPage(0, 1);
    await fetchProductsPage(0, 1);
    const offId = Number(o.offeringId);
    if (!Number.isNaN(offId) && offId > 0) {
      const offering = getOfferingById(offId);
      if (offering) {
        // copy activation sequence if defined on the offering
        if (Array.isArray(offering.activationSequence)) {
          activationSequence = [...offering.activationSequence];
        }
        // copy workflow id if present
        if (offering.workflowId !== undefined) {
          workflowId = offering.workflowId;
        }
        // generate provisioning tasks for each component/product
        if (Array.isArray(offering.components)) {
          offering.components.forEach((comp) => {
            const pid = comp.productId;
            const product = getProductById(pid);
            if (!product) return;
            const seq = Array.isArray(product.sequence) ? product.sequence : [];
            seq.forEach((stepName, idx) => {
              provisioning.push({
                productId: pid,
                sku: product.sku,
                stepName,
                sequence: idx + 1,
                status: 'pending',
              });
            });
          });
        }
      }
    }
  } catch {
    // leave values at defaults if lookups fail
  }
  // Build the new order with derived workflow and provisioning.  Attach
  // activationSequence and activationIndex for backward compatibility.
  const newOrder = {
    ...o,
    id,
    comments: [],
    workflowId,
    provisioning,
    activationSequence,
    activationIndex: 0,
    createdAt: new Date().toISOString(),
  };
  if (!newOrder.status) newOrder.status = 'draft';
  cache.push(newOrder);
  save();
  return id;
}

export async function updateOrder(id, patch) {
  await load();
  const i = cache.findIndex((o) => o.id === id);
  if (i > -1) {
    cache[i] = {
      ...cache[i],
      ...patch,
      lastModified: new Date().toISOString(),
    };
    save();
  }
}

export async function addComment(id, text, stage) {
  await load();
  const ord = cache.find((o) => o.id === id);
  if (!ord) return;
  if (!Array.isArray(ord.comments)) ord.comments = [];
  ord.comments.push({ text, stage, date: new Date().toISOString() });
  save();
}

export function isBillable(order) {
  return ["delivery", "closed"].includes(order.stage);
}