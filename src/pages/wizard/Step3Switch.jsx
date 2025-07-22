import React from 'react';

// Step 3 – Device setup and configuration for switches
//
// Provides forms for managing FortiSwitch devices.  Sections are
// wrapped in cards with consistent spacing.  Inputs are static
// placeholders for demonstration.
export default function Step3Switch() {
  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex justify-end space-x-2">
        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded">Templates</button>
        <button className="px-3 py-1 bg-blue-200 text-blue-800 rounded">Save Progress</button>
        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Auto‑Configure</button>
      </div>
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Device Setup &amp; Configuration – Switches</h2>
        {/* Switch manager section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">FortiSwitch Manager</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-medium mb-1">Managed FortiSwitches</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="Select"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">FortiSwitch Templates</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="Select template"
              />
            </div>
          </div>
        </div>
        {/* Switch group creation */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Create FortiSwitch Group</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input className="w-full border border-gray-300 rounded p-1" placeholder="Company" />
            </div>
            <div>
              <label className="block font-medium mb-1">FortiGate</label>
              <input className="w-full border border-gray-300 rounded p-1" placeholder="Select" />
            </div>
            <div>
              <label className="block font-medium mb-1">Switch FortiLink</label>
              <input className="w-full border border-gray-300 rounded p-1" placeholder="fortilink" />
            </div>
            <div>
              <label className="block font-medium mb-1">FortiSwitches</label>
              <input className="w-full border border-gray-300 rounded p-1" placeholder="Select" />
            </div>
          </div>
        </div>
        {/* Switch creation */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Create FortiSwitch</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-medium mb-1">FortiGate</label>
              <input className="w-full border border-gray-300 rounded p-1" placeholder="Select" />
            </div>
            <div>
              <label className="block font-medium mb-1">Device Interface</label>
              <input className="w-full border border-gray-300 rounded p-1" placeholder="fortilink" />
            </div>
            <div>
              <label className="block font-medium mb-1">Serial Number</label>
              <input className="w-full border border-gray-300 rounded p-1" placeholder="FS-12345" />
            </div>
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input className="w-full border border-gray-300 rounded p-1" placeholder="Switch name" />
            </div>
          </div>
        </div>
        {/* Port configuration */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Port 1–22 Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-medium mb-1">Native VLAN</label>
              <input className="w-full border border-gray-300 rounded p-1" placeholder="Select" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}