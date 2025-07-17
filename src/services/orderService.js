const LS = "bss_orders";
let cache = null;

/* ① Save helper */
function save() {
  localStorage.setItem(LS, JSON.stringify(cache));
}

/* ② NEW – seed from /data/orders.json the first time */
async function seedIfEmpty() {
  if (cache.length) return; // already has data
  try {
    const res = await fetch("/data/orders.json");
    if (!res.ok) return;
    const seed = await res.json();
    if (Array.isArray(seed) && seed.length) {
      cache.push(...seed);
      save(); // persist to LocalStorage for next load
    }
  } catch {
    /* ignore network errors – run with empty cache */
  }
}

async function load() {
  if (cache) return cache;
  const stored = localStorage.getItem(LS);
  cache = stored ? JSON.parse(stored) : [];
  await seedIfEmpty();        // ← auto-populate if empty
  return cache;
}
/* ───────── queries ───────── */
export async function fetchOrders() {
  return [...await load()];
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

/* ───────── mutations ───────── */
export async function addOrder(o) {
  await load();
  const id = Math.max(0, ...cache.map((x) => x.id)) + 1;
  cache.push({
    ...o,
    id,
    comments: [],
    activationIndex: 0,
    createdAt: new Date().toISOString(),
  });
  save();
  return id;
}

export async function updateOrder(id, patch) {
  await load();
  const i = cache.findIndex((o) => o.id === id);
  if (i > -1) {
    cache[i] = { ...cache[i], ...patch, lastModified: new Date().toISOString() };
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
