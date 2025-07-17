import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addOrder } from "../services/orderService";
import { fetchCustomersPage } from "../services/customerService";
import {
  fetchOfferingsPage,
  getOfferingById,
} from "../services/offeringService";

function contractNum() {
  return "ORD-" + Date.now().toString().slice(-6);
}

export default function OrderNew() {
  const nav = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    customerId: "",
    offeringId: "",
    orderType: "new",
    contractNumber: contractNum(),
    contractStart: "",
    contractEnd: "",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      setCustomers((await fetchCustomersPage(0, 9999, "", [])).records);
      setOfferings(
        (await fetchOfferingsPage(0, 9999, "", [], "active")).records
      );
    })();
  }, []);

  useEffect(() => {
    setPreview(
      form.offeringId ? getOfferingById(Number(form.offeringId)) : null
    );
  }, [form.offeringId]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    await addOrder({
      ...form,
      customerId: Number(form.customerId),
      offeringId: Number(form.offeringId),
      stage: "prospect",
    });
    nav("/orders");
  };

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-lg font-medium">New Order</h1>
      <form onSubmit={save} className="grid gap-4">
        <label className="text-sm">
          Contract #
          <input
            value={form.contractNumber}
            disabled
            className="w-full border rounded p-2 mt-1"
          />
        </label>
        <label className="text-sm">
          Customer
          <select
            name="customerId"
            value={form.customerId}
            onChange={onChange}
            required
            className="w-full border rounded p-2 mt-1"
          >
            <option value="">— pick —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Offering
          <select
            name="offeringId"
            value={form.offeringId}
            onChange={onChange}
            required
            className="w-full border rounded p-2 mt-1"
          >
            <option value="">— pick —</option>
            {offerings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Contract Start
          <input
            type="date"
            name="contractStart"
            value={form.contractStart}
            onChange={onChange}
            className="w-full border rounded p-2 mt-1"
          />
        </label>
        <label className="text-sm">
          Contract End
          <input
            type="date"
            name="contractEnd"
            value={form.contractEnd}
            onChange={onChange}
            className="w-full border rounded p-2 mt-1"
          />
        </label>
        <label className="text-sm">
          Notes
          <textarea
            name="notes"
            rows="3"
            value={form.notes}
            onChange={onChange}
            className="w-full border rounded p-2 mt-1"
          />
        </label>
        <button className="px-4 py-2 bg-black text-white rounded">
          Create
        </button>
      </form>
      {preview && (
        <div className="border rounded p-3 text-xs bg-gray-50">
          <h2 className="font-medium">{preview.name}</h2>
          <p>{preview.description}</p>
          {preview.pricePlan && (
            <p>
              Setup {preview.pricePlan.setupFee} / Monthly{" "}
              {preview.pricePlan.monthlyFee}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
