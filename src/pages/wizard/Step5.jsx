import React, { useEffect, useState } from 'react';
import orderWizardService from '../../services/orderWizardService';

// Step 5 – Final Validation Checklist
//
// Displays four sections of validation tasks.  Each list item is
// interactive: checking the box updates the wizard data via the
// service.  A set of action buttons at the bottom mirrors the
// mockup (print, send, complete).
export default function Step5() {
  const [lists, setLists] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await orderWizardService.getWizardData();
      if (mounted && data) {
        setLists({
          hardwareValidation: data.hardwareValidation,
          configurationValidation: data.configurationValidation,
          licenseValidation: data.licenseValidation,
          documentationChecks: data.documentationChecks,
        });
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const updateStatus = (section, index, checked) => {
    orderWizardService.updateValidationStatus(section, index, checked ? 'Checked' : '');
    setLists((prev) => {
      const copy = { ...prev };
      copy[section][index].status = checked ? 'Checked' : '';
      return copy;
    });
  };

  if (!lists) {
    return <div>Loading...</div>;
  }

  const sections = [
    { key: 'hardwareValidation', title: 'Hardware Validation' },
    { key: 'configurationValidation', title: 'Configuration Validation' },
    { key: 'licenseValidation', title: 'License Validation' },
    { key: 'documentationChecks', title: 'Documentation' },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map(({ key, title }) => (
          <div
            key={key}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <ul className="space-y-2 text-sm">
              {lists[key].map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={item.status === 'Checked'}
                    onChange={(e) => updateStatus(key, idx, e.target.checked)}
                  />
                  <span>{item.item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 bg-gray-200 rounded shadow text-sm">
          Print Checklist
        </button>
        <button className="px-4 py-2 bg-gray-200 rounded shadow text-sm">
          Send Summary
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded shadow text-sm hover:bg-blue-700">
          Complete Validation
        </button>
      </div>
    </div>
  );
}