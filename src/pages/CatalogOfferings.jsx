import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import {
  fetchOfferingsPage,
  deleteOffering,
} from "../services/offeringService";

const col = createColumnHelper();

export default function CatalogOfferings() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const [tableState, setTableState] = useState({
    pagination: { pageIndex: 0, pageSize: 5 },
    sorting: [{ id: "id", desc: true }],
    globalFilter: "",
    statusFilter: "",
  });

  /* columns (now shows the ID) */
  const columns = useMemo(
    () => [
      col.display({
        id: "edit",
        header: "",
        cell: ({ row }) => (
          <Link
            to={`/catalog/offerings/${row.original.id}`}
            className="text-blue-600 text-xs"
          >
            Edit
          </Link>
        ),
      }),
      col.accessor("id", { header: "ID" }),
      col.accessor("name", { header: "Name" }),
      col.accessor("status", { header: "Status" }),
      col.accessor("description", { header: "Description" }),
    ],
    []
  );

  async function load() {
    const { pageIndex, pageSize, globalFilter, sorting, statusFilter } =
      tableState;
    const res = await fetchOfferingsPage(
      pageIndex,
      pageSize,
      globalFilter,
      sorting,
      statusFilter
    );
    setData(res.records);
    setTotal(res.total);
  }

  /* reload on any table state change */
  useEffect(() => {
    load();
  }, [tableState]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Product Offerings</h1>
        <Link
          to="/catalog/offerings/new"
          className="px-3 py-1 bg-black text-white rounded"
        >
          + New Offering
        </Link>
      </div>

      <div className="flex gap-2 mb-2">
        <select
          className="border rounded p-1"
          value={tableState.statusFilter}
          onChange={(e) =>
            setTableState({
              ...tableState,
              statusFilter: e.target.value,
              pagination: { ...tableState.pagination, pageIndex: 0 },
            })
          }
        >
          <option value="">— all —</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>

        <input
          className="border rounded p-1 flex-1"
          placeholder="Search…"
          value={tableState.globalFilter}
          onChange={(e) =>
            setTableState({ ...tableState, globalFilter: e.target.value })
          }
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        rowCount={total}
        state={tableState}
        onStateChange={setTableState}
        onDeleteRow={(idx) => deleteOffering(idx).then(load)}
      />
    </div>
  );
}
