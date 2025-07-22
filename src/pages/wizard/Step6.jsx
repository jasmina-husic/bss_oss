import React, { useEffect, useState } from 'react';
import orderWizardService from '../../services/orderWizardService';

// Step 6 – Deployment Planning & Scheduling
//
// Shows the deployment timeline, installation team, deployment kit
// and pre‑deployment checklist.  Timeline items display coloured
// tags based on their status.  Action buttons allow scheduling and
// marking the deployment as ready.
export default function Step6() {
  const [timeline, setTimeline] = useState(null);
  const [installationTeam, setInstallationTeam] = useState(null);
  const [deploymentKit, setDeploymentKit] = useState(null);
  const [preDeployment, setPreDeployment] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await orderWizardService.getWizardData();
      if (mounted && data) {
        setTimeline(data.deploymentTimeline);
        setInstallationTeam(data.installationTeam);
        setDeploymentKit(data.deploymentKit);
        setPreDeployment(data.preDeploymentChecklist);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const stageColors = {
    Completed: 'bg-green-100 text-green-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    Scheduled: 'bg-blue-100 text-blue-800',
  };

  if (!timeline) return <div>Loading...</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      {/* Action bar */}
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 bg-gray-200 rounded shadow text-sm">
          Schedule Install
        </button>
        <button className="px-4 py-2 bg-gray-200 rounded shadow text-sm">
          Deployment Kit
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded shadow text-sm hover:bg-blue-700">
          Ready to Deploy
        </button>
      </div>
      {/* Timeline and team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Deployment Timeline</h3>
          <ul className="space-y-3 text-sm">
            {timeline.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-3">
                <div
                  className={`px-2 py-1 rounded text-xs ${
                    stageColors[item.status]
                  }`}
                >
                  {item.status}
                </div>
                <div>
                  <p className="font-medium">{item.stage}</p>
                  <p className="text-gray-600">{item.description}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Installation Team</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(installationTeam).map(([label, value]) => (
                <p key={label}>
                  <span className="font-medium">{label}:</span> {value}
                </p>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Deployment Kit</h3>
            <ul className="list-disc pl-4 text-sm space-y-1">
              {deploymentKit.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Pre‑deployment checklist */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Pre‑Deployment Checklist</h3>
        <ul className="list-disc pl-4 text-sm space-y-1">
          {preDeployment.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}