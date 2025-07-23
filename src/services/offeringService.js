import { nextId } from "../utils/id";

const LS = "bss_offerings";
let cache = null;

/* normaliser */
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
    : (await (await fetch("/data/offerings.json")).json()).map(norm);
  save();
  return cache;
}

/* robust column-agnostic sort */
function applySort(data, sorting = []) {
  if (!Array.isArray(sorting) || !sorting.length) return data;
  const first = sorting[0];
  const key   = first.id ?? first.columnId; // allow either field name
  const desc  = !!first.desc;

  return [...data].sort((a, b) => {
    const av = (a[key] ?? "").toString();
    const bv = (b[key] ?? "").toString();
    const cmp = av.localeCompare(bv, undefined, {
      numeric: true,
      sensitivity: "base",
    });
    return desc ? -cmp : cmp;
  });
}

/* ───── paged list ───── */
export async function fetchOfferingsPage(
  pageIndex    = 0,
  pageSize     = 10,
  globalFilter = "",
  sorting      = [],
  statusFilter = ""
) {
  let data = await load();

  if (statusFilter) data = data.filter((o) => o.status === statusFilter);

  if (globalFilter) {
    const f = globalFilter.toLowerCase();
    data = data.filter((o) =>
      Object.values(o).some((v) => v.toString().toLowerCase().includes(f))
    );
  }

  data = applySort(data, sorting);

  const total = data.length;
  const start = pageIndex * pageSize;
  return { records: data.slice(start, start + pageSize), total };
}

/* CRUD helpers */
export const getOfferingById = (id) =>
  cache?.find((o) => o.id === id) || null;

export async function addOffering(rec) {
  await load();
  cache.push(norm(rec));
  save();
}

export async function updateOffering(id, rec) {
  await load();
  const i = cache.findIndex((o) => o.id === id);
  if (i > -1) {
    cache[i] = {
      ...cache[i],
      ...rec,
      id,
      lastModified: new Date().toISOString(),
    };
    save();
  }
}

export async function deleteOffering(id) {
  await load();
  const index = cache.findIndex((o) => o.id === id);
  if (index > -1) {
    cache.splice(index, 1);
    save();
  }
}
