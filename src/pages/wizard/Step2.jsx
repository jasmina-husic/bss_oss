import React, { useEffect, useState } from 'react';
import orderWizardService from '../../services/orderWizardService';
import inventoryService from '../../services/inventoryService';

// Step 2 – Inventory Allocation
//
// Displays required equipment with available stock counts and
// allows the user to allocate items.  Allocation writes into the
// wizard data and reduces inventory counts via the service.  A
// separate notes field captures additional remarks.

export default function Step2() {
  const [requiredEquipment, setRequiredEquipment] = useState(null);
  const [allocatedEquipment, setAllocatedEquipment] = useState(null);
  const [allocationNotes, setAllocationNotes] = useState(null);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);

  // On mount, load inventory and the wizard data.  Copy arrays so
  // editing does not mutate the original objects returned by the
  // service.
  useEffect(() => {
    let mounted = true;
    async function init() {
      await inventoryService.loadInventory();
      setInventoryLoaded(true);
      const data = await orderWizardService.getWizardData();
      if (mounted && data) {
        setRequiredEquipment(data.requiredEquipment.map((i) => ({ ...i })));
        setAllocatedEquipment(
          (data.allocatedEquipment || []).map((i) => ({ ...i }))
        );
        setAllocationNotes([...data.allocationNotes]);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Allocate an item.  Call the service and refresh local state from
  // the updated wizard data.  If allocation fails show an alert.
  const handleAllocate = (item) => {
    const ok = orderWizardService.allocateEquipmentItem(item.name);
    const updated = orderWizardService.getCurrentOrder();
    setRequiredEquipment(updated.requiredEquipment.map((i) => ({ ...i })));
    setAllocatedEquipment(
      (updated.allocatedEquipment || []).map((i) => ({ ...i }))
    );
    if (!ok) {
      alert(`Insufficient stock for ${item.name}. Not available.`);
    }
  };

  // Update notes on change.  Convert textarea lines into array.
  const handleNotesChange = (e) => {
    const lines = e.target.value.split('\n');
    setAllocationNotes(lines);
    orderWizardService.updateAllocationNotes(lines);
  };

  if (!requiredEquipment || !allocatedEquipment || !allocationNotes || !inventoryLoaded) {
    return <div>Loading...</div>;
  }

  const allAllocated = requiredEquipment.every((i) => i.status === 'Allocated');

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Required Equipment</h3>
          <div className="space-y-3 text-sm">
            {requiredEquipment.map((item) => (
              <div key={item.name} className="flex items-center justify-between border p-3 rounded">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    Need: {item.need} Stock: {inventoryService.getAvailableStock(item.name)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.status === 'Allocated'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'Low Stock'
                        ? 'bg-yellow-100 text-yellow-800'
                        : item.status === 'Not Available'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.status}
                  </span>
                  {item.status !== 'Allocated' && (
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      onClick={() => handleAllocate(item)}
                    >
                      Allocate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Allocated Equipment</h3>
          <div className="space-y-3 text-sm">
            {allocatedEquipment.length === 0 && <p className="text-gray-500">No equipment allocated yet.</p>}
            {allocatedEquipment.map((item, idx) => (
              <div
                key={idx}
                className={`border p-3 rounded ${item.status === 'Allocated' ? 'bg-green-50' : 'bg-yellow-50'}`}
              >
                <p className="font-semibold text-green-800">{item.name}</p>
                <p className="text-xs">{item.status || item.note}</p>
              </div>
            ))}
            {!allAllocated && (
              <div className="border p-3 rounded bg-yellow-50">
                <p className="font-semibold text-yellow-800">Remaining items pending allocation</p>
                <p className="text-xs">
                  {requiredEquipment.filter((i) => i.status !== 'Allocated').reduce((sum, i) => sum + i.need, 0)} devices still need to be assigned
                  from inventory
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 text-sm text-gray-600">
        <p className="font-semibold mb-1">Allocation Notes:</p>
        <textarea
          className="w-full border p-2 rounded h-24"
          value={allocationNotes.join('\n')}
          onChange={handleNotesChange}
        />
      </div>
    </div>
  );
}