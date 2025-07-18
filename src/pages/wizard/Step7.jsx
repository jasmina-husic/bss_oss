import React, { useEffect, useState } from 'react';
import orderWizardService from '../../services/orderWizardService';

// Step 7 – Go-Live & Customer Handover
//
// Presents a summary of the deployment, a go‑live validation list,
// details of the handover, training and support items, plus a
// customer satisfaction survey.  All data is pulled from the
// wizard store and read only.

export default function Step7() {
  const [summary, setSummary] = useState(null);
  const [validation, setValidation] = useState(null);
  const [handover, setHandover] = useState(null);
  const [training, setTraining] = useState(null);
  const [support, setSupport] = useState(null);
  const [survey, setSurvey] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      const data = await orderWizardService.getWizardData();
      if (mounted && data) {
        setSummary(data.deploymentSummary);
        setValidation(data.goLiveValidation);
        setHandover(data.customerHandoverCompleted);
        setTraining(data.trainingCompleted);
        setSupport(data.supportActivated);
        setSurvey(data.customerSatisfactionSurvey);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  if (!summary || !validation || !handover || !training || !support || !survey) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 border border-green-200 rounded">
        <p className="text-green-700 font-semibold">Deployment Successfully Completed!</p>
        <p className="text-sm">Your network is now live and operational</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <h3 className="text-lg font-semibold mb-2">Deployment Summary</h3>
          <div className="space-y-1">
            {Object.entries(summary).map(([label, value]) => (
              <p key={label}>
                <span className="font-semibold">{label}:</span> {value}
              </p>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Go-Live Validation</h3>
          <ul className="list-disc pl-4 space-y-1">
            {validation.map((obj, idx) => (
              <li key={idx}>{obj.item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <h3 className="text-lg font-semibold mb-2">Customer Handover Completed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Documentation Delivered</h4>
              <ul className="list-disc pl-4 space-y-1">
                {handover.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Training Completed</h4>
              <ul className="list-disc pl-4 space-y-1">
                {training.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Support Activated</h4>
              <ul className="list-disc pl-4 space-y-1">
                {support.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Customer Satisfaction Survey</h3>
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold mb-1">
              {'★'.repeat(survey.rating)}
            </p>
            <p className="text-sm italic">"{survey.comment}"</p>
            <p className="text-sm mt-1">— Customer rated the deployment experience</p>
          </div>
        </div>
      </div>
    </div>
  );
}