/*────────────────────────────────────────────────────────────
  Service Catalog data-service (CFS + RFS)
  ▸ Keeps existing paging & CRUD exports
  ▸ Robust against string IDs or empty JSON
────────────────────────────────────────────────────────────*/

const LS = 'bss_serviceSpecs';
let cache  = null;           // array of CFS
let nextId = 1;

/*── helpers ──*/
function save(){ localStorage.setItem(LS, JSON.stringify(cache)); }
function norm(r){
  const numId = Number.isFinite(r.id) ? r.id : nextId++;
  return {
    id:    numId,
    cfsId: r.cfsId ?? (typeof r.id==='string'?r.id:`CFS-${numId}`),
    name:        r.name ?? '',
    description: r.description ?? '',
    rfsIds:      r.rfsIds ?? [],
    activationSequence: r.activationSequence ?? [],
  };
}

/*── load once ──*/
async function _load(){
  if(cache) return cache;
  const stored = localStorage.getItem(LS);
  if(stored) cache = JSON.parse(stored).map(norm);
  else {
    try{
      const res = await fetch('/data/serviceSpecs.json');
      const js  = await res.json();
      cache     = (js.cfs||[]).map(norm);
    }catch{ cache=[]; }
    save();
  }
  nextId = Math.max(0,...cache.map(c=>c.id))+1;
  return cache;
}

/*── paging & CRUD ───────────────────────────────────────────*/
export async function fetchCfsPage(idx,size,search,sorting){
  await _load();
  let data=[...cache];
  if(search){
    const q=search.toLowerCase();
    data=data.filter(c=>[c.cfsId,c.name,c.description].some(v=>
      v.toString().toLowerCase().includes(q)));
  }
  if(sorting?.length){
    const { id, desc } = sorting[0];
    data.sort((a,b)=>{
      const av=(a[id]??'').toString().toLowerCase();
      const bv=(b[id]??'').toString().toLowerCase();
      if(av<bv) return desc?1:-1;
      if(av>bv) return desc?-1:1;
      return 0;
    });
  }
  const total=data.length,start=idx*size;
  return { records:data.slice(start,start+size), total };
}

export async function addCfs(r){ await _load(); cache.push(norm(r)); save(); }
export async function deleteCfs(idx){ await _load(); cache.splice(idx,1); save(); }
export async function updateCfs(id,r){
  await _load();
  const i=cache.findIndex(c=>c.id===id);
  if(i>-1){ cache[i]={...cache[i],...r,id}; save(); }
}

export async function getCfsByIdAsync(id){ await _load(); return cache.find(c=>c.id===id)||null; }
export async function getAllRfsIds(){
  await _load(); const s=new Set(); cache.forEach(c=>c.rfsIds.forEach(r=>s.add(r))); return [...s];
}
