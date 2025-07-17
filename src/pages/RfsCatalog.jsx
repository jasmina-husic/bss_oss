import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import { fetchRfsPage, deleteRfs } from "../services/rfsService";

const col = createColumnHelper();

export default function RfsCatalog() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState({
    pagination: { pageIndex: 0, pageSize: 5 },
    sorting: [{ id: "id", desc: true }],
    globalFilter: "",
  });

  const columns = useMemo(
    () => [
      col.display({
        id: "edit",
        header: "",
        cell: ({ row }) => (
          <Link
            to={`/catalog/rfs/${row.original.id}`}
            className="text-blue-600 text-xs"
          >
            Edit
          </Link>
        ),
      }),
      col.accessor("name", { header: "Name" }),
      col.accessor("resourceType", { header: "Type" }),
      col.accessor("provider", { header: "Provider" }),
      col.accessor("unit", { header: "Unit" }),
    ],
    []
  );

  async function load() {
    const { pageIndex, pageSize } = state.pagination;
    const res = await fetchRfsPage(
      pageIndex,
      pageSize,
      state.globalFilter,
      state.sorting
    );
    setData(res.records);
    setTotal(res.total);
  }

  useEffect(() => {
    load();
  }, [state]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Resource Catalogue (RFS)</h1>
        <Link
          to="/catalog/rfs/new"
          className="px-3 py-1 bg-black text-white rounded"
        >
          + New Resource
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        rowCount={total}
        state={state}
        onStateChange={setState}
        onDeleteRow={(idx) => deleteRfs(idx).then(load)}
      />
    </div>
  );
}
