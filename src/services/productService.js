/* Product service with bullet-proof, column-agnostic sorting */

import { nextId } from "../utils/id";

const LS = "bss_products";
let cache = null;

/* ───────── helpers ───────── */
const norm = (r) => ({
  ...r,
  id: r.id ?? nextId(cache ?? []),
  createdAt: r.createdAt ?? new Date().toISOString(),
  lastModified: r.lastModified ?? new Date().toISOString(),
});

const save = () => localStorage.setItem(LS, JSON.stringify(cache));

async function load() {
  if (cache) return cache;
  const stored = localStorage.getItem(LS);
  cache = stored
    ? JSON.parse(stored).map(norm)
    : (await (await fetch("/data/products.json")).json()).map(norm);
  save();
  return cache;
}

/* generic, null-safe sorter -------------------------------- */
function applySort(data, sorting = []) {
  /* nothing to sort */
  if (!Array.isArray(sorting) || !sorting.length) return data;

  const first   = sorting[0];
  const key     = first.id ?? first.columnId; /* tolerate either prop name */
  const desc    = !!first.desc;

  return [...data].sort((a, b) => {
    const av = (a[key] ?? "").toString();
    const bv = (b[key] ?? "").toString();
    const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
    return desc ? -cmp : cmp;
  });
}

/* ───────── paged list ───────── */
export async function fetchProductsPage(
  pageIndex     = 0,
  pageSize      = 10,
  globalFilter  = "",
  sorting       = []      // default = []
) {
  let data = await load();

  /* filter */
  if (globalFilter) {
    const f = globalFilter.toLowerCase();
    data = data.filter((p) =>
      Object.values(p).some((v) => v.toString().toLowerCase().includes(f))
    );
  }

  /* sort safely */
  data = applySort(data, sorting);

  const total = data.length;
  const start = pageIndex * pageSize;
  return { records: data.slice(start, start + pageSize), total };
}

/* legacy alias for older imports */
export const fetchSpecsPage = fetchProductsPage;

/* ───────── CRUD ───────── */
export function getProductById(id) {
  return cache?.find((x) => x.id === id) || null;
}

export async function addProduct(rec) {
  await load();
  cache.push(norm(rec));
  save();
}

export async function updateProduct(id, rec) {
  await load();
  const i = cache.findIndex((x) => x.id === id);
  if (i > -1) {
    cache[i] = { ...cache[i], ...rec, id, lastModified: new Date().toISOString() };
    save();
  }
}

export async function deleteProduct(idx) {
  await load();
  cache.splice(idx, 1);
  save();
}
