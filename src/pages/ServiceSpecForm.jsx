import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addCfs, updateCfs, getCfsById } from "../services/cfsService";
import { fetchRfsPage } from "../services/rfsService";

const BLANK = {
  name: "",
  category: "",
  serviceSpecs: [],
  characteristics: [],
  activationSequence: [],
};

export default function ServiceSpecForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [allRfs, setAllRfs] = useState([]);
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    (async () => {
      const r = (await fetchRfsPage(0, 9999, "", [])).records;
      setAllRfs(r);
      if (editing) {
        const s = getCfsById(parseInt(id, 10));
        if (s) setForm({ ...BLANK, ...s });
      }
    })();
  }, [editing, id]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggle = (id_) =>
    setForm((f) => ({
      ...f,
      serviceSpecs: f.serviceSpecs.includes(id_)
        ? f.serviceSpecs.filter((x) => x !== id_)
        : [...f.serviceSpecs, id_],
    }));
  const onSubmit = (e) => {
    e.preventDefault();
    (editing
      ? () => updateCfs(parseInt(id, 10), form)
      : () => addCfs(form))().then(() => nav("/catalog/services"));
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-lg font-medium mb-4">
        {editing ? "Edit" : "Add"} Service Spec
      </h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {["name", "category"].map((f) => (
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
          <legend className="text-sm">Linked RFS</legend>
          {allRfs.map((r) => (
            <label key={r.id} className="block">
              <input
                type="checkbox"
                className="mr-2"
                checked={form.serviceSpecs.includes(r.id)}
                onChange={() => toggle(r.id)}
              />{" "}
              {r.name}
            </label>
          ))}
        </fieldset>

        <label className="block">
          <span className="text-sm">Characteristics (JSON)</span>
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

        <label className="block">
          <span className="text-sm">Activation sequence (JSON array)</span>
          <textarea
            rows="3"
            className="w-full border rounded p-1 font-mono text-xs"
            value={JSON.stringify(form.activationSequence, null, 2)}
            onChange={(e) =>
              setForm({
                ...form,
                activationSequence: JSON.parse(e.target.value || "[]"),
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
