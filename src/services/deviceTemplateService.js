/*
 * Device Template Service
 *
 * This module loads device configuration templates from the
 * `device_templates.json` file in the public data folder.  Each
 * template describes the default configuration structure for a
 * hardware resource (firewall, switch, access point, etc.).  The
 * keys in the JSON correspond to normalised resource identifiers
 * (e.g. FG100F, FS124EPOE, FAP231E).  The values include a type,
 * a displayName and an array of section objects containing fields.
 */

let templatesCache = null;

/**
 * Load all device templates from the JSON file.  Results are
 * cached after the first fetch.  Returns an object keyed by
 * resourceId.
 */
export async function loadDeviceTemplates() {
  if (templatesCache) return templatesCache;
  const res = await fetch('/data/device_templates.json');
  if (!res.ok) throw new Error('Failed to fetch device templates');
  templatesCache = await res.json();
  return templatesCache;
}

/**
 * Retrieve a single template by resource identifier.  Returns
 * undefined if no template is defined for that id.
 * @param {string} resourceId
 */
export async function getTemplateByResourceId(resourceId) {
  const tpl = await loadDeviceTemplates();
  return tpl[resourceId];
}

export default {
  loadDeviceTemplates,
  getTemplateByResourceId,
};