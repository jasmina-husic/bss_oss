/* src/pages/CatalogProducts.jsx */
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";

import DataTable from "../components/DataTable";
import { fetchProductsPage, deleteProduct } from "../services/productService";

const col = createColumnHelper();

export default function CatalogProducts() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const [state, setState] = useState({
    pagination: { pageIndex: 0, pageSize: 5 },
    sorting: [{ id: "id", desc: true }],
    globalFilter: "",
  });

  /* --- part of src/pages/CatalogProducts.jsx --- */
  const columns = useMemo(
    () => [
      col.display({
        id: "edit",
        header: "",
        cell: ({ row }) => (
          <Link
            to={`/catalog/products/${row.original.id}`}
            className="text-blue-600 text-xs"
          >
            Edit
          </Link>
        ),
      }),

      /* fixed: show raw numeric ID */
      col.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(), // <-- use getValue()
      }),

      col.accessor("name", { header: "Name" }),
      col.accessor("category", { header: "Cat." }),
      col.accessor("priceOneOff", { header: "One-off" }),
      col.accessor("priceMonthly", { header: "Monthly" }),
    ],
    []
  );

  /* ---------- data fetch ---------- */
  async function load() {
    const { pageIndex, pageSize } = state.pagination;
    const res = await fetchProductsPage(
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

  /* ---------- UI ---------- */
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Product Catalogue</h1>
        <Link
          to="/catalog/new"
          className="px-3 py-1 bg-black text-white rounded"
        >
          + New Product
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        rowCount={total}
        state={state}
        onStateChange={setState}
        onDeleteRow={(idx) => deleteProduct(idx).then(load)}
      />
    </div>
  );
}
