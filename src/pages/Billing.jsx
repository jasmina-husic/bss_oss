import React, { useEffect, useState } from "react";
import { fetchOrders } from "../services/orderService";
import { fetchCustomersPage } from "../services/customerService";
import { fetchOfferingsPage } from "../services/offeringService";
import { fetchProductsPage } from "../services/productService";
import { fetchPrices, getPriceById } from "../services/priceService";

/* ---------- helpers ---------- */
const yyyymm = (d) => d.toISOString().slice(0, 7);
const firstDay = (ym) => new Date(`${ym}-01T00:00:00`);
const lastDay = (ym) => {
  const d = new Date(`${ym}-01T00:00:00`);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};

export default function Billing() {
  const [month, setMonth] = useState(yyyymm(new Date()));
  const [rows, setRows] = useState([]);
  const [tot, setTot] = useState(0);

  useEffect(() => {
    (async () => {
      /* pull everything in parallel */
      const [
        orders,
        { records: customers },
        { records: offers },
        { records: products },
        prices,
      ] = await Promise.all([
        fetchOrders(),
        fetchCustomersPage(0, 9999, "", []),
        fetchOfferingsPage(0, 9999, "", [], ""),
        fetchProductsPage(0, 9999, "", []),
        fetchPrices(), // warms cache for getPriceById
      ]);

      /* quick maps for look-ups */
      const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
      const priceMap = Object.fromEntries(prices.map((p) => [p.priceId, p]));

      const fm = firstDay(month);
      const lm = lastDay(month);
      const lines = [];

      orders.forEach((o) => {
        /* only delivered/closed subscriptions in force this month */
        if (!["delivery", "closed"].includes(o.stage)) return;
        if (
          (o.contractStart && new Date(o.contractStart) > lm) ||
          (o.contractEnd && new Date(o.contractEnd) < fm)
        )
          return;

        const off = offers.find((v) => v.id === o.offeringId);
        const cust = customers.find((c) => c.id === o.customerId);
        if (!off || !cust) return;

        let unit = 0;
        let currency = "USD";

        /* offering-level plan */
        if (off.pricePlan) {
          unit += off.pricePlan.monthlyFee ?? 0;
          currency = off.pricePlan.currency || currency;
        }
        /* offering-level priceId */
        if (off.priceId && priceMap[off.priceId]) {
          unit += priceMap[off.priceId].monthly ?? 0;
          currency = priceMap[off.priceId].currency || currency;
        }

        /* per-component fees */
        off.components?.forEach((c) => {
          const prod = productMap[c.productId];
          if (!prod || !prod.priceId) return;
          const p = priceMap[prod.priceId];
          if (!p) return;

          if (c.billing === "monthly") {
            unit += (p.monthly ?? 0) * (c.qty ?? 1);
            currency = p.currency || currency;
          } else if (
            c.billing === "oneOff" &&
            /* one-off billed only in the month of delivery/close */
            new Date(o.lastModified).getFullYear() === fm.getFullYear() &&
            new Date(o.lastModified).getMonth() === fm.getMonth()
          ) {
            unit += (p.oneOff ?? 0) * (c.qty ?? 1);
            currency = p.currency || currency;
          }
          /* usage left to CDR processing */
        });

        lines.push({
          orderId: o.id,
          contract: o.contractNumber,
          customer: cust.name,
          offering: off.name,
          qty: 1,
          unit,
          amount: unit,
          currency,
        });
      });

      setRows(lines);
      setTot(lines.reduce((s, l) => s + l.amount, 0));
    })();
  }, [month]);

  /* CSV export helper */
  const exportCsv = () => {
    const hdr = "Order,Contract,Customer,Offering,Qty,Unit,Amount,Currency";
    const csv =
      hdr +
      "\n" +
      rows
        .map(
          (r) =>
            `${r.orderId},${r.contract},"${r.customer}","${r.offering}",${r.qty},${r.unit},${r.amount},${r.currency}`
        )
        .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    Object.assign(document.createElement("a"), {
      href: url,
      download: `billing_${month}.csv`,
    }).click();
    URL.revokeObjectURL(url);
  };

  /* -------------- UI -------------- */
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-medium">Billing Preview</h1>

      <label className="text-sm">
        Month{" "}
        <input
          type="month"
          className="border rounded p-1"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </label>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Order",
                "Contract",
                "Customer",
                "Offering",
                "Qty",
                "Unit",
                "Amount",
                "Cur",
              ].map((h) => (
                <th key={h} className="px-2 py-1">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-500">
                  No billable orders for {month}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.orderId} className="border-t">
                <td className="px-2 py-1 text-center">
                  <a
                    href={`/orders/${r.orderId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600"
                  >
                    #{r.orderId}
                  </a>
                </td>
                <td className="px-2 py-1 text-center">{r.contract}</td>
                <td className="px-2 py-1">{r.customer}</td>
                <td className="px-2 py-1">{r.offering}</td>
                <td className="px-2 py-1 text-center">{r.qty}</td>
                <td className="px-2 py-1 text-right">{r.unit.toFixed(2)}</td>
                <td className="px-2 py-1 text-right">{r.amount.toFixed(2)}</td>
                <td className="px-2 py-1 text-center">{r.currency}</td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t font-medium">
                <td colSpan={6} className="text-right px-2 py-2">
                  Total
                </td>
                <td className="text-right px-2 py-2">{tot.toFixed(2)}</td>
                <td className="px-2 py-2">USD</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {rows.length > 0 && (
        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-black text-white rounded text-sm"
        >
          Export CSV
        </button>
      )}
    </div>
  );
}
