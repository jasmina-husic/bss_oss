import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductsPage } from "../services/productService";
import { fetchPrices, addPrice } from "../services/priceService";
import {
  addOffering,
  updateOffering,
  getOfferingById,
} from "../services/offeringService";
import StepsEditor from "../components/StepsEditor";

const makeDisc = () => ({
  contractMonths: { 24: 0 },
  loyaltyPercentPerYear: 0,
  bundleDiscount: { installationFee: 0, monthly: 0 },
});

const BLANK_PRICE = { oneOff: 0, monthly: 0, usage: 0, currency: "USD" };

export default function OfferingSpecForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [newPrice, setNewPrice] = useState(BLANK_PRICE);

  const [form, setForm] = useState({
    name: "",
    status: "active",
    description: "",
    // components array holds objects { productId, qty, billing }
    components: [],
    productIds: [],
    priceId: null,
    pricePlan: { setupFee: 0, monthlyFee: 0, currency: "USD" },
    discountRules: makeDisc(),
    activationSequence: [],
  });

  /* preload */
  useEffect(() => {
    (async () => {
      setProducts((await fetchProductsPage(0, 9999, "", [])).records);
      setPrices(await fetchPrices());

      if (editing) {
        const off = getOfferingById(parseInt(id, 10));
        if (off) {
          setForm({
            name: off.name,
            status: off.status,
            description: off.description,
            // if components exist use them, else derive from productIds
            components: Array.isArray(off.components)
              ? off.components.map((c) => ({
                  productId: c.productId,
                  qty: c.qty || 1,
                  billing: c.billing || "oneOff",
                }))
              : (off.productIds || []).map((pid) => ({
                  productId: pid,
                  qty: 1,
                  billing: "oneOff",
                })),
            productIds: off.productIds || [],
            priceId: off.priceId ?? null,
            pricePlan: off.pricePlan ?? {
              setupFee: 0,
              monthlyFee: 0,
              currency: "USD",
            },
            discountRules: {
              ...makeDisc(),
              ...off.discountRules,
              bundleDiscount: {
                ...makeDisc().bundleDiscount,
                ...(off.discountRules?.bundleDiscount || {}),
              },
            },
            activationSequence: off.activationSequence || [],
          });
        }
      }
    })();
  }, [editing, id]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  // Toggle product selection for legacy productIds list (unused when using components)
  const toggle = (pid) =>
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(pid)
        ? f.productIds.filter((x) => x !== pid)
        : [...f.productIds, pid],
    }));

  // Component helpers: add, update and remove product rows
  const addComp = () =>
    setForm((f) => ({
      ...f,
      components: [
        ...(f.components ?? []),
        { productId: "", qty: 1, billing: "oneOff" },
      ],
    }));
  const updateComp = (idx, field, value) =>
    setForm((f) => {
      const comps = (f.components ?? []).map((c, i) =>
        i === idx ? { ...c, [field]: value } : c
      );
      return { ...f, components: comps };
    });
  const removeComp = (idx) =>
    setForm((f) => {
      const comps = (f.components ?? []).filter((_, i) => i !== idx);
      return { ...f, components: comps };
    });
  const setDisc = (path, val) => {
    const next = JSON.parse(JSON.stringify(form.discountRules));
    let ref = next;
    for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
    ref[path[path.length - 1]] = val;
    setForm({ ...form, discountRules: next });
  };

  const save = (e) => {
    e.preventDefault();
    // When saving, derive productIds from components for backward compatibility
    const payload = {
      ...form,
      productIds: form.components
        ? form.components
            .map((c) => c.productId)
            .filter((pid) => pid != null && pid !== '')
        : form.productIds,
    };
    const target = editing
      ? () => updateOffering(parseInt(id, 10), payload)
      : () => addOffering(payload);
    target().then(() => nav("/catalog/offerings"));
  };

  /* add new price inline */
  const saveNewPrice = async () => {
    await addPrice(newPrice);
    const updated = await fetchPrices();
    setPrices(updated);
    const pid = Math.max(...updated.map((p) => p.priceId));
    setForm({ ...form, priceId: pid });
    setNewPrice(BLANK_PRICE);
  };

  const bundle = form.discountRules.bundleDiscount;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-lg font-medium mb-4">
        {editing ? "Edit" : "Add"} Offering
      </h1>
      <form onSubmit={save} className="space-y-6">
        {/* meta */}
        <label className="block">
          <span className="text-sm">Name *</span>
          <input
            name="name"
            className="w-full border rounded p-2 mt-1"
            value={form.name}
            onChange={onChange}
          />
        </label>

        <label className="block">
          <span className="text-sm">Status</span>
          <select
            name="status"
            className="w-full border rounded p-2 mt-1"
            value={form.status}
            onChange={onChange}
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Description</span>
          <textarea
            name="description"
            rows="3"
            className="w-full border rounded p-2 mt-1"
            value={form.description}
            onChange={onChange}
          />
        </label>

        {/* components: configurable product list with qty and billing */}
        <fieldset className="border rounded p-3 space-y-2">
          <legend className="text-sm">Components</legend>
          {form.components && form.components.length ? (
            form.components.map((comp, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center gap-2 border-b py-1"
              >
                <select
                  className="border rounded p-1"
                  value={comp.productId || ""}
                  onChange={(e) =>
                    updateComp(idx, "productId", e.target.value ? Number(e.target.value) : "")
                  }
                >
                  <option value="">— pick —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="w-20 border rounded p-1"
                  value={comp.qty}
                  onChange={(e) =>
                    updateComp(idx, "qty", parseInt(e.target.value, 10) || 1)
                  }
                />
                <select
                  className="border rounded p-1"
                  value={comp.billing}
                  onChange={(e) => updateComp(idx, "billing", e.target.value)}
                >
                  <option value="oneOff">oneOff</option>
                  <option value="monthly">monthly</option>
                  <option value="usage">usage</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeComp(idx)}
                  className="text-red-600 text-xs px-2"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No components added.</p>
          )}
          <button
            type="button"
            onClick={addComp}
            className="px-2 py-1 bg-gray-200 rounded text-xs mt-2"
          >
            + Add Component
          </button>
        </fieldset>

        {/* price attach */}
        <fieldset className="border rounded p-3 space-y-2">
          <legend className="text-sm">Attach price</legend>
          <select
            className="w-full border rounded p-2"
            value={form.priceId ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                priceId: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">— none —</option>
            {prices.map((p) => (
              <option key={p.priceId} value={p.priceId}>
                #{p.priceId} &nbsp; oneOff:{p.oneOff} monthly:{p.monthly} usage:
                {p.usage}
              </option>
            ))}
          </select>

          <details className="text-sm">
            <summary className="cursor-pointer">Add new price inline</summary>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {["oneOff", "monthly", "usage"].map((f) => (
                <label key={f} className="flex items-center gap-1">
                  {f}
                  <input
                    type="number"
                    value={newPrice[f]}
                    className="border rounded p-1 w-20"
                    onChange={(e) =>
                      setNewPrice({
                        ...newPrice,
                        [f]: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </label>
              ))}
              <label className="flex items-center gap-1">
                currency
                <input
                  value={newPrice.currency}
                  className="border rounded p-1 w-16"
                  onChange={(e) =>
                    setNewPrice({ ...newPrice, currency: e.target.value })
                  }
                />
              </label>
              <button
                type="button"
                onClick={saveNewPrice}
                className="col-span-2 px-2 py-1 bg-gray-800 text-white rounded text-xs"
              >
                Save & attach
              </button>
            </div>
          </details>
        </fieldset>

        {/* discounts */}
        <fieldset className="border rounded p-3">
          <legend className="text-sm">Discounts</legend>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <label>
              Contract 24 mo %
              <input
                type="number"
                className="w-full border rounded p-1 mt-1"
                value={form.discountRules.contractMonths["24"]}
                onChange={(e) =>
                  setDisc(
                    ["contractMonths", "24"],
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </label>
            <label>
              Loyalty % / yr
              <input
                type="number"
                className="w-full border rounded p-1 mt-1"
                value={form.discountRules.loyaltyPercentPerYear}
                onChange={(e) =>
                  setDisc(
                    ["loyaltyPercentPerYear"],
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </label>
            <label>
              Install fee %
              <input
                type="number"
                className="w-full border rounded p-1 mt-1"
                value={bundle.installationFee}
                onChange={(e) =>
                  setDisc(
                    ["bundleDiscount", "installationFee"],
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </label>
            <label>
              Monthly %
              <input
                type="number"
                className="w-full border rounded p-1 mt-1"
                value={bundle.monthly}
                onChange={(e) =>
                  setDisc(
                    ["bundleDiscount", "monthly"],
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </label>
          </div>
        </fieldset>

        {/* activation */}
        <label className="block">
          <span className="text-sm">Activation sequence</span>
          <StepsEditor
            steps={form.activationSequence}
            onChange={(seq) => setForm({ ...form, activationSequence: seq })}
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
