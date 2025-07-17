import React, { useEffect, useState } from "react";
import {
  fetchPrices,
  addPrice,
  deletePrice,
  updatePrice,
} from "../services/priceService";

const BLANK = { oneOff: 0, monthly: 0, usage: 0, currency: "USD" };

export default function PriceCatalog() {
  const [prices, setPrices] = useState([]);
  const [draft, setDraft] = useState(BLANK);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    (async () => {
      setPrices(await fetchPrices());
    })();
  }, []);

  const reload = async () => setPrices(await fetchPrices());

  const save = async () => {
    editing === null
      ? await addPrice(draft)
      : await updatePrice(editing.priceId, draft);
    setDraft(BLANK);
    setEditing(null);
    reload();
  };

  const startEdit = (p) => {
    setEditing(p);
    setDraft({ ...p });
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-lg font-medium mb-4">Price Catalog</h1>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">ID</th>
            <th>One‑off</th>
            <th>Monthly</th>
            <th>Usage</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {prices.map((p, i) => (
            <tr key={p.priceId} className="border-t">
              <td className="p-2">{p.priceId}</td>
              <td>{p.oneOff}</td>
              <td>{p.monthly}</td>
              <td>{p.usage}</td>
              <td className="text-right pr-2">
                <button
                  className="text-xs text-blue-600 mr-2"
                  onClick={() => startEdit(p)}
                >
                  Edit
                </button>
                <button
                  className="text-xs text-red-600"
                  onClick={() => deletePrice(i).then(reload)}
                >
                  Del
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
        {["oneOff", "monthly", "usage"].map((f) => (
          <label key={f} className="flex items-center gap-2">
            {f}
            <input
              type="number"
              value={draft[f]}
              onChange={(e) =>
                setDraft({ ...draft, [f]: parseFloat(e.target.value) || 0 })
              }
              className="border rounded p-1 w-24"
            />
          </label>
        ))}
        <label className="flex items-center gap-2">
          currency
          <input
            value={draft.currency}
            onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
            className="border rounded p-1 w-20"
          />
        </label>

        <button
          onClick={save}
          className="px-3 py-1 bg-black text-white rounded col-span-2"
        >
          {editing ? "Update" : "Add"}
        </button>
      </div>
    </div>
  );
}
