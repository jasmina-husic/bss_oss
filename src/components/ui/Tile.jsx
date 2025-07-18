
import React from 'react';

/**
 * KPI/metric tile.
 * Props: { label: string, value: string|number, indicator: 'green'|'yellow'|'red' }
 */
export default function Tile({ label, value, indicator = 'green' }) {
  const dotClass = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-600',
  }[indicator] || 'bg-gray-400';

  return (
    <div className="border rounded p-4 flex flex-col items-center">
      <div className="text-xl font-semibold">{value}</div>
      <div className="flex items-center space-x-1 text-sm mt-1">
        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
        <span>{label}</span>
      </div>
    </div>
  );
}
