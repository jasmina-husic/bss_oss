import React, { useEffect, useState } from 'react';
import orderWizardService from '../../services/orderWizardService';

// Step 1 – Order Review & Confirmation
//
// This component displays a summary of the selected bundle: equipment
// breakdown, customer information, deployment locations, special
// requirements and project timeline.  It mirrors the visual style of
// the provided JPEG mockup: dark headers with white cards, striped
// tables, colour‑coded requirement tags and ISO date pickers.  All
// fields except the equipment list are editable via input controls.
export default function Step1() {
  const [data, setData] = useState(null);
  const [locations, setLocations] = useState({});
  const [timeline, setTimeline] = useState({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      const wizardData = await orderWizardService.getWizardData();
      if (wizardData && mounted) {
        setData(wizardData);
        setLocations({ ...wizardData.deploymentLocations });
        setTimeline({ ...wizardData.projectTimeline });
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const {
    equipmentBreakdown,
    equipmentSubtotal,
    installationServices,
    totalOrderValue,
    customerInfo,
    specialRequirements,
  } = data;

  // Convert human readable dates to YYYY‑MM‑DD for input[type="date"]
  const toIsoDate = (val) => {
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? val : d.toISOString().substring(0, 10);
    } catch {
      return val;
    }
  };

  return (
    <div className="space-y-8">
      {/* Equipment breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-blue-800 text-white uppercase text-xs font-semibold px-4 py-2">
          Equipment Breakdown
        </div>
        <table className="w-full text-sm">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              <th className="p-2 text-left font-medium">Item</th>
              <th className="p-2 text-left font-medium">SKU</th>
              <th className="p-2 text-right font-medium">Qty</th>
              <th className="p-2 text-right font-medium">Unit Price</th>
              <th className="p-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {equipmentBreakdown.map(({ item, sku, qty, unitPrice, total }, idx) => (
              <tr
                key={sku}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="p-2 whitespace-nowrap">{item}</td>
                <td className="p-2 whitespace-nowrap">{sku}</td>
                <td className="p-2 text-right">{qty}</td>
                <td className="p-2 text-right">${unitPrice.toLocaleString()}</td>
                <td className="p-2 text-right">${total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-200 text-sm text-right space-y-0.5">
          <p className="font-medium">
            Equipment Subtotal: ${equipmentSubtotal.toLocaleString()}
          </p>
          <p>
            + Installation &amp; Professional Services: ${installationServices.toLocaleString()}
          </p>
          <p className="font-semibold">
            Total Order Value: ${totalOrderValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Info panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer info */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-blue-800 text-white uppercase text-xs font-semibold px-4 py-2">
            Customer Information
          </div>
          <div className="p-4 text-sm space-y-1">
            {Object.entries(customerInfo).map(([label, value]) => (
              <p key={label}>
                <span className="font-medium">{label}:</span> {value}
              </p>
            ))}
          </div>
        </div>
        {/* Deployment locations */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-blue-800 text-white uppercase text-xs font-semibold px-4 py-2">
            Deployment Locations
          </div>
          <div className="p-4 text-sm space-y-2">
            {Object.entries(locations).map(([label, value]) => (
              <div key={label} className="flex items-center space-x-2">
                <span className="font-medium whitespace-nowrap">{label}:</span>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded p-1 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocations((prev) => ({ ...prev, [label]: val }));
                    orderWizardService.updateDeploymentLocation(label, val);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Special requirements */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-blue-800 text-white uppercase text-xs font-semibold px-4 py-2">
            Special Requirements
          </div>
          <div className="p-4">
            <ul className="space-y-2 text-sm">
              {specialRequirements.map((req, idx) => {
                const colours = [
                  'bg-orange-50 text-orange-800 border-l-4 border-orange-500',
                  'bg-green-50 text-green-800 border-l-4 border-green-500',
                  'bg-purple-50 text-purple-800 border-l-4 border-purple-500',
                ];
                return (
                  <li
                    key={idx}
                    className={`px-3 py-2 rounded ${colours[idx % colours.length]}`}
                  >
                    {req}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Project timeline */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-blue-800 text-white uppercase text-xs font-semibold px-4 py-2">
          Project Timeline
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
          {Object.entries(timeline).map(([label, value]) => (
            <div key={label} className="p-4 space-y-1">
              <p className="uppercase text-xs text-gray-500">{label}</p>
              <input
                type="date"
                className="w-full border border-gray-300 rounded p-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={toIsoDate(value)}
                onChange={(e) => {
                  const val = e.target.value;
                  setTimeline((prev) => ({ ...prev, [label]: val }));
                  orderWizardService.updateProjectTimeline(label, val);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar with progress and actions */}
      <div className="flex justify-between items-center pt-2 text-sm">
        <p className="text-gray-500">
          Step 1 of 9: Review order details and confirm accuracy
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => window.alert('Request changes clicked')}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
          >
            Request Changes
          </button>
          <button
            onClick={() => {
              // Trigger the next step via global helper (set in Wizard)
              if (typeof window.nextWizardStep === 'function') {
                window.nextWizardStep();
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Approve &amp; Continue to Allocation
          </button>
        </div>
      </div>
    </div>
  );
}