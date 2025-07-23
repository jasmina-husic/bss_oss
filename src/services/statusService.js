/*
 * statusService.js
 *
 * Provides functions to load and query order statuses from
 * /public/data/statuses.json.  Each status entry includes a code,
 * display label, and optional colour used to indicate status in the UI.
 */
let statusCache = null;

async function loadStatuses() {
  if (statusCache) return statusCache;
  try {
    const res = await fetch('/data/statuses.json');
    const data = await res.json();
    if (Array.isArray(data)) {
      statusCache = data;
    } else {
      statusCache = [];
    }
  } catch (e) {
    console.error('Failed to load statuses', e);
    statusCache = [];
  }
  return statusCache;
}

/**
 * Get all status definitions.
 * @returns {Promise<Array>}
 */
export async function getAllStatuses() {
  return await loadStatuses();
}

/**
 * Find a status by its code.
 * @param {string} code
 * @returns {Promise<Object|null>}
 */
export async function getStatusByCode(code) {
  const list = await loadStatuses();
  return list.find((s) => s.code === code) || null;
}

export default {
  getAllStatuses,
  getStatusByCode,
};
