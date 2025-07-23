import React, { useEffect, useState } from 'react';
import inventoryService from '../services/inventoryService.js';

/*
 * Inventory management page
 *
 * Provides a simple CRUD interface over the inventory list stored in
 * localStorage.  Administrators can view all items, add new stock
 * records, edit existing entries and remove obsolete items.  The
 * design is intentionally lightweight and mirrors the style of the
 * CRM and catalog pages in the application.
 */
export default function Inventory() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ sku: '', name: '', stock: '' });
  const [editingSku, setEditingSku] = useState(null);
  const [editItem, setEditItem] = useState({ sku: '', name: '', stock: '' });

  // Load inventory on mount
  useEffect(() => {
    async function init() {
      await inventoryService.loadInventory();
      const data = inventoryService.getInventory() || [];
      setItems([...data]);
    }
    init();
  }, []);

  // Refresh state from localStorage
  const refresh = () => {
    const data = inventoryService.getInventory() || [];
    setItems([...data]);
  };

  // Handlers for adding a new item
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.sku || !newItem.name) return;
    const stock = parseInt(newItem.stock, 10) || 0;
    inventoryService.addInventoryItem({
      sku: newItem.sku.trim(),
      name: newItem.name.trim(),
      stock,
    });
    setNewItem({ sku: '', name: '', stock: '' });
    refresh();
  };

  // Handler to delete an item
  const handleDelete = (sku) => {
    if (!window.confirm('Delete this inventory item?')) return;
    inventoryService.deleteInventoryItem(sku);
    refresh();
  };

  // Begin editing a row
  const handleEditClick = (sku) => {
    setEditingSku(sku);
    const itm = items.find((i) => i.sku === sku);
    setEditItem({ ...itm });
  };

  // Save changes to a row
  const handleSave = (e) => {
    e.preventDefault();
    const stock = parseInt(editItem.stock, 10) || 0;
    inventoryService.updateInventoryItem(editingSku, {
      sku: editItem.sku.trim(),
      name: editItem.name.trim(),
      stock,
    });
    setEditingSku(null);
    refresh();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Inventory</h1>

      {/* Form to add a new inventory item */}
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-end bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col">
          <label className="text-xs font-medium">SKU</label>
          <input
            className="border border-gray-300 rounded p-1 text-sm"
            value={newItem.sku}
            onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
            placeholder="SKU"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-medium">Name</label>
          <input
            className="border border-gray-300 rounded p-1 text-sm"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Item name"
          />
        </div>
        <div className="flex flex-col w-20">
          <label className="text-xs font-medium">Stock</label>
          <input
            type="number"
            className="border border-gray-300 rounded p-1 text-sm"
            value={newItem.stock}
            onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
            placeholder="0"
            min="0"
          />
        </div>
        <button className="bg-black text-white px-3 py-1 rounded text-sm" type="submit">
          + Add
        </button>
      </form>

      {/* Inventory table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              editingSku === it.sku ? (
                <tr key={it.sku} className={idx % 2 ? 'bg-gray-50' : ''}>
                  <td className="px-3 py-1">
                    <input
                      className="border border-gray-300 rounded p-1 w-full"
                      value={editItem.sku}
                      onChange={(e) => setEditItem({ ...editItem, sku: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-1">
                    <input
                      className="border border-gray-300 rounded p-1 w-full"
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-1">
                    <input
                      type="number"
                      className="border border-gray-300 rounded p-1 w-full"
                      value={editItem.stock}
                      onChange={(e) => setEditItem({ ...editItem, stock: e.target.value })}
                      min="0"
                    />
                  </td>
                  <td className="px-3 py-1 flex gap-2">
                    <button
                      onClick={handleSave}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSku(null)}
                      className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={it.sku} className={idx % 2 ? 'bg-gray-50' : ''}>
                  <td className="px-3 py-1">{it.sku}</td>
                  <td className="px-3 py-1">{it.name}</td>
                  <td className="px-3 py-1">{it.stock}</td>
                  <td className="px-3 py-1 flex gap-2">
                    <button
                      onClick={() => handleEditClick(it.sku)}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(it.sku)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                  No inventory records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}