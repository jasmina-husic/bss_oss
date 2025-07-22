import React, { useEffect, useState } from "react";
import { fetchCustomersPage } from "../services/customerService";
import { fetchTicketsPage } from "../services/ticketService";
import { fetchSpecsPage } from "../services/productService";
import { fetchOrders } from "../services/orderService";
import { fetchOfferingsPage } from "../services/offeringService";

/* helpers -------------------------------------------------- */
async function getCustomerKpi() {
  const res = await fetchCustomersPage(0, 9999, "", []);
  const counts = { prospect: 0, validated: 0, active: 0, inactive: 0 };
  res.records.forEach((c) => (counts[c.state] = (counts[c.state] || 0) + 1));
  return { total: res.total, counts };
}

async function getOrderKpi() {
  const orders = await fetchOrders();
  const counts = {
    prospect: 0,
    negotiation: 0,
    contract: 0,
    activation: 0,
    delivery: 0,
    closed: 0,
  };
  orders.forEach((o) => (counts[o.stage] = (counts[o.stage] || 0) + 1));
  // sort by created desc for recent list
  const recent = [...orders]
    .filter((o) => o != null)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);
  return { total: orders.length, counts, recent };
}

async function getFinancials() {
  const [orders, { records: offers }] = await Promise.all([
    fetchOrders(),
    fetchOfferingsPage(0, 9999, "", [], ""),
  ]);

  /* monthly recurring revenue = sum of monthlyFee for every delivered/closed order */
  let mrr = 0;
  const offerMap = Object.fromEntries(offers.map((o) => [o.id, o]));
  orders.forEach((o) => {
    if (["delivery", "closed"].includes(o.stage)) {
      const fee = offerMap[o.offeringId]?.pricePlan?.monthlyFee || 0;
      mrr += fee;
    }
  });

  /* top customers by number of orders */
  const custCnt = {};
  orders.forEach((o) => {
    if (["delivery", "closed"].includes(o.stage))
      custCnt[o.customerId] = (custCnt[o.customerId] || 0) + 1;
  });
  const topCust = Object.entries(custCnt)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return { mrr, topCust };
}

/* ========================================================= */

export default function Dashboard() {
  const [data, setData] = useState({
    customers: { total: 0, counts: {} },
    tickets: 0,
    products: 0,
    orders: { total: 0, counts: {}, recent: [] },
    mrr: 0,
    topCust: [],
  });

  useEffect(() => {
    (async () => {
      const [cust, tick, prod, ord, fin] = await Promise.all([
        getCustomerKpi(),
        (async () => (await fetchTicketsPage(0, 1, "", [], null)).total)(),
        (async () => (await fetchSpecsPage(0, 1, "", [], "")).total)(),
        getOrderKpi(),
        getFinancials(),
      ]);
      setData({
        customers: cust,
        tickets: tick,
        products: prod,
        orders: ord,
        mrr: fin.mrr,
        topCust: fin.topCust,
      });
    })();
  }, []);

  const { customers, tickets, products, orders, mrr, topCust } = data;
  const custBar = Object.entries(customers.counts);
  const orderBar = Object.entries(orders.counts);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* KPI tiles row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Tile
          label="Customers"
          value={customers.total}
          gradient="from-emerald-400 to-emerald-600"
        />
        <Tile
          label="Product Specs"
          value={products}
          gradient="from-sky-400 to-sky-600"
        />
        <Tile
          label="Tickets"
          value={tickets}
          gradient="from-rose-400 to-rose-600"
        />
        <Tile
          label="Orders"
          value={orders.total}
          gradient="from-indigo-400 to-indigo-600"
        />
        <Tile
          label="Monthly MRR"
          value={`$${mrr}`}
          gradient="from-amber-400 to-amber-600"
        />
      </div>

      {/* charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <BarCard
          title="Customers per State"
          data={custBar}
          barColor="bg-emerald-600"
        />
        <BarCard
          title="Orders per Stage"
          data={orderBar}
          barColor="bg-indigo-600"
        />
      </div>

      {/* recent orders & top customers */}
      <div className="grid md:grid-cols-2 gap-6">
        <RecentOrdersTable rows={orders.recent || []} />
        <TopCustomersTable rows={topCust} />
      </div>
    </div>
  );
}

/* --- tiny components ------------------------------------------------ */

function Tile({ label, value, gradient }) {
  return (
    <div
      className={`rounded-xl p-4 text-white bg-gradient-to-br ${gradient} shadow-md`}
    >
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-3xl font-semibold truncate">{value}</p>
    </div>
  );
}

function BarCard({ title, data, barColor }) {
  const values = data.map(([, n]) => n);
  const max = Math.max(...values, 1);
  return (
    <div className="border rounded-xl p-4 bg-white shadow">
      <p className="text-sm text-gray-700 mb-2 font-medium">{title}</p>
      <div className="flex items-end gap-4 h-36">
        {data.map(([key, n]) => (
          <div key={key} className="flex-1 text-center">
            <div
              className={`${barColor} rounded-t mx-auto`}
              style={{
                height: `${Math.max(12, (n / max) * 100)}px`,
                minHeight: n ? "4px" : 0,
                width: "56px",
              }}
            />
            <p className="text-[11px] mt-1 capitalize">{key}</p>
            <p className="text-[11px] text-gray-600">{n}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentOrdersTable({ rows }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow overflow-x-auto">
      <p className="text-sm font-medium mb-2">Recent Orders</p>
      <table className="min-w-full text-xs">
        <thead>
          <tr className="text-gray-500">
            <th className="py-1 px-2 text-left">ID</th>
            <th className="py-1 px-2 text-left">Stage</th>
            <th className="py-1 px-2 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(rows) && rows.length > 0 ? (
            rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-1 px-2">
                  <a
                    href={`/orders/${r.id}`}
                    className="text-blue-600"
                    target="_blank"
                    rel="noreferrer"
                  >
                    #{r.id}
                  </a>
                </td>
                <td className="py-1 px-2 capitalize">{r.stage}</td>
                <td className="py-1 px-2">
                  {/* Guard against undefined createdAt */}
                  {r.createdAt ? r.createdAt.slice(0, 10) : "—"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="py-4 text-center text-gray-500">
                —
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TopCustomersTable({ rows }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow overflow-x-auto">
      <p className="text-sm font-medium mb-2">Top Customers (by active orders)</p>
      <table className="min-w-full text-xs">
        <thead>
          <tr className="text-gray-500">
            <th className="py-1 px-2 text-left">Customer ID</th>
            <th className="py-1 px-2 text-left">Orders</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(rows) && rows.length > 0 ? (
            rows.map(([custId, cnt]) => (
              <tr key={custId} className="border-t">
                <td className="py-1 px-2">{custId}</td>
                <td className="py-1 px-2">{cnt}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="py-4 text-center text-gray-500">
                —
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}