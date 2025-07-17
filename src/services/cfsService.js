const LS = "bss_cfs";
let cache = null;
let nextId = 1;

/* helpers */
const norm = (r) => ({
  id: r.id ?? nextId++,
  name: r.name ?? "",
  category: r.category ?? "",
  description: r.description ?? "",
  rfsIds: r.rfsIds ?? [],
  createdAt: r.createdAt ?? new Date().toISOString(),
  lastModified: r.lastModified ?? new Date().toISOString(),
});
const save = () => localStorage.setItem(LS, JSON.stringify(cache));
async function load() {
  if (cache) return cache;
  const stored = localStorage.getItem(LS);
  cache = stored
    ? JSON.parse(stored).map(norm)
    : (await (await fetch("/data/cfs.json")).json()).map(norm);
  nextId = Math.max(0, ...cache.map((x) => x.id)) + 1;
  save();
  return cache;
}
const applySort = (d, s = []) =>
  !s.length
    ? d
    : [...d].sort((a, b) => {
        const { id: k = null, columnId = null, desc = false } = s[0] ?? {};
        const col = k ?? columnId;
        const cmp = (a[col] ?? "")
          .toString()
          .localeCompare((b[col] ?? "").toString(), undefined, {
            numeric: true,
            sensitivity: "base",
          });
        return desc ? -cmp : cmp;
      });

export async function fetchCfsPage(
  pageIndex = 0,
  pageSize = 10,
  q = "",
  sorting = []
) {
  let data = await load();
  if (q) {
    const f = q.toLowerCase();
    data = data.filter((x) => Object.values(x).some((v) => v.toString().toLowerCase().includes(f)));
  }
  data = applySort(data, sorting);
  const total = data.length;
  const start = pageIndex * pageSize;
  return { records: data.slice(start, start + pageSize), total };
}

/* CRUD stubs */
export const getCfsById = (id) => cache?.find((x) => x.id === id) || null;
export const addCfs     = async (r) => { await load(); cache.push(norm(r)); save(); };
export const updateCfs  = async (id, r) => { await load(); const i=cache.findIndex(x=>x.id===id); if(i>-1){cache[i]={...cache[i],...r,id,lastModified:new Date().toISOString()};save();}};
export const deleteCfs  = async (idx) => { await load(); cache.splice(idx,1); save(); };
