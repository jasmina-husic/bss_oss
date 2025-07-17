import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addRfs, updateRfs, getRfsById } from "../services/rfsService";

const BLANK = {
  name: "",
  category: "",
  resourceType: "",
  provider: "",
  unit: "",
  provisioning: {
    type: "REST",
    endpoint: "",
    httpMethod: "POST",
    payloadTemplate: {},
  },
  characteristics: [],
  lifecycleState: "active",
  version: "1.0",
};

export default function RfsSpecForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    if (editing) {
      const r = getRfsById(parseInt(id, 10));
      if (r) setForm({ ...BLANK, ...r });
    }
  }, [editing, id]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onProvChange = (field, val) =>
    setForm({ ...form, provisioning: { ...form.provisioning, [field]: val } });
  const onSubmit = (e) => {
    e.preventDefault();
    (editing
      ? () => updateRfs(parseInt(id, 10), form)
      : () => addRfs(form))().then(() => nav("/catalog/rfs"));
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-lg font-medium mb-4">
        {editing ? "Edit" : "Add"} Resource Spec
      </h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {["name", "category", "resourceType", "provider", "unit"].map((f) => (
          <label key={f} className="block">
            <span className="text-sm">{f}</span>
            <input
              name={f}
              className="w-full border rounded p-2 mt-1"
              value={form[f]}
              onChange={onChange}
            />
          </label>
        ))}

        <fieldset className="border rounded p-3">
          <legend className="text-sm">Provisioning</legend>
          <label className="block text-xs">
            Endpoint
            <input
              className="w-full border rounded p-1 mt-1"
              value={form.provisioning.endpoint}
              onChange={(e) => onProvChange("endpoint", e.target.value)}
            />
          </label>
          <label className="block text-xs">
            Method
            <select
              className="w-full border rounded p-1 mt-1"
              value={form.provisioning.httpMethod}
              onChange={(e) => onProvChange("httpMethod", e.target.value)}
            >
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
            </select>
          </label>
          <label className="block text-xs">Payload (JSON)</label>
          <textarea
            rows="3"
            className="w-full border rounded p-1 font-mono text-xs"
            value={JSON.stringify(form.provisioning.payloadTemplate, null, 2)}
            onChange={(e) =>
              onProvChange(
                "payloadTemplate",
                JSON.parse(e.target.value || "{}")
              )
            }
          />
        </fieldset>

        <label className="block">
          <span className="text-sm">Characteristics (JSON array)</span>
          <textarea
            rows="3"
            className="w-full border rounded p-1 font-mono text-xs"
            value={JSON.stringify(form.characteristics, null, 2)}
            onChange={(e) =>
              setForm({
                ...form,
                characteristics: JSON.parse(e.target.value || "[]"),
              })
            }
          />
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
