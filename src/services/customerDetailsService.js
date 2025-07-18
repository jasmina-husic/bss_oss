// Service to load and retrieve detailed customer information for the
// Customer Detail Dashboard.  This service stores the fetched data in
// localStorage under the key "customerDetails" so it can be accessed
// synchronously by the dashboard component.

/**
 * Load all customer details from the static JSON file located at
 * /public/data/customer_details.json.  Once loaded, the data is cached
 * into localStorage.  Call this function once at application startup
 * (e.g. from App.jsx) or before rendering the CustomerDashboard.
 */
export async function loadCustomerDetails() {
  try {
    const response = await fetch('/data/customer_details.json');
    if (!response.ok) {
      throw new Error('Failed to fetch customer details');
    }
    const data = await response.json();
    localStorage.setItem('customerDetails', JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
}

/**
 * Get the detailed information for a single customer by ID.  The ID
 * should match the string keys used in customer_details.json.  If the
 * details have not been loaded into localStorage yet, this function
 * returns undefined.
 *
 * @param {string|number} id - The customer ID
 * @returns {object|undefined} The detail object or undefined
 */
/**
 * Get the detailed information for a single customer by ID.  This function
 * returns a Promise to align with older code that expected an async API.
 * If the details have not been loaded yet, it will call loadCustomerDetails()
 * automatically before resolving the requested entry.  The promise resolves
 * with the customer detail object or undefined if none is found.
 *
 * @param {string|number} id
 * @returns {Promise<object|undefined>}
 */
export async function getCustomerDetail(id) {
  let stored = localStorage.getItem('customerDetails');
  if (!stored) {
    // Attempt to load details if not already present
    await loadCustomerDetails();
    stored = localStorage.getItem('customerDetails');
    if (!stored) return undefined;
  }
  try {
    const details = JSON.parse(stored);
    return details[String(id)];
  } catch (err) {
    console.error('Failed to parse customer details from localStorage', err);
    return undefined;
  }
}

/**
 * Backwards-compatible alias for getCustomerDetail().  Some existing components
 * (e.g. CustomerDashboard.jsx) still call customerDetailsService.getById(),
 * so expose getById as a named export that delegates to getCustomerDetail.
 *
 * @param {string|number} id - The customer ID
 * @returns {object|undefined} The detail object or undefined
 */
export function getById(id) {
  return getCustomerDetail(id);
}

// Provide a default export so that existing imports like
// `import customerDetailsService from './services/customerDetailsService'`
// continue to work.  The default export exposes the load and get functions.
export default {
  loadCustomerDetails,
  getCustomerDetail,
  // Also expose getById on the default export for backwards compatibility
  getById,
};
