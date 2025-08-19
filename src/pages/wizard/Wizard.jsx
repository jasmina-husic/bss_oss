import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  initWizardForOrder,
  setCurrentOrderId,
  getWizardData,
  setWizardData as persistWizardData,
  updateAllocationNotes,
  allocateEquipmentItem,
  startTest,
  updateValidationStatus,
  updateTimelineStage,
} from "../../services/orderWizardService";
import { updateDeviceConfig } from "../../services/orderWizardService.js";
// Generate wizard data for an offering.  This is used to
// regenerate device configuration pages if missing.
import { generateWizardData } from "../../services/fulfillmentService.js";
import { getOrderById, updateOrder } from "../../services/orderService";
import dolphinService from "../../services/dolphinService";

// Step components
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3Firewall from "./Step3Firewall";
import Step3Switch from "./Step3Switch";
import Step3AccessPoints from "./Step3AccessPoints";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";
import Step7 from "./Step7";

/*
 * Wizard with collapsible sidebar and placeholder pages
 *
 * This component wraps the multi‑step provisioning wizard with a
 * navigation sidebar inspired by the Dolphin Shield design.  The
 * sidebar groups navigation items under headings (Global, Manage,
 * Analyze, Maintain) and supports collapsing to a narrow bar when a
 * non‑wizard page is selected.  Selecting “Overview” reveals the
 * wizard; selecting any other link renders a simple placeholder page.
 */
export default function Wizard() {
  const { id } = useParams();
  const nav = useNavigate();

  // Local state
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [wizardData, setWizardData] = useState(null);
  // Cache the order record to determine which wizard steps to show
  const [orderData, setOrderData] = useState(null);
  // Steps to display for this order.  Computed dynamically based on the
  // order's activationSequence.  See useEffect below for details.
  const [wizardSteps, setWizardSteps] = useState([]);
  const [activeKey, setActiveKey] = useState("overview");
  // Whether the Dolphin sidebar is collapsed; users may toggle this
  const [collapsed, setCollapsed] = useState(false);
  // Page content for fake pages (guests, network services, etc.)
  const [pageData, setPageData] = useState([]);

  // Initialise wizard and order data on mount/ID change
  useEffect(() => {
    async function init() {
      // initialise wizard data from template if missing
      await initWizardForOrder(id);
      setCurrentOrderId(id);
      // load wizard data
      let data = await getWizardData();
      // load order details to compute workflow
      // Convert the id param to a number when fetching order details
      const ord = await getOrderById(isNaN(Number(id)) ? id : Number(id));
      setOrderData(ord);
      // If the order has an activation sequence that includes
      // "configure devices" but the wizard data lacks deviceConfigs,
      // regenerate the wizard data using fulfillmentService.  This
      // ensures Step 3 pages are shown for orders created before
      // dynamic wizard generation was introduced.
      if (
        ord &&
        Array.isArray(ord.activationSequence) &&
        ord.activationSequence.map((s) => s.toLowerCase()).includes("configure devices") &&
        (!data || !data.deviceConfigs || Object.keys(data.deviceConfigs).length === 0)
      ) {
        try {
          const newData = await generateWizardData(ord.offeringId);
          if (newData) {
            // Persist the regenerated data and use it
            setWizardData(newData);
            persistWizardData(id, newData);
            data = newData;
          }
        } catch (err) {
          console.error("Wizard: failed to regenerate wizard data", err);
        }
      }
      // assign wizardData after regeneration or loaded
      setWizardData(data);
      setLoaded(true);
    }
    init();
  }, [id]);

  // Compute wizard steps once both wizard data and order data are loaded
  useEffect(() => {
    if (!wizardData || !orderData) return;
    // Determine which activation steps are enabled for this order
    const seq = Array.isArray(orderData.activationSequence)
      ? orderData.activationSequence.map((s) => s.toLowerCase())
      : [];
    // Determine if inventory allocation step is needed.  It is
    // explicitly enabled via the activation sequence or implied
    // when the wizard data lists any required equipment items.
    const hasAllocate = seq.includes("allocate hardware") ||
      (Array.isArray(wizardData?.requiredEquipment) && wizardData.requiredEquipment.some((i) => i.need > 0));
    const hasConfigure = seq.includes("configure devices");
    const hasInstall = seq.includes("install on site") || seq.includes("ship & install");
    // Build the dynamic steps array
    const dynamicSteps = [];
    dynamicSteps.push({ title: "Order Review & Confirmation", content: <Step1 /> });
    // Inventory allocation corresponds to Allocate hardware
    if (hasAllocate) {
      dynamicSteps.push({ title: "Inventory Allocation", content: <Step2 /> });
    }
    // Device configuration steps: include all device pages when the
    // activation sequence includes "configure devices".  Each page will
    // display its own message if no devices of that type exist.  This
    // mirrors the original hard‑coded behaviour where Step 3 tabs were
    // always present for configured offers.
    if (hasConfigure) {
      dynamicSteps.push({
        title: "Device Setup & Configuration (Firewalls)",
        content: <Step3Firewall />,
      });
      dynamicSteps.push({
        title: "Device Setup & Configuration (Switches)",
        content: <Step3Switch />,
      });
      dynamicSteps.push({
        title: "Device Setup & Configuration (Access Points)",
        content: <Step3AccessPoints />,
      });
    }
    // Always include testing and validation
    dynamicSteps.push({ title: "Testing & Validation", content: <Step4 /> });
    dynamicSteps.push({ title: "Final Validation Checklist", content: <Step5 /> });
    // Deployment planning corresponds to install/ship step
    if (hasInstall) {
      dynamicSteps.push({
        title: "Deployment Planning & Scheduling",
        content: <Step6 />,
      });
    }
    // Always include go live
    dynamicSteps.push({ title: "Go‑Live & Customer Handover", content: <Step7 /> });
    setWizardSteps(dynamicSteps);
    // Reset current step to 0 when recomputing
    setStep(0);
  }, [wizardData, orderData]);

  // Step definitions were previously static.  Now they are computed
  // dynamically based on the order's activation sequence (see
  // wizardSteps state).

  // Navigation configuration
  const navSections = [
    { title: "Global", items: [{ key: "overview", label: "Overview" }] },
    {
      title: "Manage",
      items: [
        { key: "guests", label: "Guests" },
        { key: "networkServices", label: "Network Services" },
      ],
    },
    {
      title: "Analyze",
      items: [
        { key: "alerts", label: "Alerts" },
        { key: "auditTrail", label: "Audit Trail" },
        { key: "reports", label: "Reports" },
      ],
    },
    {
      title: "Maintain",
      items: [
        { key: "firmware", label: "Firmware" },
        { key: "organization", label: "Organization" },
      ],
    },
  ];

  /**
   * Cancel the current order.  Marks the order status as
   * cancelled via orderService and navigates back to the
   * orders list.  If no order data is available the action
   * silently does nothing.
   */
  async function cancelCurrentOrder() {
    if (!orderData || !orderData.id) return;
    try {
      await updateOrder(orderData.id, { status: "cancelled" });
    } catch (err) {
      console.error("Failed to cancel order", err);
    }
    nav("/orders");
  }

  /**
   * Fill in all wizard inputs with fake/sample data.  This helper
   * allocates all required equipment, adds placeholder allocation
   * notes, populates every device configuration field with a sample
   * value, runs all tests, marks all validation checklist items as
   * checked and sets all deployment timeline stages to Completed.
   * It does not progress the wizard; users must still click through
   * each step manually.
   */
  async function fillFakeData() {
    const data = await getWizardData();
    if (!data) return;
    // Allocate all equipment
    if (Array.isArray(data.requiredEquipment)) {
      data.requiredEquipment.forEach((item) => {
        allocateEquipmentItem(item.name);
      });
    }
    // Add placeholder allocation notes
    updateAllocationNotes(["Auto‑allocated all items", "Sample note"]);
    // Populate device configuration fields
    const cfgs = data.deviceConfigs || {};
    Object.entries(cfgs).forEach(([rid, cfg]) => {
      cfg.sections?.forEach((section, sIdx) => {
        section.fields?.forEach((field, fIdx) => {
          const val = field.value || "Sample";
          updateDeviceConfig(rid, sIdx, fIdx, val);
        });
      });
    });
    // Run all tests
    const categories = [
      "firewallTests",
      "networkTests",
      "wirelessTests",
      "securityTests",
    ];
    categories.forEach((cat) => {
      const list = data[cat];
      if (Array.isArray(list)) {
        list.forEach((t) => {
          // serviceKey equals category name as stored in wizardData
          startTest(cat, t.test);
        });
      }
    });
    // Mark validation checklists
    [
      "hardwareValidation",
      "configurationValidation",
      "licenseValidation",
      "documentationChecks",
    ].forEach((sec) => {
      const items = data[sec];
      if (Array.isArray(items)) {
        items.forEach((_, idx) => {
          updateValidationStatus(sec, idx, "Checked");
        });
      }
    });
    // Mark deployment timeline stages as Completed
    if (Array.isArray(data.deploymentTimeline)) {
      data.deploymentTimeline.forEach((_, idx) => {
        updateTimelineStage(idx, "Completed");
      });
    }
    // Reload wizard data into state to reflect changes
    const updated = await getWizardData();
    setWizardData(updated);
  }

  // Step navigation
  const next = () => setStep((s) => Math.min(s + 1, wizardSteps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  // Handle nav clicks: update active key and auto-collapse when
  // switching away from the wizard.  Returning to overview expands
  // the sidebar again.
  function handleNavClick(key) {
    setActiveKey(key);
    // Load content for fake pages when selecting a non-overview section
    if (key !== "overview") {
      dolphinService.getSection(key).then((items) => setPageData(items));
    }
  }

  // Determine if we are viewing the wizard (overview)
  const isOverview = activeKey === "overview";
  const currentStep = wizardSteps[step];

  // Placeholder page component
  function FakePage({ sectionKey }) {
    const label = navSections
      .flatMap((sec) => sec.items)
      .find((item) => item.key === sectionKey)?.label;
    return (
      <div className="p-6 bg-white shadow rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">{label}</h2>
        {pageData && pageData.length > 0 ? (
          <div className="space-y-2">
            {sectionKey === "guests" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-gray-100">
                    <th className="px-2 py-1">Name</th>
                    <th className="px-2 py-1">Users</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((g, idx) => (
                    <tr key={idx} className={idx % 2 ? 'bg-gray-50' : ''}>
                      <td className="px-2 py-1">{g.name}</td>
                      <td className="px-2 py-1">{g.users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {sectionKey === "networkServices" && (
              <ul className="list-disc list-inside text-sm space-y-1">
                {pageData.map((s, idx) => (
                  <li key={idx}>
                    {s.service} – {s.status}
                  </li>
                ))}
              </ul>
            )}
            {sectionKey === "alerts" && (
              <ul className="space-y-1 text-sm">
                {pageData.map((a, idx) => (
                  <li key={idx} className="border-b pb-1">
                    <span className="font-medium">{a.type}</span>: {a.message} —{' '}
                    <span className="text-xs text-gray-500">{a.time}</span>
                  </li>
                ))}
              </ul>
            )}
            {sectionKey === "auditTrail" && (
              <ul className="space-y-1 text-sm">
                {pageData.map((e, idx) => (
                  <li key={idx} className="border-b pb-1">
                    <span className="font-medium">{e.user}</span> {e.action} –{' '}
                    <span className="text-xs text-gray-500">{e.time}</span>
                  </li>
                ))}
              </ul>
            )}
            {sectionKey === "reports" && (
              <ul className="list-disc list-inside text-sm space-y-1">
                {pageData.map((r, idx) => (
                  <li key={idx}>
                    {r.report} – <span className="text-xs text-gray-500">{r.date}</span>
                  </li>
                ))}
              </ul>
            )}
            {sectionKey === "firmware" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-gray-100">
                    <th className="px-2 py-1">Device</th>
                    <th className="px-2 py-1">Version</th>
                    <th className="px-2 py-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((f, idx) => (
                    <tr key={idx} className={idx % 2 ? 'bg-gray-50' : ''}>
                      <td className="px-2 py-1">{f.device}</td>
                      <td className="px-2 py-1">{f.version}</td>
                      <td className="px-2 py-1">{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {sectionKey === "organization" && (
              <ul className="space-y-1 text-sm">
                {pageData.map((m, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{m.name}</span> – {m.role}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-gray-600">
            No data available for this section.
          </p>
        )}
      </div>
    );
  }

  /**
   * Inline Dolphin Shield logo.  Renders a simple shield shape with a
   * stylised wave inside.  The logo inherits the current text color
   * and scales with the collapsed state.
   */
  function DolphinLogo() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className="h-8 w-8"
        aria-label="Dolphin Shield logo"
      >
        {/* Shield outline */}
        <path
          d="M32 2 L58 12 V34 C58 46 48 58 32 62 C16 58 6 46 6 34 V12 Z"
          fill="currentColor"
        />
        {/* Wave stylisation */}
        <path
          d="M20 32 Q32 20 44 32 Q38 32 32 26 Q26 32 20 32 Z"
          fill="white"
        />
      </svg>
    );
  }

  if (!loaded) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
        Loading wizard...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-blue-800 text-white flex flex-col transition-all duration-200 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Brand and customer info */}
        <div className="p-4 border-b border-blue-700 flex items-center gap-3">
          {/* Logo: show at all sizes */}
          <div className="text-white">
            <DolphinLogo />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight">Dolphin Shield</h1>
              {wizardData && (
                <p className="text-xs uppercase text-blue-200 whitespace-nowrap">
                  Customer: {wizardData.customerInfo?.Company || ""}
                </p>
              )}
            </div>
          )}
        </div>
        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="mt-4">
              {!collapsed && (
                <p className="px-4 py-1 text-xs tracking-wide text-blue-300 uppercase">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-150 ${
                    activeKey === item.key ? "bg-blue-700" : "hover:bg-blue-700"
                  } ${collapsed && "justify-center"}`}
                >
                  {collapsed ? item.label.charAt(0) : item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-4 border-t border-blue-700 hover:bg-blue-700 flex justify-center"
        >
          {collapsed ? ">" : "<"}
        </button>
      </aside>
      {/* Main content area */}
      <div className="flex-1 bg-gray-100 p-6">
        {isOverview ? (
          <>
            {/* Wizard header */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                Step {step + 1} of {wizardSteps.length}: {currentStep?.title}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={fillFakeData}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                >
                  Fill Fake Data
                </button>
                <button
                  onClick={cancelCurrentOrder}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Cancel Order
                </button>
                <button
                  onClick={() => window.alert("Notify customer clicked")}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm"
                >
                  Notify Customer
                </button>
                <button
                  onClick={() => {
                    // If the current step has a custom handler via window helper
                    if (typeof window.nextWizardStep === "function") {
                      window.nextWizardStep();
                    } else {
                      next();
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Confirm &amp; Continue
                </button>
              </div>
            </div>
            {/* Current step */}
            <div className="bg-white shadow rounded-lg p-4">
              {/* Render the current step's content once it exists.  Until the
                  dynamic steps have been computed, display a placeholder
                  to avoid accessing properties of undefined. */}
              {currentStep ? currentStep.content : <div>Loading…</div>}
            </div>
            {/* Wizard navigation buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={prev}
                disabled={step === 0}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              >
                Back
              </button>
              {step < wizardSteps.length - 1 ? (
                <button
                  onClick={next}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => nav(`/orders/${id}`)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Finish
                </button>
              )}
            </div>
          </>
        ) : (
          <FakePage sectionKey={activeKey} />
        )}
      </div>
    </div>
  );
}