/*
 * customerDetailsService.js
 *
 * Provides functions to load and retrieve customer detail data from
 * a JSON file in the public/data folder.  The service caches the
 * data in memory to avoid repeated fetches.  It exposes both named
 * and default exports so existing code that expects a default
 * export continues to work.
 */

/**
 * In-memory cache for customer detail objects.  Once loaded from either
 * localStorage or the JSON file, the data is kept here to avoid
 * repeated parsing or network requests.  When seeding from localStorage,
 * we validate JSON parsing errors and gracefully handle missing data.
 */
let detailsCache = null;

/**
 * Load customer details from `/data/customer_details.json`.  If the
 * cache is already populated, the cached data is returned.  The
 * JSON file should be structured as an object keyed by customer ID.
 */
export async function loadCustomerDetails() {
  // If we have already loaded the details into memory, return them.
  if (detailsCache) return detailsCache;

  // First try to read from localStorage.  Some deployments may seed
  // customer details via localStorage instead of the static JSON file.
  const stored = localStorage.getItem('customerDetails');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Only set detailsCache if parsed is an object
      if (parsed && typeof parsed === 'object') {
        detailsCache = parsed;
        return detailsCache;
      }
    } catch (err) {
      // Corrupt or invalid JSON in localStorage should be ignored
      console.warn('Invalid customerDetails in localStorage, ignoring', err);
    }
  }

  // If no localStorage entry exists, fetch from the static JSON file.
  try {
    const res = await fetch('/data/customer_details.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // Persist to localStorage for subsequent loads
    localStorage.setItem('customerDetails', JSON.stringify(json));
    detailsCache = json;
    return detailsCache;
  } catch (e) {
    console.error('Failed to load customer details', e);
    // Ensure we return an empty object rather than null
    detailsCache = {};
    return detailsCache;
  }
}

/**
 * Get a single customer detail object by ID.  Returns null if the
 * ID does not exist in the data.  Always returns a promise.
 */
export async function getCustomerDetail(id) {
  const data = await loadCustomerDetails();
  if (data && Object.prototype.hasOwnProperty.call(data, String(id))) {
    return data[String(id)];
  }
  return undefined;
}

/**
 * Alias for getCustomerDetail() to maintain backward compatibility.
 */
export async function getById(id) {
  return getCustomerDetail(id);
}

// Default export to maintain compatibility with import patterns like
// `import customerDetailsService from '../services/customerDetailsService'`.
export default {
  loadCustomerDetails,
  getCustomerDetail,
  getById,
};