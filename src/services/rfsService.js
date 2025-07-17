/* RFS service */

const LS = "bss_rfs";
let cache = null;
let nextId = 1;

/* ───── helpers ───── */
const norm = (r) => ({
  id: r.id ?? nextId++,
  name: r.name ?? "",
  type: r.type ?? "",
  category: r.category ?? "",
  spec: r.spec ?? "",
  createdAt: r.createdAt ?? new Date().toISOString(),
  lastModified: r.lastModified ?? new Date().toISOString(),
});

const save = () => localStorage.setItem(LS, JSON.stringify(cache));

async function load() {
  if (cache) return cache;
  const stored = localStorage.getItem(LS);
  cache = stored
    ? JSON.parse(stored).map(norm)
    : (await (await fetch("/data/rfs.json")).json()).map(norm);
  nextId = Math.max(0, ...cache.map((x) => x.id)) + 1;
  save();
  return cache;
}

/* column-agnostic sort */
function applySort(data, sorting = []) {
  if (!Array.isArray(sorting) || !sorting.length) return data;
  const { id: key = null, columnId = null, desc = false } = sorting[0] ?? {};
  if (!key && !columnId) return data;
  const col = key ?? columnId;
  return [...data].sort((a, b) => {
    const cmp = (a[col] ?? "").toString().localeCompare(
      (b[col] ?? "").toString(),
      undefined,
      { numeric: true, sensitivity: "base" }
    );
    return desc ? -cmp : cmp;
  });
}

/* ───── paged list ───── */
export async function fetchRfsPage(
  pageIndex = 0,
  pageSize  = 10,
  globalFilter = "",
  sorting      = []
) {
  let data = await load();

  if (globalFilter) {
    const f = globalFilter.toLowerCase();
    data = data.filter((x) =>
      Object.values(x).some((v) => v.toString().toLowerCase().includes(f))
    );
  }

  data = applySort(data, sorting);

  const total = data.length;
  const start = pageIndex * pageSize;
  return { records: data.slice(start, start + pageSize), total };
}

/* CRUD helpers */
export const getRfsById = (id) => cache?.find((x) => x.id === id) || null;
export async function addRfs(rec) {
  await load();
  cache.push(norm(rec));
  save();
}
export async function updateRfs(id, rec) {
  await load();
  const i = cache.findIndex((x) => x.id === id);
  if (i > -1) {
    cache[i] = { ...cache[i], ...rec, id, lastModified: new Date().toISOString() };
    save();
  }
}
export async function deleteRfs(idx) {
  await load();
  cache.splice(idx, 1);
  save();
}
