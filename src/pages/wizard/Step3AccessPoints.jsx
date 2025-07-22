import React from 'react';

// Step 3 – Device setup and configuration for access points
//
// Provides forms for managing FortiAPs and their groups.  All
// sections are wrapped in cards and use simple grid layouts.
export default function Step3AccessPoints() {
  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex justify-end space-x-2">
        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded">Templates</button>
        <button className="px-3 py-1 bg-blue-200 text-blue-800 rounded">Save Progress</button>
        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Auto‑Configure</button>
      </div>
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">
          Device Setup &amp; Configuration – Access Points
        </h2>
        {/* Access point manager */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Access Point Manager</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-medium mb-1">Managed FortiAPs</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="Select"
              />
            </div>
          </div>
        </div>
        {/* Managed AP configuration */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Managed AP</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-medium mb-1">FortiGate</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="Select"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Serial Number</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="FAP-12345"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                className="w-full border border-gray-300 rounded p-1"
                placeholder="AP Name"
              />
            </div>
          </div>
        </div>
        {/* Managed AP group */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Managed AP Group</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input className="w-full border border-gray-300 rounded p-1" placeholder="Group Name" />
            </div>
            <div>
              <label className="block font-medium mb-1">FortiGate</label>
              <input className="w-full border border-gray-300 rounded p-1" placeholder="Select" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">FortiAP</label>
              <div className="flex flex-wrap gap-4">
                {['FAP 001','FAP 002','FAP 003','FAP 004','FAP 005','FAP 006'].map((ap) => (
                  <label key={ap} className="inline-flex items-center space-x-2">
                    <input type="checkbox" className="border-gray-300" />
                    <span>{ap}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}