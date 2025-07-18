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
  const [comment, setComment] = useState("");

  useEffect(() => {
    async function load() {
      // load order via order service (may return undefined if not found)
      let ord;
      try {
        ord = await getOrderById(Number(id));
      } catch (e) {}
      if (ord) setOrder(ord);
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

  const handleStageChange = async (e) => {
    const newStage = e.target.value;
    setStage(newStage);
    if (order) {
      // update order via service if available
      if (typeof updateOrder === "function") {
        try {
          await updateOrder({ ...order, stage: newStage });
        } catch (err) {
          // fallback: update orders in localStorage
          const stored = localStorage.getItem("orders");
          if (stored) {
            const arr = JSON.parse(stored);
            const idx = arr.findIndex((o) => o.id === order.id);
            if (idx >= 0) {
              arr[idx].stage = newStage;
              localStorage.setItem("orders", JSON.stringify(arr));
            }
          }
        }
      }
    }
  };

  if (!order || !wizard) {
    return <div className="p-6">Loading order…</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-lg font-semibold">
        Order #{order.id} — {order.contractNumber}
      </h1>
      {/* Customer and Offering summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-4 bg-gray-50">
          <h2 className="font-semibold text-sm mb-2">Customer</h2>
          <p>{order.customerName || order.customerId}</p>
        </div>
        <div className="border rounded p-4 bg-gray-50">
          <h2 className="font-semibold text-sm mb-2">Offering</h2>
          <p>{order.offeringName || order.offeringId}</p>
        </div>
      </div>
      {/* Equipment breakdown */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Equipment Breakdown</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 text-left">Item</th>
              <th className="px-2 py-1 text-left">SKU</th>
              <th className="px-2 py-1 text-right">Qty</th>
              <th className="px-2 py-1 text-right">Unit Price</th>
              <th className="px-2 py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {wizard.equipmentBreakdown.map((row, idx) => (
              <tr key={idx} className={idx % 2 ? "bg-gray-50" : ""}>
                <td className="px-2 py-1">{row.item}</td>
                <td className="px-2 py-1">{row.sku}</td>
                <td className="px-2 py-1 text-right">{row.qty}</td>
                <td className="px-2 py-1 text-right">${row.unitPrice.toFixed(2)}</td>
                <td className="px-2 py-1 text-right">${row.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="text-right font-medium pr-2">Subtotal</td>
              <td className="text-right font-medium">${equipmentSubtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="4" className="text-right pr-2">Installation & Services</td>
              <td className="text-right">${installationFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="4" className="text-right font-semibold pr-2">Total</td>
              <td className="text-right font-semibold">${totalValue.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {/* Project timeline and locations */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Project Timeline</h3>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(wizard.projectTimeline).map(([k, v]) => (
                <tr key={k}>
                  <td className="pr-2 font-medium">{k}:</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Deployment Locations</h3>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(wizard.deploymentLocations).map(([k, v]) => (
                <tr key={k}>
                  <td className="pr-2 font-medium">{k}:</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {wizard.specialRequirements && (
            <div className="mt-2 text-sm">
              <h4 className="font-medium">Special Requirements</h4>
              <ul className="list-disc list-inside">
                {wizard.specialRequirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Stage and comments */}
      <div className="border rounded p-4 space-y-3">
        <h3 className="font-semibold">Stage</h3>
        <select value={stage} onChange={handleStageChange} className="border rounded p-2">
          {stages.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div>
          <h4 className="font-semibold mt-4">Comments</h4>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="3"
            className="w-full border rounded p-2 mt-1"
            placeholder="Add comment…"
          />
        </div>
      </div>
    </div>
  );
}
