import React, { useEffect, useState } from 'react';
import orderWizardService from '../../services/orderWizardService';

// Step 7 – Go‑Live & Customer Handover
//
// Summarises the deployment, displays validation items with
// checkmarks and lists handover/training/support details.  Action
// buttons let the user send the final report or close the order.
export default function Step7() {
  const [summary, setSummary] = useState(null);
  const [validation, setValidation] = useState(null);
  const [handover, setHandover] = useState(null);
  const [training, setTraining] = useState(null);
  const [support, setSupport] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await orderWizardService.getWizardData();
      if (mounted && data) {
        setSummary(data.deploymentSummary);
        setValidation(data.goLiveValidation);
        setHandover(data.customerHandoverCompleted);
        setTraining(data.trainingCompleted);
        setSupport(data.supportActivated);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Deployment Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {Object.entries(summary).map(([label, value]) => (
            <div
              key={label}
              className="border-l-2 border-blue-600 pl-3"
            >
              <p className="font-medium">{label}</p>
              <p>{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Go‑Live Validation</h3>
          <ul className="space-y-1 text-sm">
            {validation.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2"
              >
                <span className="text-green-600">✔</span>
                <span>{item.item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">
            Customer Handover Completed
          </h3>
          <ul className="list-disc pl-4 text-sm space-y-1">
            {handover.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold mb-2 mt-4">
            Training Completed
          </h3>
          <ul className="list-disc pl-4 text-sm space-y-1">
            {training.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold mb-2 mt-4">Support Activated</h3>
          <ul className="list-disc pl-4 text-sm space-y-1">
            {support.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 bg-gray-200 rounded shadow text-sm">
          Send Final Report
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded shadow text-sm hover:bg-blue-700">
          Close Order &amp; Activate Monitoring
        </button>
      </div>
    </div>
  );
}