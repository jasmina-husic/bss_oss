import React from 'react';

// Step 3 – Firewall configuration
//
// This step provides basic form fields for configuring firewall
// parameters.  The layout uses cards and a responsive grid to
// organise inputs.  In a real application these fields would
// populate the wizard data and validate input; here they are
// illustrative only.
export default function Step3Firewall() {
  return (
    <div className="space-y-6">
      {/* Action bar for templates, saving and auto config */}
      <div className="flex justify-end space-x-2">
        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
          Templates
        </button>
        <button className="px-3 py-1 bg-blue-200 text-blue-800 rounded">
          Save Progress
        </button>
        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          Auto‑Configure
        </button>
      </div>
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">
          Device Setup & Configuration – Firewalls
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">
            FortiGate 100F – Headquarters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="block font-medium mb-1">Serial Number</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="FG-12345"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">License</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="Subscription"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Model</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="100F"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">HA Mode</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="Active/Passive"
              />
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">FortiGate Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="block font-medium mb-1">WAN IP</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="192.168.1.1"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">LAN IP</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="10.0.0.1"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">DHCP Range</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="10.0.0.10-100"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Policy</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="Allow all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}