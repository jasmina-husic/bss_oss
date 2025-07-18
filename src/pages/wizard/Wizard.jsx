import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  initWizardForOrder,
  setCurrentOrderId,
  getCurrentOrder,
} from "../../services/orderWizardService";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3Firewall from "./Step3Firewall";
import Step3Switch from "./Step3Switch";
import Step3AccessPoints from "./Step3AccessPoints";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";
import Step7 from "./Step7";

export default function Wizard() {
  const { id } = useParams();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // initialise and load wizard data for this order
    async function init() {
      await initWizardForOrder(id);
      setCurrentOrderId(id);
      setLoaded(true);
    }
    init();
  }, [id]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  if (!loaded) {
    return <div className="p-6">Loading wizard...</div>;
  }

  const steps = [
    { title: "Order Review & Confirmation", content: <Step1 /> },
    { title: "Inventory Allocation", content: <Step2 /> },
    { title: "Firewall Configuration", content: <Step3Firewall /> },
    { title: "Switch Configuration", content: <Step3Switch /> },
    { title: "Access Point Configuration", content: <Step3AccessPoints /> },
    { title: "Testing & Validation", content: <Step4 /> },
    { title: "Final Validation Checklist", content: <Step5 /> },
    { title: "Deployment Planning & Scheduling", content: <Step6 /> },
    { title: "Go‑Live & Customer Handover", content: <Step7 /> },
  ];

  const Current = steps[step];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Step {step + 1}: {Current.title}</h1>
      {Current.content}
      <div className="flex justify-between mt-4">
        <button
          onClick={prev}
          disabled={step === 0}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={next}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => nav(`/orders/${id}`)}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
