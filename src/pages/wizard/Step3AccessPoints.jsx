import React, { useEffect, useState } from 'react';
import { getWizardData, updateDeviceConfig } from '../../services/orderWizardService.js';

// Step 3 – Access point configuration
//
// Displays configuration forms for all access point resources tied to the
// order.  Each AP shows its own sections and editable fields.  User
// input is saved via updateDeviceConfig and reflected in the wizard
// data stored in localStorage.
export default function Step3AccessPoints() {
  const [wizard, setWizard] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getWizardData();
      setWizard(data || null);
    }
    load();
  }, []);

  if (!wizard) {
    return <div className="p-4">Loading…</div>;
  }

  const configs = wizard.deviceConfigs || {};
  const apEntries = Object.entries(configs).filter(([, cfg]) => cfg?.type === 'accessPoint');

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded">Templates</button>
        <button className="px-3 py-1 bg-blue-200 text-blue-800 rounded">Save Progress</button>
        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Auto‑Configure</button>
      </div>
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">
          Device Setup &amp; Configuration – Access Points
        </h2>
        {apEntries.length === 0 && (
          <p className="text-sm text-gray-600">No access points in this order.</p>
        )}
        {apEntries.map(([rid, cfg]) => {
          const parts = rid.split('-');
          const suffix = parts.length > 1 ? parts[1] : '';
          const name = suffix ? `${cfg.displayName} #${suffix}` : cfg.displayName;
          return (
          <div key={rid} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-6">
            <h3 className="text-lg font-semibold mb-3">{name}</h3>
            {cfg.sections?.map((section, secIdx) => (
              <div key={secIdx} className="mb-4">
                <h4 className="font-medium mb-2 text-sm">{section.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {section.fields?.map((field, fldIdx) => (
                    <div key={fldIdx}>
                      <label className="block font-medium mb-1">{field.label}</label>
                      <input
                        className="w-full border border-gray-300 rounded p-1"
                        value={field.value || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDeviceConfig(rid, secIdx, fldIdx, val);
                          setWizard({ ...wizard });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          );
        })}
      </div>
    </div>
  );
}