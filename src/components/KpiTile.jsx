import React from "react";

export default function KpiTile({ value, label, color = "green" }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-4 text-center border-r last:border-r-0">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      <span
        className={"mt-1 block h-2 w-2 rounded-full " + (color === "green" ? "bg-green-500" : color === "red" ? "bg-red-500" : "bg-yellow-500")}
      ></span>
    </div>
  );
}