import React from "react";

export default function StepsEditor({ steps, onChange }) {
  const update = (newSteps) => onChange(newSteps);
  const move = (idx, dir) => {
    const ns = [...steps];
    const swap = idx + dir;
    if (swap < 0 || swap >= ns.length) return;
    [ns[idx], ns[swap]] = [ns[swap], ns[idx]];
    update(ns);
  };
  const remove = (idx) => {
    const ns = [...steps];
    ns.splice(idx, 1);
    update(ns);
  };
  const add = () => update([...steps, ""]);
  const edit = (idx, val) => {
    const ns = [...steps];
    ns[idx] = val;
    update(ns);
  };

  return (
    <div className="space-y-1">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <input
            value={s}
            onChange={(e) => edit(i, e.target.value)}
            className="flex-1 border rounded p-1 text-xs"
          />
          <button
            type="button"
            onClick={() => move(i, -1)}
            className="px-1 border"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => move(i, 1)}
            className="px-1 border"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => remove(i)}
            className="px-1 border text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-blue-600">
        + Add step
      </button>
    </div>
  );
}
