import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import Papa from "papaparse";

import DataTable from "../components/DataTable";
import {
  fetchCustomersPage,
  deleteCustomer,
  addCustomer,
  updateCustomer,
  getCustomerById,
} from "../services/customerService";

/* fields the form requires (id handled separately) */
const REQUIRED = [
  "name",
  "email",
  "company",
  "phone",
  "accountManager",
  "state",
];

const col = createColumnHelper();

export default function CRM() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [tableState, setTableState] = useState({
    pagination: { pageIndex: 0, pageSize: 5 },
    sorting: [{ id: "id", desc: true }],
    globalFilter: "",
  });

  const fileRef = useRef(null);

  /* ───────── columns ───────── */
  const columns = useMemo(
    () => [
      col.display({
        id: "edit",
        header: "",
        cell: ({ row }) => (
          <Link
            to={"/crm/customers/" + row.original.id}
            className="text-blue-600 hover:underline"
          >
            Edit
          </Link>
        ),
      }),
      col.display({
        id: "details",
        header: "",
        cell: ({ row }) => (
          <Link
            to={"/crm/" + row.original.id}
            className="text-green-600 hover:underline"
          >
            Details
          </Link>
        ),
      }),
      col.accessor("id", { header: "ID" }),
      col.accessor("name", { header: "Name" }),
      col.accessor("email", { header: "Email" }),
      col.accessor("company", { header: "Company" }),
      col.accessor("phone", { header: "Phone" }),
      col.accessor("industry", { header: "Industry" }),
      col.accessor("accountManager", { header: "Manager" }),
      col.accessor("state", { header: "State" }),
    ],
    []
  );

  /* ───────── data fetch ───────── */
  async function load() {
    const { pageIndex, pageSize } = tableState.pagination;
    const res = await fetchCustomersPage(
      pageIndex,
      pageSize,
      tableState.globalFilter,
      tableState.sorting
    );
    setData(res.records);
    setTotal(res.total);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableState]);

  function handleDelete(idx) {
    // deleteCustomer() returns a Promise, so chain load() when it resolves
    deleteCustomer(idx).then(load);
  }

  /* ───────── CSV import ───────── */
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data, errors }) => {
        if (errors.length) {
          alert("CSV parse error – check delimiter & header row");
          return;
        }
        const bad = [];
        const ok = [];
        const seenIds = new Set();

        data.forEach((row, idx) => {
          const rowNum = idx + 2; // 1-based incl. header

          /* id validation (optional) */
          if (row.id) {
            if (!/^[0-9]+$/.test(row.id)) {
              bad.push(`row ${rowNum}: id must be numeric`);
              return;
            }
            if (seenIds.has(row.id)) {
              bad.push(`row ${rowNum}: duplicate id ${row.id} in file`);
              return;
            }
            seenIds.add(row.id);
          }

          /* required business fields */
          const missing = REQUIRED.filter((f) => !(row[f] || "").trim());
          if (missing.length) {
            bad.push(`row ${rowNum}: missing ${missing.join(", ")}`);
          } else {
            ok.push(row);
          }
        });

        if (bad.length) {
          alert("Import halted:\n" + bad.join("\n"));
          return;
        }

        /* apply changes */
        for (const rec of ok) {
          if (rec.id) {
            const existing = getCustomerById(Number(rec.id));
            if (existing) {
              await updateCustomer(existing.id, rec);
              continue;
            }
          }
          await addCustomer(rec); // new record => nextId assigned
        }

        await load();
        alert(`Imported ${ok.length} row(s) (${bad.length} skipped).`);
      },
    });

    e.target.value = ""; // reset input so same file can be chosen again
  };

  /* ───────── UI ───────── */
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Accounts</h1>

      {/* Toolbar */}
      <div className="flex items-center space-x-2 mb-2">
        <button
          onClick={() => fileRef.current && fileRef.current.click()}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
        >
          Import CSV
        </button>
        <Link
          to="/crm/customers/new"
          className="px-3 py-1 border rounded text-sm bg-blue-600 text-white hover:bg-blue-700"
        >
          + New Account
        </Link>
        <input
          type="file"
          accept=".csv,text/csv"
          ref={fileRef}
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        rowCount={total}
        state={tableState}
        onStateChange={setTableState}
        onDeleteRow={handleDelete}
      />
    </div>
  );
}
