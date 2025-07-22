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

/* Seed default orders if cache is empty.  Adds createdAt if missing. */
async function seedIfEmpty() {
  if (cache.length) return; // already seeded
  try {
    const res = await fetch("/data/orders.json");
    if (!res.ok) return;
    const seed = await res.json();
    if (Array.isArray(seed) && seed.length) {
      seed.forEach((o) => {
        if (!o.createdAt) {
          // assign a default timestamp if missing
          o.createdAt = new Date().toISOString();
        }
      });
      cache.push(...seed);
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
  return [...(await load())];
}

export async function searchOrders(term = "") {
  term = term.toLowerCase();
  return (await load()).filter(
    (o) =>
      ("" + o.id).includes(term) ||
      (o.contractNumber || "").toLowerCase().includes(term)
  );
}

export async function getOrderById(id) {
  await load();
  return cache.find((o) => o.id === id) || null;
}

/* Mutations */
export async function addOrder(o) {
  await load();
  const id = Math.max(0, ...cache.map((x) => x.id)) + 1;
  const newOrder = {
    ...o,
    id,
    comments: [],
    activationIndex: 0,
    createdAt: new Date().toISOString(),
  };
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