/*
 * orderService.js
 *
 * Provides functions to load, query, and mutate orders stored in
 * LocalStorage.  This version gracefully handles missing createdAt
 * timestamps by assigning a default ISO date when seeding data.
 */

const LS = "bss_orders";
let cache = null;

/* Save helper */
function save() {
  localStorage.setItem(LS, JSON.stringify(cache));
}

/*
 * Seed default orders if cache is empty.
 *
 * Orders stored in `public/data/orders.json` contain rich fields such as
 * customerName, status, dueDate and an array of item lines.  When
 * seeding we preserve these fields and assign sensible defaults for
 * missing timestamps.  We do **not** mutate or strip any properties
 * provided by the seed to allow downstream code to access them (e.g.
 * for provisioning queue rendering).
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
        // When seeding we do not compute derived values; these will
        // be calculated on demand in fetchOrders().
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
    return { ...o, totalValue };
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
  // Preserve explicit fields passed in; assign createdAt and default
  // status/dueDate if not provided.
  const newOrder = {
    ...o,
    id,
    comments: [],
    activationIndex: 0,
    createdAt: new Date().toISOString(),
  };
  // If a customerId is provided but no customerName, leave blank – UI
  // can look up names.
  if (!newOrder.status) newOrder.status = "draft";
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