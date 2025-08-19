import React from "react";

/*
  SequenceSelector

  This component presents a fixed, ordered list of workflow steps with checkboxes.  It allows a user
  to enable or disable each step without changing the order or adding new steps.  The selected
  steps are returned via the `steps` prop and the `onChange` callback when the user toggles a
  checkbox.  When a step is enabled, it is included in the output array; when disabled, it is
  removed.  The order of the returned array always matches the order of the `options` prop.

  Props:
    - options (string[]): the full list of possible steps in their canonical order.
    - steps   (string[]): the currently selected steps (subset of options).
    - onChange (function): called with the updated array when a selection changes.

  Example usage:
    <SequenceSelector
      options={["Allocate hardware", "Configure devices", ...]}
      steps={form.activationSequence}
      onChange={(next) => setForm({ ...form, activationSequence: next })}
    />
*/

export default function SequenceSelector({ options, steps, onChange }) {
  // Toggle the inclusion of a step.  The returned sequence is always ordered like `options`.
  const toggle = (opt) => {
    let next;
    if (steps.includes(opt)) {
      next = steps.filter((s) => s !== opt);
    } else {
      const newSet = new Set([...steps, opt]);
      next = options.filter((o) => newSet.has(o));
    }
    onChange(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {options.map((opt, idx) => (
        <React.Fragment key={opt}>
          <button
            type="button"
            onClick={() => toggle(opt)}
            // Use pill styling: selected steps are highlighted; unselected steps are muted.
            className={`px-2 py-1 rounded-full text-xs border transition-colors duration-200 ${steps.includes(opt)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
          >
            {opt}
          </button>
          {idx < options.length - 1 && (
            <span className="text-gray-400">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}