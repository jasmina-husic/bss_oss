import React from 'react';

// Step 3 – Access Points Setup
//
// Simplified form for adding and configuring wireless access points.

export default function Step3AccessPoints() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Access Point Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Serial Number</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="AP-123456789" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Managed FortiGate</label>
            <select className="w-full border p-2 rounded">
              <option>FG-100F-01</option>
              <option>FG-100F-02</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Access Point Name</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="AP-Lobby" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">AP Group Name</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="Office WiFi" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Available APs</label>
            <div className="border p-2 rounded h-28 overflow-y-auto">
              {/* In a full implementation this would list available AP models for selection */}
              <p>FAP 001</p>
              <p>FAP 002</p>
              <p>FAP 003</p>
              <p>FAP 004</p>
            </div>
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