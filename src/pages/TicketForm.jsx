import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  addTicket,
  updateTicket,
  getTicketById,
} from "../services/ticketService";
import { fetchCustomersPage } from "../services/customerService";

const STATUSES = ["Open", "In Progress", "Closed"];
const PRIORITIES = ["Low", "Medium", "High"];

export default function TicketForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    (async () => {
      const res = await fetchCustomersPage(0, 999, "", []);
      setCustomers(res.records);
    })();
  }, []);

  const [form, setForm] = useState({
    customerId: "",
    title: "",
    status: "Open",
    priority: "Medium",
    owner: "",
  });

  useEffect(() => {
    if (editing) {
      const t = getTicketById(parseInt(id, 10));
      if (t) setForm(t);
    }
  }, [editing, id]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function onSubmit(e) {
    e.preventDefault();
    const { customerId, title, owner } = form;
    if (!customerId || !title.trim() || !owner.trim()) {
      alert("Customer, Title and Owner are required");
      return;
    }
    editing ? updateTicket(parseInt(id, 10), form) : addTicket(form);
    nav("/ticketing");
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-lg font-medium mb-4">
        {editing ? "Edit" : "New"} Ticket
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm">Customer *</span>
          <select
            name="customerId"
            className="mt-1 w-full border rounded p-2"
            value={form.customerId}
            onChange={onChange}
            required
          >
            <option value="">— pick customer —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Title *</span>
          <input
            name="title"
            className="mt-1 w-full border rounded p-2"
            value={form.title}
            onChange={onChange}
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label>
            <span className="text-sm">Status</span>
            <select
              name="status"
              className="mt-1 w-full border rounded p-2"
              value={form.status}
              onChange={onChange}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm">Priority</span>
            <select
              name="priority"
              className="mt-1 w-full border rounded p-2"
              value={form.priority}
              onChange={onChange}
            >
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm">Owner *</span>
          <input
            name="owner"
            className="mt-1 w-full border rounded p-2"
            value={form.owner}
            onChange={onChange}
            required
          />
        </label>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-black text-white rounded">
            Save
          </button>
          <button
            type="button"
            onClick={() => nav(-1)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
