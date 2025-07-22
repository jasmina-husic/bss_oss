import React, { useEffect, useState } from 'react';
import orderWizardService from '../../services/orderWizardService';
import inventoryService from '../../services/inventoryService';

// Step 2 – Inventory Allocation
//
// Displays required vs allocated equipment and supports allocating
// individual devices.  Stock levels are loaded from the inventory
// service and allocation state is persisted in the wizard data.  A
// notes section at the bottom allows free‑form comments.
export default function Step2() {
  const [requiredEquipment, setRequiredEquipment] = useState([]);
  const [allocatedEquipment, setAllocatedEquipment] = useState([]);
  const [allocationNotes, setAllocationNotes] = useState([]);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      await inventoryService.loadInventory();
      setInventoryLoaded(true);
      const data = await orderWizardService.getWizardData();
      if (data) {
        setRequiredEquipment(data.requiredEquipment.map((i) => ({ ...i })));
        setAllocatedEquipment(
          (data.allocatedEquipment || []).map((i) => ({ ...i }))
        );
        setAllocationNotes([...data.allocationNotes]);
      }
    }
    init();
  }, []);

  const refreshStock = async () => {
    // Clear cached inventory so it reloads fresh
    localStorage.removeItem('inventory');
    await inventoryService.loadInventory();
    setInventoryLoaded(false);
    setTimeout(() => setInventoryLoaded(true), 0);
  };

  const allocateAll = () => {
    requiredEquipment.forEach((item) => {
      orderWizardService.allocateEquipmentItem(item.name);
    });
    const updated = orderWizardService.getCurrentOrder();
    setRequiredEquipment(updated.requiredEquipment.map((i) => ({ ...i })));
    setAllocatedEquipment(
      (updated.allocatedEquipment || []).map((i) => ({ ...i }))
    );
  };

  const handleAllocate = (item) => {
    const ok = orderWizardService.allocateEquipmentItem(item.name);
    const updated = orderWizardService.getCurrentOrder();
    setRequiredEquipment(updated.requiredEquipment.map((i) => ({ ...i })));
    setAllocatedEquipment(
      (updated.allocatedEquipment || []).map((i) => ({ ...i }))
    );
    if (!ok) {
      alert(`Insufficient stock for ${item.name}.`);
    }
  };

  const handleNotesChange = (e) => {
    const lines = e.target.value.split('\n');
    setAllocationNotes(lines);
    orderWizardService.updateAllocationNotes(lines);
  };

  if (!inventoryLoaded || requiredEquipment.length === 0) {
    return <div>Loading...</div>;
  }

  const remaining = requiredEquipment
    .filter((i) => i.status !== 'Allocated')
    .reduce((sum, i) => sum + i.need, 0);

  const statusColor = (status) => {
    switch (status) {
      case 'Allocated':
      case 'Available':
        return 'text-green-600';
      case 'Low Stock':
        return 'text-yellow-600';
      case 'Not Available':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      {/* Action buttons */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={refreshStock}
          className="px-4 py-2 bg-gray-200 rounded shadow text-sm"
        >
          Refresh Stock
        </button>
        <button
          onClick={() => console.log('Print labels')}
          className="px-4 py-2 bg-gray-200 rounded shadow text-sm"
        >
          Print Labels
        </button>
        <button
          onClick={allocateAll}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow text-sm hover:bg-blue-700"
        >
          Allocate All
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Required equipment */}
        <div className="bg-gray-50 border border-gray-200 shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Required Equipment</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Item</th>
                <th className="p-2 text-center">Need</th>
                <th className="p-2 text-center">Stock</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {requiredEquipment.map((item) => (
                <tr key={item.name} className="border-b last:border-b-0">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2 text-center">{item.need}</td>
                  <td className="p-2 text-center">{item.stock}</td>
                  <td
                    className={`p-2 text-center ${statusColor(item.status)}`}
                  >
                    {item.status}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      disabled={item.status === 'Allocated'}
                      onClick={() => handleAllocate(item)}
                      className={`px-3 py-1 rounded text-sm ${
                        item.status === 'Allocated'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      Allocate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {remaining > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              {remaining} devices still need to be assigned.
            </p>
          )}
        </div>
        {/* Allocated equipment */}
        <div className="bg-gray-50 border border-gray-200 shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Allocated Equipment</h3>
          {allocatedEquipment.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {allocatedEquipment.map((item) => (
                <li
                  key={item.name}
                  className="flex justify-between items-center border-b last:border-b-0 py-1"
                >
                  <span>{item.name}</span>
                  <span className="text-green-600">Allocated</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No items allocated yet.
            </p>
          )}
        </div>
      </div>
      {/* Allocation notes */}
      <div className="bg-gray-50 border border-gray-200 shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Allocation Notes</h3>
        <textarea
          className="w-full h-24 border border-gray-300 rounded p-2 text-sm"
          value={allocationNotes.join('\n')}
          onChange={handleNotesChange}
        />
      </div>
    </div>
  );
}