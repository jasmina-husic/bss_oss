import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addCustomer,
  updateCustomer,
  getCustomerById,
} from "../services/customerService";

const STATES = ["prospect", "validated", "active", "inactive"];
const MANAGERS = ["Alice Smith", "Bob Jones", "Dana White", "Hannah Lee"];
const REQUIRED = [
  "name",
  "email",
  "company",
  "phone",
  "accountManager",
  "state",
];

export default function CustomerForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    website: "",
    address: "",
    city: "",
    country: "",
    accountManager: "",
    state: "prospect",
  });

  useEffect(() => {
    if (editing) {
      const c = getCustomerById(parseInt(id, 10));
      if (c) setForm(c);
    }
  }, [editing, id]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function onSubmit(e) {
    e.preventDefault();
    for (const f of REQUIRED) {
      if (!form[f]?.trim()) {
        alert(`Field “${f}” is required`);
        return;
      }
    }
    editing ? updateCustomer(parseInt(id, 10), form) : addCustomer(form);
    nav("/crm");
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-lg font-medium mb-4">
        {editing ? "Edit" : "Add"} Account
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {editing && (
          <div className="text-sm text-gray-500">
            CRM ID <span className="font-mono">{form.crmId}</span>
          </div>
        )}

        {/* simple grid */}
        {[
          ["name", "Account Name *"],
          ["email", "Email *", "email"],
          ["phone", "Phone *"],
          ["company", "Company *"],
          ["industry", "Industry"],
          ["website", "Website", "url"],
        ].map(([f, label, type = "text"]) => (
          <label key={f} className="block">
            <span className="text-sm">{label}</span>
            <input
              name={f}
              type={type}
              className="mt-1 w-full border rounded p-2"
              value={form[f]}
              onChange={onChange}
              required={label.includes("*")}
            />
          </label>
        ))}

        <label className="block">
          <span className="text-sm">Account Manager *</span>
          <select
            name="accountManager"
            className="mt-1 w-full border rounded p-2"
            value={form.accountManager}
            onChange={onChange}
            required
          >
            <option value="">— pick manager —</option>
            {MANAGERS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Lifecycle State *</span>
          <select
            name="state"
            className="mt-1 w-full border rounded p-2"
            value={form.state}
            onChange={onChange}
            required
          >
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-black text-white rounded">
            Save
          </button>
          <button
            type="button"
            onClick={() => nav(-1)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
