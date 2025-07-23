import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

/* helper: always finite integer ≥ 0 */
const asCount = (v) => (Number.isFinite(v) && v >= 0 ? v : 0);

export default function DataTable({
  columns,
  data,
  rowCount,
  state,
  onStateChange,
  onDeleteRow,
  hideSearch = false,
}) {
  /* ── make state safe for tanstack ───────────────── */
  const safeState = {
    ...state,
    sorting: Array.isArray(state.sorting) ? state.sorting : [],
    pagination: {
      pageIndex: state.pagination?.pageIndex ?? 0,
      pageSize: state.pagination?.pageSize ?? 5,
    },
  };

  /* ── paging numbers ─────────────────────────────── */
  const pageSize = safeState.pagination.pageSize || 1;
  const pageIndex = safeState.pagination.pageIndex;
  const totalRows = asCount(rowCount);
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

  const goto = (idx) =>
    onStateChange({
      ...safeState,
      pagination: { ...safeState.pagination, pageIndex: idx },
    });

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  /* ── react-table instance ───────────────────────── */
  const table = useReactTable({
    data,
    columns,
    state: safeState,
    manualSorting: true,
    manualPagination: true,
    onSortingChange: (s) => onStateChange({ ...safeState, sorting: s }),
    getCoreRowModel: getCoreRowModel(),
  });

  /* ── UI ─────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* search */}
      {!hideSearch && (
        <input
          className="border rounded p-1 w-full focus:outline-none focus:ring"
          placeholder="Search…"
          value={safeState.globalFilter ?? ""}
          onChange={(e) =>
            onStateChange({ ...safeState, globalFilter: e.target.value })
          }
        />
      )}

      {/* table */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-2 py-1 text-left select-none cursor-pointer"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc"
                      ? " ▲"
                      : h.column.getIsSorted() === "desc"
                      ? " ▼"
                      : ""}
                  </th>
                ))}
                {onDeleteRow && <th className="w-16" />}
              </tr>
            ))}
          </thead>
          <tbody>
            {data.length ? (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={
                    i % 2
                      ? "bg-white hover:bg-indigo-50"
                      : "bg-gray-50 hover:bg-indigo-50"
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-2 py-1 border-t">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                  {onDeleteRow && (
                    <td
                      className="px-2 py-1 border-t text-red-600 text-xs cursor-pointer"
                      onClick={() => onDeleteRow(row.original.id)}
                    >
                      Delete
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (onDeleteRow ? 1 : 0)}
                  className="text-center px-2 py-6 text-gray-500"
                >
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* footer */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => goto(0)} disabled={!canPrev}>
          {"<<"}
        </button>
        <button onClick={() => goto(pageIndex - 1)} disabled={!canPrev}>
          Prev
        </button>
        <span>
          Page&nbsp;<strong>{totalRows ? pageIndex + 1 : 0}</strong>
          &nbsp;of&nbsp;{pageCount}
        </span>
        <button onClick={() => goto(pageIndex + 1)} disabled={!canNext}>
          Next
        </button>
        <button onClick={() => goto(pageCount - 1)} disabled={!canNext}>
          {">>"}
        </button>
      </div>
    </div>
  );
}
