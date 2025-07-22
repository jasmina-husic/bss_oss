/*
 * dolphinService
 *
 * This helper loads static page content for the Dolphin Shield sidebar
 * navigation.  Data is stored in `public/data/dolphin_pages.json` and
 * returned by section (e.g. "guests", "networkServices", etc.).
 * The file is fetched on first access and cached for subsequent
 * requests.  Exported functions return promises to support
 * asynchronous loading in React components.
 */

let _cache = null;

async function load() {
  if (_cache) return _cache;
  const res = await fetch('/data/dolphin_pages.json');
  if (!res.ok) throw new Error('Failed to load dolphin page data');
  _cache = await res.json();
  return _cache;
}

/**
 * Returns the array of items for a given section key.  If the
 * section does not exist, an empty array is returned.  The
 * promise resolves once the JSON file has been loaded.
 *
 * @param {string} section
 */
export async function getSection(section) {
  const data = await load();
  return data[section] || [];
}

export default { getSection };