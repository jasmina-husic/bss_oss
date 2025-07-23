/*
 * resourceService.js
 *
 * Provides functions to load and query available resources (hardware, licenses, etc.)
 * stored in /public/data/resources.json.  The data is cached in memory
 * after the first load.  This service is used by the catalog and order
 * management pages to build offerings and orders.
 */

let resourceCache = null;

/**
 * Load the resources JSON file if not already loaded.
 * @returns {Promise<Array>} Array of resource objects
 */
export async function loadResources() {
  if (resourceCache) return resourceCache;
  try {
    const res = await fetch('/data/resources.json');
    const data = await res.json();
    if (Array.isArray(data)) {
      resourceCache = data;
    } else {
      resourceCache = [];
    }
  } catch (e) {
    console.error('Failed to load resources', e);
    resourceCache = [];
  }
  return resourceCache;
}

/**
 * Get all resources.  Returns an empty array if none are loaded.
 * @returns {Promise<Array>}
 */
export async function getAllResources() {
  return await loadResources();
}

/**
 * Find a resource by its id.
 * @param {string} id
 * @returns {Promise<Object|null>} Resource object or null if not found
 */
export async function getResourceById(id) {
  const resources = await loadResources();
  return resources.find((r) => r.id === id) || null;
}

export default {
  loadResources,
  getAllResources,
  getResourceById,
};
