/* Customer service with resilient, column‑agnostic sorting and
 * automatic seeding from the public/data/customers.json file.
 *
 * This version restores the original asynchronous behaviour from the initial
 * commit. It will load from localStorage if available; otherwise it
 * fetches the seed data from `/data/customers.json`, normalises it, and
 * persists it back to localStorage. All CRUD operations are asynchronous
 * and return Promises, so callers can use `.then(...)` or `await` as
 * needed. Sorting, filtering and paging mimic the initial implementation.
 */

const LS = 'bss_customers';
let cache = null;
let nextId = 1;

/* ────── helpers ────── */
const uuid = () => 'ACC-' + ('' + Date.now()).slice(-6);

/**
 * Normalise a raw customer record into a complete object with default
 * fields. This ensures that all values exist and that the id/crmId are
 * assigned if missing. The helper also bumps the global `nextId` so
 * subsequent inserts receive sequential identifiers.
 */
function norm(r) {
  return {
    id: r.id ?? nextId++,
    crmId: r.crmId ?? uuid(),
    name: r.name ?? '',
    email: r.email ?? '',
    company: r.company ?? '',
    type: r.type ?? '',
    industry: r.industry ?? '',
    annualRevenue: r.annualRevenue ?? 0,
    phone: r.phone ?? '',
    fax: r.fax ?? '',
    website: r.website ?? '',
    billingStreet: r.billingStreet ?? '',
    billingCity: r.billingCity ?? '',
    billingState: r.billingState ?? '',
    billingPostalCode: r.billingPostalCode ?? '',
    billingCountry: r.billingCountry ?? '',
    shippingStreet: r.shippingStreet ?? '',
    shippingCity: r.shippingCity ?? '',
    shippingState: r.shippingState ?? '',
    shippingPostalCode: r.shippingPostalCode ?? '',
    shippingCountry: r.shippingCountry ?? '',
    numberOfEmployees: r.numberOfEmployees ?? 0,
    rating: r.rating ?? '',
    accountManager: r.accountManager ?? '',
    state: r.state ?? 'prospect',
    createdAt: r.createdAt ?? new Date().toISOString(),
    lastModified: r.lastModified ?? new Date().toISOString(),
  };
}

/** Persist the current cache to localStorage */
function save() {
  localStorage.setItem(LS, JSON.stringify(cache));
}

/**
 * Load customers into the in‑memory cache. If the cache is already
 * populated, it is returned immediately. Otherwise this function
 * attempts to load from localStorage; if there is no stored data,
 * it fetches the seed file from `/data/customers.json`. Once the
 * data is loaded, it normalises each record, initialises `nextId`
 * and writes the cache back to localStorage.
 * @returns {Promise<Array>} the array of customer records
 */
async function load() {
  if (cache) return cache;
  const stored = localStorage.getItem(LS);
  if (stored && stored !== '[]') {
    cache = JSON.parse(stored).map(norm);
  } else {
    try {
      const res = await fetch('/data/customers.json');
      const json = await res.json();
      cache = Array.isArray(json) ? json.map(norm) : [];
    } catch (err) {
      console.error('Failed to load seed customers:', err);
      cache = [];
    }
  }
  // determine nextId based on existing ids
  nextId = Math.max(0, ...cache.map((c) => c.id || 0)) + 1;
  save();
  return cache;
}

/* ────── sorting ────── */
function applySort(data, sorting = []) {
  if (!Array.isArray(sorting) || sorting.length === 0) return data;
  const first = sorting[0];
  const key = first.id ?? first.columnId;
  const desc = !!first.desc;
  return [...data].sort((a, b) => {
    const av = (a[key] ?? '').toString();
    const bv = (b[key] ?? '').toString();
    const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
    return desc ? -cmp : cmp;
  });
}

/* ────── API ────── */

/**
 * Fetch a paginated list of customers with optional global filter and sorting.
 * @param {number} pageIndex zero‑based page index
 * @param {number} pageSize number of items per page
 * @param {string} globalFilter free‑text search applied across values
 * @param {Array<{id: string, desc: boolean}>} sorting sorting state
 */
export async function fetchCustomersPage(pageIndex = 0, pageSize = 10, globalFilter = '', sorting = []) {
  let data = await load();
  if (globalFilter) {
    const f = globalFilter.toLowerCase();
    data = data.filter((c) => Object.values(c).some((v) => v.toString().toLowerCase().includes(f)));
  }
  data = applySort(data, sorting);
  const total = data.length;
  const start = pageIndex * pageSize;
  return { records: data.slice(start, start + pageSize), total };
}

/**
 * Return a single customer by id or null if not found. Uses the in‑memory
 * cache (which should already be loaded via fetchCustomersPage or load()).
 * @param {number} id
 */
export function getCustomerById(id) {
  return cache?.find((c) => c.id === id) || null;
}

/**
 * Add a new customer. Assigns an id/crmId if missing and persists the
 * updated cache to localStorage.
 * @param {Object} rec new customer record
 */
export async function addCustomer(rec) {
  await load();
  cache.push(norm(rec));
  save();
}

/**
 * Update an existing customer. If the record exists, merges the patch
 * into it, updates the lastModified timestamp, and persists the change.
 * @param {number} id
 * @param {Object} rec partial record to merge
 */
export async function updateCustomer(id, rec) {
  await load();
  const i = cache.findIndex((c) => c.id === id);
  if (i > -1) {
    cache[i] = { ...cache[i], ...rec, id, lastModified: new Date().toISOString() };
    save();
  }
}

/**
 * Delete a customer by id. Removes the record from the cache and
 * persists the updated list. Returns a Promise to allow callers
 * to chain a `.then(load)` if desired.
 * @param {number} id
 */
export async function deleteCustomer(id) {
  await load();
  const i = cache.findIndex((c) => c.id === id);
  if (i > -1) {
    cache.splice(i, 1);
    save();
  }
}

/**
 * Return a copy of all customers. Primarily for debugging/testing.
 */
export async function getAll() {
  return (await load()).slice();
}

export default {
  fetchCustomersPage,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getAll,
};