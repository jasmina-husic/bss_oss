
import React, { useState } from 'react';

export default function SectionTabs({ tabs, initial, children }) {
  const [active, setActive] = useState(initial || tabs[0]);

  return (
    <div>
      <div className="flex space-x-4 border-b mb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            className={
              'px-3 py-2 text-sm font-medium -mb-px border-b-2 transition ' +
              (active === tab
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-600 hover:text-blue-600')
            }
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}
