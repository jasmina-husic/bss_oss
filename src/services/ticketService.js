/*
 * Extended Ticket service – supports the enriched ticket model used by the
 * upgraded backend.  This implementation preserves the client‑side only
 * behaviour of the original version (using localStorage and seed JSON) but
 * normalises additional fields such as subject, description, submitter and
 * assignee.  It also maps legacy values (e.g. "Open", "Medium") to the
 * new API formats (e.g. "OPEN", "NORMAL") and keeps both title/subject
 * and owner/assignee in sync so that existing UI components continue to work.
 */

const LS = "bss_tickets";
let cache = null;
let nextId = 1;

/* ---------- normalisation helpers ---------- */
function normalizeStatus(status) {
  if (!status) return "NEW";
  const s = status.toString().trim().toUpperCase();
  switch (s) {
    case "NEW":
    case "OPEN":
    case "PENDING":
    case "HOLD":
    case "SOLVED":
    case "CLOSED":
      return s;
    case "IN PROGRESS":
      return "PENDING";
    default:
      return s;
  }
}

function normalizePriority(priority) {
  if (!priority) return "LOW";
  const p = priority.toString().trim().toUpperCase();
  switch (p) {
    case "LOW":
    case "NORMAL":
    case "HIGH":
    case "URGENT":
      return p;
    case "MEDIUM":
      return "NORMAL";
    default:
      return p;
  }
}

/**
 * Convert an arbitrary record into a fully populated ticket with sane
 * defaults.  Ensures that title and subject mirror each other, owner and
 * assignee mirror each other, and that status/priority are normalised.
 * @param {Object} r raw ticket record
 * @returns {Object} normalised ticket
 */
function norm(r) {
  const id = r.id ?? nextId++;
  const dsId = r.dsId ?? "";
  // derive customer/requester IDs; fall back to requester for legacy records
  const customerId = r.customerId ?? r.requesterId ?? 0;
  const customerCrmId = r.customerCrmId ?? "";
  const requesterId = r.requesterId ?? customerId;
  // unify title and subject fields
  const title = r.title ?? r.subject ?? "";
  const subject = r.subject ?? title;
  const description = r.description ?? subject;
  // map status/priority to new values
  const status = normalizeStatus(r.status ?? r.Status);
  const priority = normalizePriority(r.priority ?? r.Priority);
  // submitter/assignee may be missing on legacy records
  const submitter = r.submitter ?? "";
  const assignee = r.assignee ?? r.owner ?? "";
  const owner = r.owner ?? assignee;
  const createdAt = r.createdAt ?? new Date().toISOString();
  const lastModified = r.lastModified ?? new Date().toISOString();
  const comments = Array.isArray(r.comments) ? r.comments : [];
  return {
    id,
    dsId,
    customerId,
    customerCrmId,
    requesterId,
    title,
    subject,
    description,
    status,
    priority,
    submitter,
    assignee,
    owner,
    createdAt,
    lastModified,
    comments,
  };
}

/** Persist the current cache to localStorage */
const save = () => localStorage.setItem(LS, JSON.stringify(cache));

/**
 * Load tickets into the in‑memory cache.  Uses localStorage if available
 * otherwise fetches the seed file from `/data/tickets.json`.  Once loaded
 * it normalises each record and determines the next available identifier.
 */
async function load() {
  if (cache) return cache;
  const stored = localStorage.getItem(LS);
  if (stored && stored !== "[]") {
    cache = JSON.parse(stored).map(norm);
  } else {
    try {
      const res = await fetch("/data/tickets.json");
      const json = await res.json();
      cache = Array.isArray(json) ? json.map(norm) : [];
    } catch (err) {
      console.error("Failed to load seed tickets:", err);
      cache = [];
    }
  }
  nextId = Math.max(0, ...cache.map((t) => t.id || 0)) + 1;
  save();
  return cache;
}

/* ---------- sorting ---------- */
function applySort(data, sorting = []) {
  if (!Array.isArray(sorting) || sorting.length === 0) return data;
  const first = sorting[0];
  const key = first.id ?? first.columnId;
  const desc = !!first.desc;
  return [...data].sort((a, b) => {
    const av = (a[key] ?? "").toString();
    const bv = (b[key] ?? "").toString();
    const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
    return desc ? -cmp : cmp;
  });
}

/* ---------- API ---------- */
/**
 * Fetch a paginated list of tickets with optional search and sorting.  A
 * customer filter will match against both customerId and requesterId so that
 * either field may be used when filtering.  Search matches across all
 * serialisable values on the record.
 */
export async function fetchTicketsPage(
  pageIndex = 0,
  pageSize = 10,
  search = "",
  sorting = [],
  customerId = null
) {
  let data = await load();
  if (customerId) {
    data = data.filter((t) => t.customerId === customerId || t.requesterId === customerId);
  }
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

/** Return a single ticket by id or null if not found. */
export const getTicketById = (id) => cache?.find((t) => t.id === id) || null;

/**
 * Add a new ticket.  Automatically assigns an id and normalises the
 * record.  Persists the change to localStorage.
 */
export async function addTicket(rec) {
  await load();
  const t = norm({ ...rec, id: nextId++ });
  cache.push(t);
  save();
}

/**
 * Update an existing ticket.  Merges the patch into the existing record,
 * normalises the result and saves it back.  If the ticket does not exist,
 * no action is taken.
 */
export async function updateTicket(id, rec) {
  await load();
  const i = cache.findIndex((t) => t.id === id);
  if (i > -1) {
    const merged = norm({ ...cache[i], ...rec, id });
    cache[i] = merged;
    save();
  }
}

/**
 * Delete a ticket by its identifier.  Removes the record from the cache
 * and persists the updated list.
 */
export async function deleteTicket(id) {
  await load();
  const idx = cache.findIndex((t) => t.id === id);
  if (idx > -1) {
    cache.splice(idx, 1);
    save();
  }
}