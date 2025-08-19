import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchOrders, searchOrders } from "../services/orderService";

/**
 * Orders page redesigned as the Provisioning Queue.
 *
 * This component loads all orders and provides search and filter
 * capabilities.  It renders each order as a row showing details
 * including customer, equipment summary, value, due date, status and
 * next action.  Users can click on the order number to open the
 * detailed view.  A "New Order" button is available to start a new
 * order workflow.
 */
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    // initial load of orders
    fetchOrders().then((data) => setOrders(data));
  }, []);

  // derive distinct status values for dropdown
  const statuses = useMemo(() => {
    const all = orders.map((o) => o.status).filter(Boolean);
    return Array.from(new Set(all));
  }, [orders]);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term) {
      const results = await searchOrders(term);
      setOrders(results);
    } else {
      setOrders(await fetchOrders());
    }
  };

  // compute number of orders whose due date has passed or is today
  const ordersReadyCount = useMemo(() => {
    const today = new Date();
    return orders.reduce((count, o) => {
      if (!o.dueDate) return count;
      const due = new Date(o.dueDate);
      // order is ready if due date is in the past or today
      return due <= today ? count + 1 : count;
    }, 0);
  }, [orders]);

  // filter orders by status and due date
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const statusMatch = statusFilter ? o.status === statusFilter : true;
      const dueMatch = dueDateFilter
        ? o.dueDate && o.dueDate === dueDateFilter
        : true;
      return statusMatch && dueMatch;
    });
  }, [orders, statusFilter, dueDateFilter]);

  // helper to compute days remaining from now until due date
  const daysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // helper to summarise equipment lines into a string.  Groups license
  // bundles into a single count for brevity.
  const buildEquipmentSummary = (items = []) => {
    if (!Array.isArray(items) || items.length === 0) return "";
    const licenses = items.filter((it) => /license|support/i.test(it.name || it.item));
    const licenseCount = licenses.reduce((sum, it) => sum + (it.qty || it.need || 0), 0);
    const nonLic = items.filter((it) => !/license|support/i.test(it.name || it.item));
    const parts = nonLic.map((it) => `${it.qty || it.need}x ${it.name || it.item}`);
    if (licenseCount > 0) parts.push(`+ ${licenseCount} license bundles`);
    return parts.join("\n");
  };

  // assign action label based on order stage/status
  const getActionLabel = (o) => {
    const st = o.status || o.stage;
    switch (st) {
      case "confirmed":
      case "review":
        return "Start Setup";
      case "staging":
      case "allocation":
        return "Continue Setup";
      case "ready":
      case "validation":
        return "View Progress";
      case "deployed":
      case "deployment":
        return "Schedule Deployment";
      case "negotiation":
        return "Continue Setup";
      default:
        return "Start Setup";
    }
  };

  // map statuses to colours; fallback to gray
  const statusClasses = {
    confirmed: "bg-green-100 text-green-800",
    staging: "bg-purple-100 text-purple-800",
    ready: "bg-teal-100 text-teal-800",
    deployed: "bg-blue-100 text-blue-800",
    negotiation: "bg-yellow-100 text-yellow-800",
    review: "bg-orange-100 text-orange-800",
    validation: "bg-cyan-100 text-cyan-800",
    draft: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl font-semibold">Confirmed Orders – Provisioning Queue</h1>
        <button
          onClick={() => nav("/orders/new")}
          className="px-4 py-2 bg-black text-white rounded text-sm"
        >
          + New Order
        </button>
      </div>
      {/* Search and filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Customer Name, order number…"
            className="w-full border border-gray-300 rounded p-2 text-sm"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded p-2 text-sm"
          >
            <option value="">All Orders</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        {/* Priority filter placeholder – not implemented but kept for future */}
        <div>
          <select
            disabled
            className="border border-gray-300 rounded p-2 text-sm bg-gray-100 text-gray-500"
          >
            <option>All Priorities</option>
          </select>
        </div>
        <div>
          <input
            type="date"
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            className="border border-gray-300 rounded p-2 text-sm"
          />
        </div>
      </div>
      {/* Ready counter */}
      <div className="text-sm text-right text-green-600 font-medium">
        {ordersReadyCount} Order{ordersReadyCount !== 1 && 's'} Ready
      </div>
      {/* Orders list */}
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-10 bg-gray-100 text-xs font-semibold text-gray-700 px-4 py-2">
          <div className="col-span-2">Order Details</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Equipment Summary</div>
          <div>Value</div>
          <div>Due Date</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {filteredOrders.map((o) => {
          const equipSummary = buildEquipmentSummary(o.items);
          const days = daysRemaining(o.dueDate);
          const statusLabel = o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1) : o.stage;
          const statusClass = statusClasses[o.status] || "bg-gray-100 text-gray-800";
          return (
            <div
              key={o.id}
              className="grid grid-cols-1 md:grid-cols-10 gap-4 px-4 py-4 items-start"
            >
              {/* Order Details */}
              <div className="col-span-2">
                <Link
                  to={`/orders/${o.id}`}
                  className="text-blue-600 font-medium block"
                >
                  {o.contractNumber || `ORD-${String(o.id).padStart(4, '0')}`}
                </Link>
                <p className="text-xs text-gray-500">
                  Approved: {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </p>
              </div>
              {/* Customer */}
              <div className="col-span-2">
                <p className="font-medium">
                  {o.customerName || `Customer ${o.customerId}`}
                </p>
                <p className="text-xs text-gray-500">
                  {/* industry or contact placeholder */}
                  {o.industry || ''}
                </p>
              </div>
              {/* Equipment Summary */}
              <div className="col-span-2 whitespace-pre-wrap text-sm text-gray-700">
                {equipSummary}
              </div>
              {/* Value */}
              <div className="text-sm font-medium text-gray-700">
                {o.totalValue ? `$${o.totalValue.toLocaleString()}` : '—'}
              </div>
              {/* Due Date */}
              <div className="text-sm text-gray-700">
                {o.dueDate ? new Date(o.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                {typeof days === 'number' && (
                  <span className="block text-xs text-gray-500">
                    {days >= 0 ? `${days} day${days === 1 ? '' : 's'} remaining` : `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`}
                  </span>
                )}
              </div>
              {/* Status */}
              <div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium inline-block ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </div>
              {/* Actions */}
              <div>
                <button
                  onClick={() => {
                    // Navigate to wizard if offering 12 and stage applies
                    // Offerings 12 and 13 use the device configuration wizard
                    if (o.offeringId === 12 || o.offeringId === 13) {
                      nav(`/orders/${o.id}/setup`);
                    } else {
                      nav(`/orders/${o.id}`);
                    }
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  {getActionLabel(o)}
                </button>
              </div>
            </div>
          );
        })}
        {filteredOrders.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">No orders found.</div>
        )}
      </div>
    </div>
  );
}
