import React from "react";

/*
  Custom StepsEditor component

  The original StepsEditor rendered each step in an activation sequence as a free‑text input field.  When
  defining an offering’s activation workflow, however, the steps are not arbitrary strings; they come
  from a fixed set defined by the product catalog.  To make it easier to assemble a workflow and avoid
  typos or mismatched names, this implementation replaces the plain input with a drop‑down select.

  The options list is derived from the union of all activation steps found in the catalog’s workflows:
  - "Allocate hardware"
  - "Configure devices"
  - "Install on site"
  - "Ship & install"
  - "Commission network"
  - "Activate license"
  - "Register support"
  - "Go live"

  An empty option is provided at the top of the list to allow the user to leave a step unspecified
  initially.  When the user clicks “+ Add step” a new step is appended using the first valid option
  ("Allocate hardware"), but they can change it via the select afterwards.  Up/down arrows and the
  delete button work as before to reorder or remove steps.
*/

// Hard‑coded list of possible activation steps.  These steps correspond to the largest workflow
// (offering 12) and its variants; other workflows are formed as subsets of this list.
const ALL_STEPS = [
  "Allocate hardware",
  "Configure devices",
  "Install on site",
  "Ship & install",
  "Commission network",
  "Activate license",
  "Register support",
  "Go live",
];

export default function StepsEditor({ steps, onChange, options }) {
  // Notify parent with updated sequence
  const update = (newSteps) => onChange(newSteps);
  // Move a step up or down by swapping indices
  const move = (idx, dir) => {
    const ns = [...steps];
    const swap = idx + dir;
    if (swap < 0 || swap >= ns.length) return;
    [ns[idx], ns[swap]] = [ns[swap], ns[idx]];
    update(ns);
  };
  // Remove a step entirely
  const remove = (idx) => {
    const ns = [...steps];
    ns.splice(idx, 1);
    update(ns);
  };
  // Append a new step.  If options are provided, use the first option as default; otherwise use an empty string.
  const add = () => {
    const next = options && options.length ? options[0] : "";
    update([...steps, next]);
  };
  // Replace the value of an existing step
  const edit = (idx, val) => {
    const ns = [...steps];
    ns[idx] = val;
    update(ns);
  };

  return (
    <div className="space-y-1">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          {options && options.length ? (
            // If options are provided, render a select drop‑down for each step.  An empty option allows clearing the step.
            <select
              value={s}
              onChange={(e) => edit(i, e.target.value)}
              className="flex-1 border rounded p-1 text-xs"
            >
              <option value="">— pick —</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            // When no options are supplied, fall back to a free‑text input as in the original component.
            <input
              value={s}
              onChange={(e) => edit(i, e.target.value)}
              className="flex-1 border rounded p-1 text-xs"
            />
          )}
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