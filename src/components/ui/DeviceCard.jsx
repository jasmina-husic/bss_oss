
import React from 'react';

export default function DeviceCard({ item }) {
  const badgeClass = {
    Online: 'bg-badgeOnline text-white',
    'High CPU': 'bg-badgeWarn text-white',
    Offline: 'bg-badgeCritical text-white',
  }[item.status] || 'bg-gray-300 text-gray-800';

  return (
    <div className="border rounded p-4 shadow-sm text-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">{item.name}</div>
          <div className="text-xs text-gray-500">{item.subtitle}</div>
        </div>
        <span className={'px-2 py-0.5 rounded text-xs ' + badgeClass}>{item.status}</span>
      </div>
      <div className="grid grid-cols-2 gap-y-1 gap-x-4 mt-2">
        {item.meta.map(m => (
          <React.Fragment key={m.label}>
            <div className="text-gray-500">{m.label}</div>
            <div>{m.value}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
