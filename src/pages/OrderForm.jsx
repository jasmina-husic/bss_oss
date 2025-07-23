import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderById, updateOrder } from "../services/orderService";
import { getCurrentOrder, setCurrentOrderId, initWizardForOrder } from "../services/orderWizardService";

/**
 * OrderForm displays details for an existing order, including a summary of
 * equipment, totals, project timeline, deployment locations and special
 * requirements.  It also allows updating the order stage via a
 * dropdown and editing comments (not persisted beyond session).
 */
export default function OrderForm() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [wizard, setWizard] = useState(null);
  const [stage, setStage] = useState("prospect");
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [comment, setComment] = useState("");
  // Toggle for showing the raw order and wizard JSON.  Many
  // administrators need to inspect the underlying data when
  // troubleshooting provisioning issues or validating that the
  // wizard has captured all necessary details.  When true, a
  // prettified JSON dump of the order and wizard state will be
  // displayed at the bottom of the page.
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    async function load() {
      // load order via order service (may return undefined if not found)
      let ord;
      try {
        ord = await getOrderById(Number(id));
      } catch (e) {}
      if (ord) {
        setOrder(ord);
        setStatus(ord.status || "");
        setDueDate(ord.dueDate || "");
      }
      // initialise and load wizard data for this order
      await initWizardForOrder(id);
      setCurrentOrderId(id);
      const data = getCurrentOrder();
      setWizard(data);
      if (ord && ord.stage) setStage(ord.stage);
    }
    load();
  }, [id]);

  // Compute totals from wizard data
  const equipmentSubtotal = wizard?.equipmentBreakdown?.reduce((sum, i) => sum + i.total, 0) || 0;
  const installationFee = wizard?.installationServices || 0;
  const totalValue = wizard?.totalOrderValue || equipmentSubtotal + installationFee;

  const stages = ["prospect", "negotiation", "contract", "activation", "delivery", "closed"];

  const handleStatusChange = async (e) => {
    const val = e.target.value;
    setStatus(val);
    if (order) {
      try {
        await updateOrder(order.id, { status: val });
      } catch {
        // fallback update localStorage
        const stored = localStorage.getItem("bss_orders");
        if (stored) {
          const arr = JSON.parse(stored);
          const idx = arr.findIndex((o) => o.id === order.id);
          if (idx >= 0) {
            arr[idx].status = val;
            localStorage.setItem("bss_orders", JSON.stringify(arr));
          }
        }
      }
    }
  };

  const handleDueDateChange = async (e) => {
    const val = e.target.value;
    setDueDate(val);
    if (order) {
      try {
        await updateOrder(order.id, { dueDate: val });
      } catch {
        const stored = localStorage.getItem("bss_orders");
        if (stored) {
          const arr = JSON.parse(stored);
          const idx = arr.findIndex((o) => o.id === order.id);
          if (idx >= 0) {
            arr[idx].dueDate = val;
            localStorage.setItem("bss_orders", JSON.stringify(arr));
          }
        }
      }
    }
  };

  const handleStageChange = async (e) => {
    const newStage = e.target.value;
    setStage(newStage);
    if (order) {
      try {
        // update only the stage on the order record
        await updateOrder(order.id, { stage: newStage });
      } catch (err) {
        // fallback: update orders in localStorage if service fails
        const stored = localStorage.getItem("bss_orders");
        if (stored) {
          const arr = JSON.parse(stored);
          const idx = arr.findIndex((o) => o.id === order.id);
          if (idx >= 0) {
            arr[idx].stage = newStage;
            localStorage.setItem("bss_orders", JSON.stringify(arr));
          }
        }
      }
    }
  };

  if (!order || !wizard) {
    return <div className="p-6">Loading order…</div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <h1 className="text-xl font-semibold mb-2">
        Order #{order.id} — {order.contractNumber}
      </h1>
      {/* Equipment breakdown card */}
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
            {wizard.equipmentBreakdown.map((row, idx) => (
              <tr key={row.sku} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-2 whitespace-nowrap">{row.item}</td>
                <td className="p-2 whitespace-nowrap">{row.sku}</td>
                <td className="p-2 text-right">{row.qty}</td>
                <td className="p-2 text-right">${row.unitPrice.toLocaleString()}</td>
                <td className="p-2 text-right">${row.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-200 text-sm text-right space-y-0.5">
          <p className="font-medium">Equipment Subtotal: ${equipmentSubtotal.toLocaleString()}</p>
          <p>+ Installation &amp; Professional Services: ${installationFee.toLocaleString()}</p>
          <p className="font-semibold">Total Order Value: ${totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Info panels: Customer and Offering */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-blue-800 text-white uppercase text-xs font-semibold px-4 py-2">
            Customer Information
          </div>
          <div className="p-4 text-sm space-y-1">
            <p>
              <span className="font-medium">Name:</span> {order.customerName || order.customerId}
            </p>
            <p>
              <span className="font-medium">Offering:</span> {order.offeringName || order.offeringId}
            </p>
          </div>
        </div>
        {/* Deployment Locations & Special Requirements */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-blue-800 text-white uppercase text-xs font-semibold px-4 py-2">
            Deployment Details
          </div>
          <div className="p-4 text-sm space-y-4">
            <div>
              <h4 className="font-medium mb-1">Locations</h4>
              {Object.entries(wizard.deploymentLocations).map(([k, v]) => (
                <p key={k}>
                  <span className="font-medium">{k}:</span> {v}
                </p>
              ))}
            </div>
            {wizard.specialRequirements && wizard.specialRequirements.length > 0 && (
              <div>
                <h4 className="font-medium mb-1">Special Requirements</h4>
                <ul className="list-disc list-inside space-y-1">
                  {wizard.specialRequirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-blue-800 text-white uppercase text-xs font-semibold px-4 py-2">
          Project Timeline
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
          {Object.entries(wizard.projectTimeline).map(([label, value]) => (
            <div key={label} className="p-4 space-y-1">
              <p className="uppercase text-xs text-gray-500">{label}</p>
              <span className="text-sm">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Metadata */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-blue-800 text-white uppercase text-xs font-semibold px-4 py-2">
          Order Metadata
        </div>
        <div className="p-4 space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1">Stage</label>
              <select
                value={stage}
                onChange={handleStageChange}
                className="w-full border border-gray-300 rounded p-2"
              >
                {stages.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={handleStatusChange}
                className="w-full border border-gray-300 rounded p-2"
              >
                <option value="">— select —</option>
                {['confirmed','staging','ready','deployed','negotiation','review','validation'].map((opt) => (
                  <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate || ''}
                onChange={handleDueDateChange}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Add comment…"
            />
          </div>
        </div>
      </div>

      {/* Debug: raw order/wizard JSON */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-blue-800 text-white uppercase text-xs font-semibold px-4 py-2 flex items-center justify-between">
          <span>Order Data (JSON)</span>
          <button
            className="text-xs underline text-gray-200 hover:text-white focus:outline-none"
            onClick={() => setShowJson(!showJson)}
          >
            {showJson ? 'Hide' : 'Show'}
          </button>
        </div>
        {showJson && (
          <pre className="p-4 text-xs overflow-x-auto bg-gray-50">
            {JSON.stringify({ order, wizard }, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
