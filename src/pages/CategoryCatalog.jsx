import React, { useEffect, useState } from "react";
import {
  fetchCategories,
  addCategory,
  deleteCategory,
} from "../services/categoryService";

export default function CategoryCatalog() {
  const [cats, setCats] = useState([]);
  const [input, setInput] = useState("");

  /* initial load */
  useEffect(() => {
    (async () => {
      const data = await fetchCategories();
      setCats(data);
    })();
  }, []);

  const refresh = async () => {
    setCats(await fetchCategories());
  };

  const handleAdd = async () => {
    const v = input.trim();
    if (!v) return;
    await addCategory(v);
    setInput("");
    refresh();
  };

  const handleDelete = async (idx) => {
    await deleteCategory(idx);
    refresh();
  };

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-lg font-medium mb-4">Product Categories</h1>

      <div className="space-y-1 mb-4">
        {cats.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex-1">{c}</span>
            <button
              onClick={() => handleDelete(i)}
              className="text-xs text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New category"
          className="border rounded p-2 flex-1"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}
