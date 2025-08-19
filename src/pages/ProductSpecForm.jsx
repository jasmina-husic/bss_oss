import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addProduct,
  updateProduct,
  getProductById,
} from "../services/productService";
import { fetchCfsPage } from "../services/cfsService";
import { fetchCategories } from "../services/categoryService";
import StepsEditor from "../components/StepsEditor";
import { loadDeviceTemplates } from "../services/deviceTemplateService";

const REQUIRED = ["sku", "name", "category"];

export default function ProductSpecForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [cfsAll, setCfsAll] = useState([]);

  // List of available device templates for selection in the form.
  const [availableTemplates, setAvailableTemplates] = useState([]);

  // Map of templateId -> template definition (sections/fields).  Used
  // to render a preview of the selected template.
  const [templateMap, setTemplateMap] = useState({});

  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    description: "",
    priceOneOff: 0,
    priceMonthly: 0,
    sequence: [],
    cfsIds: [],
    deviceTemplateId: "",
  });

  /* preload categories + cfs + existing product */
  useEffect(() => {
    (async () => {
      setCategories(await fetchCategories());
      const cfsRes = await fetchCfsPage(0, 9999, "", []);
      setCfsAll(cfsRes.records);
      // Load device templates for selection.  We flatten the
      // returned object into an array of { id, name } for the
      // dropdown.  If loading fails, leave the list empty.
      try {
        const templates = await loadDeviceTemplates();
        const arr = Object.entries(templates).map(([key, tpl]) => ({ id: key, name: tpl.displayName || key }));
        setAvailableTemplates(arr);
        setTemplateMap(templates);
      } catch (err) {
        console.error("Failed to load device templates", err);
      }

      if (editing) {
        const prod = getProductById(parseInt(id, 10));
        if (prod) {
          setForm({
            sku: prod.sku || "",
            name: prod.name || "",
            category: prod.category || "",
            description: prod.description || "",
            priceOneOff: prod.priceOneOff ?? 0,
            priceMonthly: prod.priceMonthly ?? 0,
            sequence: prod.sequence || [],
            cfsIds: prod.cfsIds || [],
            deviceTemplateId: prod.deviceTemplateId || "",
          });
        }
      }
    })();
  }, [editing, id]);

  /* derived */
  const visibleCfs = useMemo(
    () =>
      form.category
        ? cfsAll.filter((s) => s.category === form.category)
        : cfsAll,
    [cfsAll, form.category]
  );

  /* helpers */
  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const toggleCfs = (cid) =>
    setForm((f) => ({
      ...f,
      cfsIds: f.cfsIds.includes(cid)
        ? f.cfsIds.filter((x) => x !== cid)
        : [...f.cfsIds, cid],
    }));

  const onSubmit = (e) => {
    e.preventDefault();
    for (const r of REQUIRED) {
      if (!form[r]) {
        alert("Required field missing");
        return;
      }
    }
    const save = editing
      ? () => updateProduct(parseInt(id, 10), form)
      : () => addProduct(form);
    save().then(() => nav("/catalog/products"));
  };

  /* UI */
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-lg font-medium mb-4">
        {editing ? "Edit" : "Add"} Product
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {["sku", "name"].map((f) => (
          <label key={f} className="block">
            <span className="text-sm">{f.toUpperCase()} *</span>
            <input
              name={f}
              className="mt-1 w-full border rounded p-2"
              value={form[f]}
              onChange={onChange}
            />
          </label>
        ))}

        {/* category */}
        <label className="block">
          <span className="text-sm">Category *</span>
          <select
            name="category"
            className="mt-1 w-full border rounded p-2"
            value={form.category}
            onChange={onChange}
            required
          >
            <option value="">— pick —</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        {/* numeric prices */}
        {[
          ["priceOneOff", "One‑off price"],
          ["priceMonthly", "Monthly price"],
        ].map(([f, lbl]) => (
          <label key={f} className="block">
            <span className="text-sm">{lbl}</span>
            <input
              name={f}
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full border rounded p-2"
              value={form[f] ?? 0}
              onChange={onChange}
            />
          </label>
        ))}

        <label className="block">
          <span className="text-sm">Description</span>
          <textarea
            name="description"
            rows="3"
            className="mt-1 w-full border rounded p-2"
            value={form.description}
            onChange={onChange}
          />
        </label>

        {/* CFS */}
        <fieldset className="border rounded p-3">
          <legend className="text-sm">Customer‑facing services</legend>
          {visibleCfs.map((s) => (
            <label key={s.id} className="block">
              <input
                type="checkbox"
                className="mr-2"
                checked={form.cfsIds.includes(s.id)}
                onChange={() => toggleCfs(s.id)}
              />
              {s.name}
            </label>
          ))}
        </fieldset>

        {/* steps */}
        <label className="block">
          <span className="text-sm">Realisation sequence</span>
          <StepsEditor
            steps={form.sequence}
            onChange={(seq) => setForm({ ...form, sequence: seq })}
          />
        </label>

        {/* device template selection */}
        <label className="block">
          <span className="text-sm">Device template</span>
          <select
            name="deviceTemplateId"
            className="mt-1 w-full border rounded p-2"
            value={form.deviceTemplateId || ""}
            onChange={(e) => setForm({ ...form, deviceTemplateId: e.target.value })}
          >
            <option value="">— none —</option>
            {availableTemplates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </label>

        {/* Template preview shows the sections and fields of the selected template. */}
        {form.deviceTemplateId && templateMap[form.deviceTemplateId] && (
          <div className="mt-3 p-3 border rounded bg-gray-50">
            <p className="text-sm font-semibold mb-1">Template Preview</p>
            {templateMap[form.deviceTemplateId].sections?.map((section, idx) => (
              <div key={idx} className="mb-2">
                <p className="font-medium text-sm">{section.title}</p>
                <ul className="list-disc list-inside text-sm ml-4">
                  {section.fields?.map((field, fIdx) => (
                    <li key={fIdx}>{field.label}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

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
