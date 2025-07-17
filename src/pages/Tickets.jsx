import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";

import DataTable from "../components/DataTable";
import { fetchTicketsPage, deleteTicket } from "../services/ticketService";
import { fetchCustomersPage } from "../services/customerService";

const col = createColumnHelper();

export default function Tickets() {
  /* customer filter */
  const [customers, setCustomers] = useState([]);
  const [custFilter, setCustFilter] = useState("");

  /* load customers once for filter dropdown */
  useEffect(() => {
    (async () => {
      const res = await fetchCustomersPage(0, 999, "", []);
      setCustomers(res.records);
    })();
  }, []);

  /* table data */
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState({
    pagination: { pageIndex: 0, pageSize: 5 },
    sorting: [{ id: "id", desc: true }],
    globalFilter: "",
  });

  /* columns incl. Edit link */
  const columns = useMemo(
    () => [
      col.display({
        id: "edit",
        header: "",
        cell: ({ row }) => (
          <Link
            to={`/ticketing/${row.original.id}`}
            className="text-blue-600 text-xs"
          >
            Edit
          </Link>
        ),
      }),
      col.accessor("title", { header: "Title" }),
      col.accessor("status", { header: "Status" }),
      col.accessor("priority", { header: "Priority" }),
      col.accessor("owner", { header: "Owner" }),
    ],
    []
  );

  async function load() {
    const { pageIndex, pageSize } = state.pagination;
    const res = await fetchTicketsPage(
      pageIndex,
      pageSize,
      state.globalFilter,
      state.sorting,
      custFilter ? parseInt(custFilter, 10) : null
    );
    setData(res.records);
    setTotal(res.total);
  }

  useEffect(() => {
    load();
  }, [state, custFilter]);

  function handleDelete(idx) {
    deleteTicket(idx).then(load);
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <h1 className="text-lg font-medium">Tickets</h1>

        <select
          className="border rounded p-1"
          value={custFilter}
          onChange={(e) => setCustFilter(e.target.value)}
        >
          <option value="">All Customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <Link
          to="/ticketing/new"
          className="px-3 py-1 bg-black text-white rounded"
        >
          + New Ticket
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        rowCount={total}
        state={state}
        onStateChange={setState}
        onDeleteRow={handleDelete}
      />
    </div>
  );
}
