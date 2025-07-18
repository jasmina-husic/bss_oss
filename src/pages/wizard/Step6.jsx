import React, { useEffect, useState } from 'react';
import orderWizardService from '../../services/orderWizardService';

// Step 6 – Deployment Planning & Scheduling
//
// Shows the deployment timeline, installation team, deployment kit and
// pre‑deployment checklist.  Each timeline stage can be updated
// between Scheduled, In Progress and Completed.

export default function Step6() {
  const [timeline, setTimeline] = useState(null);
  const [team, setTeam] = useState(null);
  const [kit, setKit] = useState(null);
  const [checklist, setChecklist] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      const data = await orderWizardService.getWizardData();
      if (mounted && data) {
        setTimeline(data.deploymentTimeline);
        setTeam(data.installationTeam);
        setKit(data.deploymentKit);
        setChecklist(data.preDeploymentChecklist);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  if (!timeline || !team || !kit || !checklist) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Deployment Timeline</h3>
      <div className="space-y-4 text-sm">
        {timeline.map((item, idx) => (
          <div key={item.stage} className="flex items-start space-x-3">
            <div className="pt-1">
              {item.status === 'Completed' && <span className="w-3 h-3 inline-block bg-green-500 rounded-full"></span>}
              {item.status === 'In Progress' && <span className="w-3 h-3 inline-block bg-yellow-500 rounded-full"></span>}
              {item.status === 'Scheduled' && <span className="w-3 h-3 inline-block bg-gray-400 rounded-full"></span>}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{item.stage}</p>
              <p>{item.description}</p>
              <p className="text-xs text-gray-500">{item.time}</p>
            </div>
            <div>
              <select
                value={item.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  orderWizardService.updateTimelineStage(idx, newStatus);
                  setTimeline((prev) => prev.map((obj, i) => (i === idx ? { ...obj, status: newStatus } : obj)));
                }}
                className="border p-1 rounded text-sm"
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      <h3 className="text-lg font-semibold mt-6">Installation Team</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {Object.entries(team).map(([role, person]) => (
          <div key={role}>
            <p className="uppercase text-xs text-gray-500">{role}</p>
            <p>{person}</p>
          </div>
        ))}
      </div>
      <h3 className="text-lg font-semibold mt-6">Deployment Kit</h3>
      <ul className="list-disc pl-4 space-y-1 text-sm">
        {kit.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      <h3 className="text-lg font-semibold mt-6">Pre-Deployment Checklist</h3>
      <ul className="list-disc pl-4 space-y-1 text-sm">
        {checklist.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}