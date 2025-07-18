
const STORAGE_KEY = 'bss_customers';

/* ─── helpers ─────────────────── */
function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function nextId(data) {
  return data.length ? Math.max(...data.map((c) => c.id || 0)) + 1 : 1;
}

/* ─── CRUD ────────────────────── */
export function getAll() {
  return load();
}

export function getCustomerById(id) {
  return load().find((c) => c.id === Number(id));
}

export function addCustomer(record) {
  const data = load();
  record.id = record.id ? Number(record.id) : nextId(data);
  data.push(record);
  save(data);
  return record;
}

export function updateCustomer(id, patch) {
  const data = load();
  const idx = data.findIndex((c) => c.id === Number(id));
  if (idx !== -1) {
    data[idx] = { ...data[idx], ...patch, id: Number(id) };
    save(data);
  }
}

export function deleteCustomer(id) {
  const data = load().filter((c) => c.id !== Number(id));
  save(data);
}

/* ─── Paging, search & sort ───── */
function applyGlobalFilter(records, filter = '') {
  if (!filter.trim()) return records;
  const q = filter.toLowerCase();
  return records.filter((r) =>
    ['name', 'email', 'company', 'phone', 'industry', 'accountManager', 'state']
      .some((k) => (r[k] || '').toString().toLowerCase().includes(q))
  );
}

function applySorting(records, sorting = []) {
  if (!sorting.length) return records;
  const [{ id, desc }] = sorting;
  return [...records].sort((a, b) => {
    const av = (a[id] ?? '').toString().toLowerCase();
    const bv = (b[id] ?? '').toString().toLowerCase();
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
}

/**
 * fetchCustomersPage
 * @param {number} pageIndex 0‑based page
 * @param {number} pageSize  items per page
 * @param {string} globalFilter free‑text search
 * @param {Array<{id:string,desc:boolean}>} sorting
 * @returns {{records:Array, total:number}}
 */
export function fetchCustomersPage(pageIndex, pageSize, globalFilter = '', sorting = []) {
  let records = load();
  records = applyGlobalFilter(records, globalFilter);
  records = applySorting(records, sorting);
  const total = records.length;
  const start = pageIndex * pageSize;
  const sliced = records.slice(start, start + pageSize);
  return { records: sliced, total };
}
