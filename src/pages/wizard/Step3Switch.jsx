import React from 'react';

// Step 3 – Switch Setup
//
// A simplified form for configuring switches.  The fields here mirror
// the example design but do not persist any data.

export default function Step3Switch() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Switch Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Switch Name</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="Switch 1" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">FortiGate Association</label>
            <select className="w-full border p-2 rounded">
              <option>FG-100F-01</option>
              <option>FG-100F-02</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Port Range</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="1-24" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Native VLAN</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="VLAN 10" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Description</label>
            <textarea className="w-full border p-2 rounded" rows="4" placeholder="Describe switch configuration"></textarea>
          </div>
        </div>
      </div>
      <div className="mt-4 text-right">
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Preview Config</button>
        <button className="ml-2 px-4 py-2 bg-green-600 text-white rounded">Apply Template</button>
      </div>
    </div>
  );
}