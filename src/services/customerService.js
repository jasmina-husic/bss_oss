/* Customer service with resilient, column-agnostic sorting */

const LS = "bss_customers";
let cache = null;
let nextId = 1;

/* ───────── helpers ───────── */
const uuid  = () => "ACC-" + ("" + Date.now()).slice(-6);

const norm = (r) => ({
  id: r.id ?? nextId++,
  crmId: r.crmId ?? uuid(),
  name: r.name ?? "",
  email: r.email ?? "",
  company: r.company ?? "",
  type: r.type ?? "",
  industry: r.industry ?? "",
  annualRevenue: r.annualRevenue ?? 0,
  phone: r.phone ?? "",
  fax: r.fax ?? "",
  website: r.website ?? "",
  billingStreet: r.billingStreet ?? "",
  billingCity: r.billingCity ?? "",
  billingState: r.billingState ?? "",
  billingPostalCode: r.billingPostalCode ?? "",
  billingCountry: r.billingCountry ?? "",
  shippingStreet: r.shippingStreet ?? "",
  shippingCity: r.shippingCity ?? "",
  shippingState: r.shippingState ?? "",
  shippingPostalCode: r.shippingPostalCode ?? "",
  shippingCountry: r.shippingCountry ?? "",
  numberOfEmployees: r.numberOfEmployees ?? 0,
  rating: r.rating ?? "",
  accountManager: r.accountManager ?? "",
  state: r.state ?? "prospect",
  createdAt: r.createdAt ?? new Date().toISOString(),
  lastModified: r.lastModified ?? new Date().toISOString(),
});

const save = () => localStorage.setItem(LS, JSON.stringify(cache));

async function load() {
  if (cache) return cache;
  const stored = localStorage.getItem(LS);
  cache = stored
    ? JSON.parse(stored).map(norm)
    : (await (await fetch("/data/customers.json")).json()).map(norm);

  nextId = Math.max(0, ...cache.map((c) => c.id)) + 1;
  save();
  return cache;
}

/* generic, null-safe sorter */
function applySort(data, sorting = []) {
  if (!Array.isArray(sorting) || !sorting.length) return data;

  const first = sorting[0];
  const key   = first.id ?? first.columnId;
  const desc  = !!first.desc;

  return [...data].sort((a, b) => {
    const av = (a[key] ?? "").toString();
    const bv = (b[key] ?? "").toString();
    const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
    return desc ? -cmp : cmp;
  });
}

/* ───────── paged list ───────── */
export async function fetchCustomersPage(
  pageIndex    = 0,
  pageSize     = 10,
  globalFilter = "",
  sorting      = []     // default prevents undefined
) {
  let data = await load();

  if (globalFilter) {
    const f = globalFilter.toLowerCase();
    data = data.filter((c) =>
      Object.values(c).some((v) =>
        v.toString().toLowerCase().includes(f)
      )
    );
  }

  data = applySort(data, sorting);

  const total = data.length;
  const start = pageIndex * pageSize;
  return { records: data.slice(start, start + pageSize), total };
}

/* ───────── CRUD helpers ───────── */
export function getCustomerById(id) {
  return cache?.find((c) => c.id === id) || null;
}

export async function addCustomer(rec) {
  await load();
  cache.push(norm(rec));
  save();
}

export async function updateCustomer(id, rec) {
  await load();
  const i = cache.findIndex((c) => c.id === id);
  if (i > -1) {
    cache[i] = { ...cache[i], ...rec, id, lastModified: new Date().toISOString() };
    save();
  }
}
export async function deleteCustomer(id) {
  await load();
  const index = cache.findIndex((c) => c.id === id);
  if (index > -1) {
    cache.splice(index, 1);
    save();
  }
}
