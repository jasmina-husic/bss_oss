import React, { useEffect, useState } from 'react';
import orderWizardService from '../../services/orderWizardService';

// Step 1 – Order Review & Confirmation
//
// This component displays a summary of the equipment ordered,
// customer details, deployment locations and special requirements.
// Deployment locations and the project timeline are editable – any
// changes are persisted through the service.  Special requirements
// remain read‑only for now but are sourced from the offering.

export default function Step1() {
  const [data, setData] = useState(null);
  const [locations, setLocations] = useState(null);
  const [timeline, setTimeline] = useState(null);

  // Fetch data on mount and whenever the underlying order changes.
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      const wizardData = await orderWizardService.getWizardData();
      if (mounted) {
        setData(wizardData);
        if (wizardData) {
          setLocations({ ...wizardData.deploymentLocations });
          setTimeline({ ...wizardData.projectTimeline });
        }
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  // When the data object changes (e.g. after edits), update local
  // copies of the editable objects.  This ensures that controlled
  // inputs reflect persisted values.
  useEffect(() => {
    if (data) {
      setLocations({ ...data.deploymentLocations });
      setTimeline({ ...data.projectTimeline });
    }
  }, [data]);

  if (!data || !locations || !timeline) {
    return <div>Loading...</div>;
  }

  const { equipmentBreakdown, equipmentSubtotal, installationServices, totalOrderValue } = data;
  const { customerInfo, specialRequirements } = data;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Equipment Breakdown</h3>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Item</th>
                <th className="p-2 border">SKU</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">Unit Price</th>
                <th className="p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {equipmentBreakdown.map(({ item, sku, qty, unitPrice, total }) => (
                <tr key={sku}>
                  <td className="p-2 border">{item}</td>
                  <td className="p-2 border">{sku}</td>
                  <td className="p-2 border text-center">{qty}</td>
                  <td className="p-2 border">${unitPrice.toLocaleString()}</td>
                  <td className="p-2 border">${total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-right">
            <p className="font-semibold">Equipment Subtotal: ${equipmentSubtotal.toLocaleString()}</p>
            <p>+ Installation &amp; Professional Services: ${installationServices.toLocaleString()}</p>
            <p className="font-semibold">Total Order Value: ${totalOrderValue.toLocaleString()}</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
          <div className="border p-2 mb-4 space-y-1 text-sm">
            {Object.entries(customerInfo).map(([label, value]) => (
              <p key={label}>
                <span className="font-semibold">{label}:</span> {value}
              </p>
            ))}
          </div>
          <h3 className="text-lg font-semibold mb-2">Deployment Locations</h3>
          <div className="border p-2 mb-4 space-y-2 text-sm">
            {Object.entries(locations).map(([label, value]) => (
              <div key={label} className="flex items-center space-x-2">
                <span className="font-semibold whitespace-nowrap">{label}:</span>
                <input
                  type="text"
                  className="flex-1 border p-1 rounded"
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
          <h3 className="text-lg font-semibold mb-2">Special Requirements</h3>
          <div className="border p-2 text-sm">
            <ul className="list-disc pl-4 space-y-1">
              {specialRequirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Project Timeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {Object.entries(timeline).map(([label, value]) => (
            <div key={label} className="space-y-1">
              <p className="uppercase text-xs text-gray-500">{label}</p>
              <input
                type="text"
                className="w-full border p-1 rounded"
                value={value}
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
    </div>
  );
}