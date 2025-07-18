import React, { useEffect, useState } from 'react';
import orderWizardService from '../../services/orderWizardService';

// Step 5 – Final Validation Checklist
//
// Displays four categories of validation tasks (hardware,
// configuration, license and documentation) with checkboxes.  Toggling
// a checkbox updates the underlying wizard data via the service.

export default function Step5() {
  const [sections, setSections] = useState(null);

  // Map display headings to service keys.  This allows us to reuse
  // the generic update helper in the service.
  const toServiceKey = (displayKey) => {
    switch (displayKey) {
      case 'Hardware Validation':
        return 'hardwareValidation';
      case 'Configuration Validation':
        return 'configurationValidation';
      case 'License Validation':
        return 'licenseValidation';
      case 'Documentation':
        return 'documentationChecks';
      default:
        return displayKey;
    }
  };

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      const wizard = await orderWizardService.getWizardData();
      if (mounted && wizard) {
        setSections({
          'Hardware Validation': wizard.hardwareValidation,
          'Configuration Validation': wizard.configurationValidation,
          'License Validation': wizard.licenseValidation,
          Documentation: wizard.documentationChecks,
        });
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  if (!sections) {
    return <div>Loading...</div>;
  }

  const handleToggle = (category, index) => {
    const serviceKey = toServiceKey(category);
    const currentStatus = sections[category][index].status;
    const newStatus = currentStatus === 'Checked' ? 'Unchecked' : 'Checked';
    orderWizardService.updateValidationStatus(serviceKey, index, newStatus);
    setSections((prev) => {
      const updated = { ...prev };
      const arr = updated[category].map((obj, i) =>
        i === index ? { ...obj, status: newStatus } : obj
      );
      updated[category] = arr;
      return updated;
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(sections).map(([title, items]) => (
          <div key={title}>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <ul className="space-y-1 text-sm">
              {items.map((obj, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={obj.status === 'Checked'}
                    onChange={() => handleToggle(title, idx)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span>{obj.item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}