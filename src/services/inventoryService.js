// Inventory service for demonstration purposes.  Loads a static
// inventory JSON file and exposes helpers to view and allocate
// stock.  Inventory is cached in localStorage under the key
// `inventory`.  All mutations persist back into localStorage.

/* eslint-disable no-console */

/**
 * Load the inventory from `/data/inventory.json` into localStorage
 * unless it already exists.  The JSON file should be an array of
 * objects with `sku`, `name` and `stock` properties.
 */
export async function loadInventory() {
  const stored = localStorage.getItem('inventory');
  if (stored) return;
  try {
    const res = await fetch('/data/inventory.json');
    if (!res.ok) throw new Error('Failed to fetch inventory data');
    const data = await res.json();
    localStorage.setItem('inventory', JSON.stringify(data));
  } catch (err) {
    console.error('inventoryService.loadInventory:', err);
  }
}

/**
 * Retrieve the current inventory array.  If the inventory has not
 * been loaded yet this returns undefined.
 */
export function getInventory() {
  const stored = localStorage.getItem('inventory');
  if (!stored) return undefined;
  try {
    return JSON.parse(stored);
  } catch (err) {
    console.error('inventoryService.getInventory:', err);
    return undefined;
  }
}

/**
 * Return the available stock count for a given item name.  Returns
 * undefined if the item is not present.  Case sensitive.
 */
export function getAvailableStock(name) {
  const inv = getInventory();
  if (!inv) return undefined;
  const item = inv.find((i) => i.name === name);
  return item ? item.stock : undefined;
}

/**
 * Allocate quantity of an item.  If sufficient stock exists the
 * stock is reduced and the function returns true.  If not enough
 * stock, returns false and leaves the stock unchanged.
 */
export function allocateItem(name, qty) {
  const inv = getInventory();
  if (!inv) return false;
  const item = inv.find((i) => i.name === name);
  if (!item) return false;
  if (item.stock >= qty) {
    item.stock -= qty;
    localStorage.setItem('inventory', JSON.stringify(inv));
    return true;
  }
  return false;
}

/**
 * Release quantity of an item back into stock.  Useful if an
 * allocation is cancelled.
 */
export function releaseItem(name, qty) {
  const inv = getInventory();
  if (!inv) return;
  const item = inv.find((i) => i.name === name);
  if (!item) return;
  item.stock += qty;
  localStorage.setItem('inventory', JSON.stringify(inv));
}

/**
 * Add a new inventory item or update stock for an existing SKU.
 * Accepts an object with `sku`, `name` and `stock` fields.  If
 * an entry with the same SKU already exists its name and stock
 * will be overwritten.  Persists the updated list to localStorage.
 * @param {{sku:string,name:string,stock:number}} item
 */
export function addInventoryItem(item) {
  if (!item || !item.sku) return;
  const inv = getInventory() || [];
  const idx = inv.findIndex((i) => i.sku === item.sku);
  if (idx > -1) {
    inv[idx] = { ...inv[idx], ...item };
  } else {
    inv.push({ sku: item.sku, name: item.name || '', stock: item.stock || 0 });
  }
  localStorage.setItem('inventory', JSON.stringify(inv));
}

/**
 * Update an existing inventory record identified by SKU.  Only
 * provided fields are modified.  Persists changes to localStorage.
 * @param {string} sku
 * @param {{name?:string,stock?:number,sku?:string}} changes
 */
export function updateInventoryItem(sku, changes) {
  const inv = getInventory();
  if (!inv) return;
  const idx = inv.findIndex((i) => i.sku === sku);
  if (idx > -1) {
    inv[idx] = { ...inv[idx], ...changes };
    localStorage.setItem('inventory', JSON.stringify(inv));
  }
}

/**
 * Delete an inventory record by SKU.  Persists the updated list.
 * @param {string} sku
 */
export function deleteInventoryItem(sku) {
  const inv = getInventory();
  if (!inv) return;
  const idx = inv.findIndex((i) => i.sku === sku);
  if (idx > -1) {
    inv.splice(idx, 1);
    localStorage.setItem('inventory', JSON.stringify(inv));
  }
}


// Default export combining helpers for convenience
export default {
  loadInventory,
  getInventory,
  getAvailableStock,
  allocateItem,
  releaseItem,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};