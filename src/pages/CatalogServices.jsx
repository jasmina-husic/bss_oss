import React, { useState, useEffect, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { fetchCfsPage } from "../services/cfsService";
import DataTable from "../components/DataTable";
import { Link, useNavigate } from "react-router-dom";
const col = createColumnHelper();
export default function CatalogServices() {
  const nav = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState({
    pagination: { pageIndex: 0, pageSize: 5 },
    sorting: [],
    globalFilter: "",
  });
  const columns = useMemo(
    () => [
      col.accessor("cfsId", { header: "ID" }),
      col.accessor("name", { header: "Name" }),
      col.accessor("rfsIds", {
        header: "RFS",
        cell: (i) => i.getValue().length,
      }),
    ],
    []
  );
  const load = () => {
    const { pageIndex, pageSize } = state.pagination;
    fetchCfsPage(pageIndex, pageSize, state.globalFilter, state.sorting).then(
      (r) => {
        setData(r.records);
        setTotal(r.total);
      }
    );
  };
  useEffect(load, [state]);
  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h1>Customer‑Facing Services</h1>
        <button
          onClick={() => nav("/catalog/cfs/new")}
          className="bg-black text-white px-3"
        >
          + Add
        </button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        rowCount={total}
        state={state}
        onStateChange={setState}
      />
    </div>
  );
}
