import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getOrderById,
  updateOrder,
  addComment,
} from "../services/orderService";
import { fetchOfferingsPage } from "../services/offeringService";
import { fetchCustomersPage } from "../services/customerService";
import { fetchProductsPage } from "../services/productService";

const STAGES = [
  "prospect",
  "negotiation",
  "contract",
  "activation",
  "delivery",
  "closed",
];

export default function OrderForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [order, setOrder] = useState(null);
  const [off, setOff] = useState(null);
  const [cust, setCust] = useState(null);
  const [prodMap, setProdMap] = useState({});
  const [comment, setComment] = useState("");

  /* ────────────────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      const o = await getOrderById(Number(id));
      if (!o) return nav("/orders");

      const [custRes, offRes, prodRes] = await Promise.all([
        fetchCustomersPage(0, 9999, "", []),
        fetchOfferingsPage(0, 9999, "", [], ""),
        fetchProductsPage(0, 9999, "", [], ""),
      ]);

      setOrder(o);
      setCust(custRes.records.find((c) => c.id === o.customerId) || null);
      setOff(offRes.records.find((v) => v.id === o.offeringId) || null);
      setProdMap(
        Object.fromEntries(prodRes.records.map((p) => [p.id, p.name]))
      );
    })();
  }, [id, nav]);

  if (!order || !off || !cust) return <div className="p-6">Loading…</div>;

  /* helper: patch + reload */
  const patch = (p) =>
    updateOrder(order.id, p).then(async () =>
      setOrder(await getOrderById(order.id))
    );

  /* next‑stage guard */
  const nextStage = () => {
    if (
      order.stage === "activation" &&
      order.activationIndex < off.activationSequence.length
    ) {
      alert("Finish all activation steps before moving to delivery.");
      return;
    }
    const idx = STAGES.indexOf(order.stage);
    if (idx < STAGES.length - 1) patch({ stage: STAGES[idx + 1] });
  };

  /* manual stage change */
  const changeStage = (val) => {
    if (
      val === "delivery" &&
      order.activationIndex < off.activationSequence.length
    ) {
      alert("Cannot enter delivery until activation steps complete.");
      return;
    }
    patch({ stage: val });
  };

  /* activation steps */
  const toggleStep = (i) => {
    if (order.stage !== "activation") return;
    if (i >= order.activationIndex) patch({ activationIndex: i + 1 });
  };

  /* comments */
  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await addComment(order.id, comment.trim(), order.stage);
    setOrder(await getOrderById(order.id));
    setComment("");
  };

  const allStepsDone = order.activationIndex >= off.activationSequence.length;

  /* pricing helper (setup + monthly rows come from pricePlan) */
  const unitFor = (comp) => {
    // products may have their own price later – for now return 0
    return 0;
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-lg font-medium">
        Order #{order.id} — {order.contractNumber}
      </h1>

      {/* basic cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded p-3 text-sm">
          <h2 className="font-medium mb-1">Customer</h2>
          <p>{cust.name}</p>
        </div>
        <div className="border rounded p-3 text-sm">
          <h2 className="font-medium mb-1">Offering</h2>
          <p>{off.name}</p>
          <p className="text-xs text-gray-500">{off.description}</p>
        </div>
      </div>

      {/* financials */}
      <div className="border rounded p-3 overflow-x-auto">
        <h2 className="text-sm font-medium mb-2">Financials</h2>
        <table className="min-w-full text-xs">
          <thead>
            <tr className="text-gray-500">
              <th className="px-2 py-1 text-left">Item</th>
              <th className="px-2 py-1 text-left">Billing</th>
              <th className="px-2 py-1">Qty</th>
              <th className="px-2 py-1 text-right">Unit</th>
              <th className="px-2 py-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {off.pricePlan && (
              <>
                <tr className="border-t">
                  <td className="px-2 py-1">Setup fee</td>
                  <td className="px-2 py-1">oneOff</td>
                  <td className="px-2 py-1 text-center">1</td>
                  <td className="px-2 py-1 text-right">
                    {off.pricePlan.setupFee.toFixed(2)}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {off.pricePlan.setupFee.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-2 py-1">Monthly subscription</td>
                  <td className="px-2 py-1">monthly</td>
                  <td className="px-2 py-1 text-center">1</td>
                  <td className="px-2 py-1 text-right">
                    {off.pricePlan.monthlyFee.toFixed(2)}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {off.pricePlan.monthlyFee.toFixed(2)}
                  </td>
                </tr>
              </>
            )}
            {off.components.map((c, i) => (
              <tr key={`${c.productId}-${i}`} className="border-t">
                <td className="px-2 py-1">
                  {prodMap[c.productId] || `#${c.productId}`}
                </td>
                <td className="px-2 py-1 capitalize">{c.billing}</td>
                <td className="px-2 py-1 text-center">{c.qty}</td>
                <td className="px-2 py-1 text-right">
                  {unitFor(c).toFixed(2)}
                </td>
                <td className="px-2 py-1 text-right">
                  {(unitFor(c) * c.qty).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t text-xs font-medium">
              <td colSpan={4} className="px-2 py-1 text-right">
                One‑off total
              </td>
              <td className="px-2 py-1 text-right">
                {(
                  (off.pricePlan?.setupFee || 0) +
                  off.components
                    .filter((c) => c.billing === "oneOff")
                    .reduce((s, c) => s + unitFor(c) * c.qty, 0)
                ).toFixed(2)}
              </td>
            </tr>
            <tr className="text-xs font-medium">
              <td colSpan={4} className="px-2 py-1 text-right">
                Monthly MRR
              </td>
              <td className="px-2 py-1 text-right">
                {(
                  (off.pricePlan?.monthlyFee || 0) +
                  off.components
                    .filter((c) => c.billing === "monthly")
                    .reduce((s, c) => s + unitFor(c) * c.qty, 0)
                ).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* stage */}
      <div className="border rounded p-3">
        <h2 className="text-sm font-medium mb-2">Stage</h2>
        <div className="flex gap-1 flex-wrap">
          {STAGES.map((s) => (
            <span
              key={s}
              className={
                "px-2 py-1 rounded text-xs " +
                (s === order.stage ? "bg-black text-white" : "bg-gray-200")
              }
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {order.stage !== "closed" && (
            <button
              onClick={nextStage}
              className="px-3 py-1 bg-black text-white rounded text-xs"
            >
              Next Stage
            </button>
          )}
          <select
            value={order.stage}
            onChange={(e) => changeStage(e.target.value)}
            className="border rounded p-1 text-xs"
          >
            {STAGES.map((s) => (
              <option key={s} disabled={s === "delivery" && !allStepsDone}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* activation steps */}
      {order.stage !== "prospect" &&
        order.stage !== "negotiation" &&
        order.stage !== "contract" && (
          <div className="border rounded p-3">
            <h2 className="text-sm font-medium mb-2">
              Activation ({order.activationIndex}/
              {off.activationSequence.length})
            </h2>
            {off.activationSequence.map((step, i) => (
              <label key={i} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={i < order.activationIndex}
                  disabled={order.stage !== "activation"}
                  onChange={() => toggleStep(i)}
                />
                {step}
              </label>
            ))}
            {order.stage === "activation" && !allStepsDone && (
              <p className="text-xs text-red-600 mt-1">
                Complete all steps to finish activation.
              </p>
            )}
          </div>
        )}

      {/* comments */}
      <div className="border rounded p-3">
        <h2 className="text-sm font-medium mb-2">Comments</h2>
        <div className="space-y-1 max-h-48 overflow-y-auto mb-2 text-xs">
          {order.comments?.map((c, i) => (
            <div key={i}>
              [{c.stage}] {c.text}
            </div>
          ))}
        </div>
        <form onSubmit={submitComment} className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border rounded p-1 flex-1 text-xs"
            placeholder="Add comment…"
          />
          <button className="px-2 py-1 bg-black text-white rounded text-xs">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
