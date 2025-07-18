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

// Default export combining helpers for convenience
export default {
  loadInventory,
  getInventory,
  getAvailableStock,
  allocateItem,
  releaseItem,
};