import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";

import DataTable from "../components/DataTable";
import {
  fetchSpecsPage,
  deleteSpec,
  getDropdownOptions,
} from "../services/productService";

const col = createColumnHelper();

export default function Catalog() {
  const [opts, setOpts] = useState({ category: [] });
  useEffect(() => {
    getDropdownOptions().then(setOpts);
  }, []);

  const [catFilter, setCatFilter] = useState("");
  const [data, setData] = useState([]),
    [total, setTotal] = useState(0);
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
            to={`/catalog/${row.original.id}`}
            className="text-blue-600 text-xs"
          >
            Edit
          </Link>
        ),
      }),
      col.accessor("name", { header: "Name" }),
      col.accessor("version", { header: "Ver" }),
      col.accessor("lifecycleStatus", { header: "Status" }),
      col.accessor("brand", { header: "Brand" }),
      col.accessor("category", { header: "Category" }),
    ],
    []
  );

  async function load() {
    const { pageIndex, pageSize } = state.pagination;
    const res = await fetchSpecsPage(
      pageIndex,
      pageSize,
      state.globalFilter,
      state.sorting,
      catFilter
    );
    setData(res.records);
    setTotal(res.total);
  }
  useEffect(() => {
    load();
  }, [state, catFilter]);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h1 className="text-lg font-medium">Product Specifications</h1>

        <select
          className="border rounded p-1"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {opts.category.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <Link
          to="/catalog/new"
          className="px-3 py-1 bg-black text-white rounded"
        >
          + New Spec
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        rowCount={total}
        state={state}
        onStateChange={setState}
        onDeleteRow={(idx) => deleteSpec(idx).then(load)}
      />
    </div>
  );
}
