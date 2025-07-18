import React from 'react';

// Step 3 – Firewall Setup
//
// A basic form capturing configuration for a firewall.  At this
// stage there is no persistence; values are purely illustrative.

export default function Step3Firewall() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Firewall Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Serial Number</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="FG-123456789" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Management IP</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="192.168.1.254" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Hostname</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="Firewall HQ" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">HA Mode</label>
            <select className="w-full border p-2 rounded">
              <option>Active-Passive</option>
              <option>Active-Active</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">VLAN Management</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="VLAN-Management-01" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">LAN Interface</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="port1" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">WAN Interface</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="port2" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">VPN Community</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="HQ-LAN" />
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