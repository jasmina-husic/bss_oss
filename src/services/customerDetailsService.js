
const CACHE_KEY = 'bss_customer_details_cache';

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

async function loadJson() {
  const res = await fetch('/data/customer_details.json');
  if (!res.ok) throw new Error('Failed to load JSON');
  return res.json();
}

async function ensureData() {
  const cache = readCache();
  if (Object.keys(cache).length) return cache;

  const json = await loadJson();
  writeCache(json);
  return json;
}

async function getById(id) {
  const data = await ensureData();
  return data[id];
}

export default { getById };
