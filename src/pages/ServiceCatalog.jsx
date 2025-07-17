import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import { fetchCfsPage, deleteCfs } from "../services/cfsService";

const col = createColumnHelper();

export default function ServiceCatalog() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState({
    pagination: { pageIndex: 0, pageSize: 5 },
    sorting: [{ id: "id", desc: true }],
    globalFilter: ""
  });

  const columns = useMemo(() => [
    col.display({
      id: "edit",
      header: "",
      cell: ({ row }) => (
        <Link to={`/catalog/services/${row.original.id}`} className="text-blue-600 text-xs">
          Edit
        </Link>
      )
    }),
    col.accessor("name", { header: "Name" }),
    col.accessor("description", { header: "Description" })
  ], []);

  async function load() {
    const { pageIndex, pageSize } = state.pagination;
    const res = await fetchCfsPage(pageIndex, pageSize, state.globalFilter, state.sorting);
    setData(res.records);
    setTotal(res.total);
  }

  useEffect(() => { load(); }, [state]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Service Catalogue (CFS)</h1>
        <Link to="/catalog/services/new" className="px-3 py-1 bg-black text-white rounded">
          + New Service
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        rowCount={total}
        state={state}
        onStateChange={setState}
        onDeleteRow={idx=>deleteCfs(idx).then(load)}
      />
    </div>
  );
}
