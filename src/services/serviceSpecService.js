// …top of file unchanged…
async function load () {
    if (cache) return cache;
  
    const stored = localStorage.getItem(LS);
    if (stored) {
      cache = JSON.parse(stored).map(norm);
    } else {
      const res  = await fetch('/data/serviceSpecs.json');
      const json = await res.json();
      cache      = json.cfs.map((c,i)=>norm({ id:i+1, ...c }));
    }
    /* ── NaN guard ── */
    nextId = cache.length ? Math.max(...cache.map(c=>c.id)) + 1 : 1;
    save();
    return cache;
  }
  // …rest of file unchanged…
  