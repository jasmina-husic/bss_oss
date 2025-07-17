/* Ticket service – with safe, column-agnostic sorting */

const LS = "bss_tickets";
let cache = null;
let nextId = 1;

/* ───────── helpers ───────── */
function norm(r) {
  return {
    id:           r.id ?? nextId++,
    customerId:   r.customerId ?? 0,
    title:        r.title ?? "",
    status:       r.status ?? "Open",
    priority:     r.priority ?? "Medium",
    owner:        r.owner ?? "",
    createdAt:    r.createdAt ?? new Date().toISOString(),
    lastModified: r.lastModified ?? new Date().toISOString(),
  };
}
const save = () => localStorage.setItem(LS, JSON.stringify(cache));

async function load() {
  if (cache) return cache;
  const stored = localStorage.getItem(LS);
  cache = stored
    ? JSON.parse(stored).map(norm)
    : (await (await fetch("/data/tickets.json")).json()).map(norm);
  nextId = Math.max(0, ...cache.map((t) => t.id)) + 1;
  save();
  return cache;
}

/* column-agnostic sorter */
function applySort(data, sorting = []) {
  if (!Array.isArray(sorting) || !sorting.length) return data;

  const first = sorting[0];
  const key   = first.id ?? first.columnId;   // tolerate either prop
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

/* ───────── paged list ───────── */
export async function fetchTicketsPage(
  pageIndex    = 0,
  pageSize     = 10,
  search       = "",
  sorting      = [],      // default prevents undefined
  customerId   = null
) {
  let data = await load();

  if (customerId) data = data.filter((t) => t.customerId === customerId);

  if (search) {
    const f = search.toLowerCase();
    data = data.filter((t) =>
      Object.values(t).some((v) => v.toString().toLowerCase().includes(f))
    );
  }

  data = applySort(data, sorting);

  const total = data.length;
  const start = pageIndex * pageSize;
  return { records: data.slice(start, start + pageSize), total };
}

/* ───────── CRUD helpers ───────── */
export const getTicketById = (id) => cache?.find((t) => t.id === id) || null;

export async function addTicket(rec) {
  await load();
  cache.push(norm(rec));
  save();
}

export async function updateTicket(id, rec) {
  await load();
  const i = cache.findIndex((t) => t.id === id);
  if (i > -1) {
    cache[i] = { ...cache[i], ...rec, id, lastModified: new Date().toISOString() };
    save();
  }
}

export async function deleteTicket(idx) {
  await load();
  cache.splice(idx, 1);
  save();
}
