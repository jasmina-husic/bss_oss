/* ────────────────────────────────────────────────────────────
   src/services/priceService.js
   Simple Local-Storage backed service for price records
   ──────────────────────────────────────────────────────────── */

   const LS = "bss_prices";
   let   cache = null;
   
   /* ---------- helpers ---------- */
   function save()          { localStorage.setItem(LS, JSON.stringify(cache)); }
   function asNum(v, d = 0) { const n = Number(v); return Number.isFinite(n) ? n : d; }
   
   function norm(r) {
     return {
       priceId : asNum(r.priceId),
       oneOff  : asNum(r.oneOff),
       monthly : asNum(r.monthly),
       usage   : asNum(r.usage),
       currency: r.currency || "USD",
     };
   }
   
   function nextId() {
     return Math.max(0, ...cache.map(p => p.priceId)) + 1;
   }
   
   /* ---------- bootstrap (seed from /data/prices.json on first run) ---------- */
   async function load() {
     if (cache) return cache;
   
     const stored = localStorage.getItem(LS);
     cache = stored
       ? JSON.parse(stored).map(norm)
       : (await (await fetch("/data/prices.json")).json()).map(norm);
   
     save();          // persist seed so later reloads come from LS
     return cache;
   }
   
   /* ========================================================================== */
   /*                                PUBLIC API                                  */
   /* ========================================================================== */
   
   /* paging + search + sort */
   export async function fetchPricesPage(idx = 0, size = 25, q = "", sorting = []) {
     let data = await load();
   
     /* free-text search */
     if (q) {
       const f = q.toLowerCase();
       data = data.filter(p =>
         Object.values(p).some(v => ("" + v).toLowerCase().includes(f)),
       );
     }
   
     /* client-side sort (single column) */
     if (sorting?.length) {
       const { id, desc = false } = sorting[0];
       data.sort((a, b) => {
         const av = ("" + (a[id] ?? "")).toLowerCase();
         const bv = ("" + (b[id] ?? "")).toLowerCase();
         if (av < bv) return desc ? 1 : -1;
         if (av > bv) return desc ? -1 : 1;
         return 0;
       });
     }
   
     const total = data.length;
     const start = idx * size;
     return { records: data.slice(start, start + size), total };
   }
   
   /* lookup helpers */
   export async function getPriceById(pid) {
     await load();
     return cache.find(p => p.priceId === pid) || null;
   }
   
   /* synchronous map – handy when code already awaited load() earlier */
   export function priceMapSync() {
     return cache || [];
   }
   
   /* ---------- mutations ---------- */
   export async function addPrice(rec) {
     await load();
     const price = norm({ ...rec, priceId: nextId() });
     cache.push(price);
     save();
     return price.priceId;
   }
   
   export async function updatePrice(priceId, patch) {
     await load();
     const i = cache.findIndex(p => p.priceId === priceId);
     if (i > -1) {
       cache[i] = norm({ ...cache[i], ...patch, priceId }); // ensure numeric fields stay numeric
       save();
     }
   }
   
   export async function deletePrice(idx) {
     await load();
     cache.splice(idx, 1);
     save();
   }
   export async function fetchPrices() {
    return await load();
  }   