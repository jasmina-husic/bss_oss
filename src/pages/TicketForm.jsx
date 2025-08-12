import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  addTicket,
  updateTicket,
  getTicketById,
} from "../services/ticketService";
import { fetchCustomersPage } from "../services/customerService";

// Zendesk compatible status and priority enumerations
const STATUSES = ["NEW", "OPEN", "PENDING", "HOLD", "SOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];

/**
 * Form for creating or editing a support ticket.  The form has been
 * extended to capture additional fields introduced in the upgraded API,
 * including subject, description, submitter and assignee.  It also uses
 * the new status and priority enumerations.
 */
export default function TicketForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  // Customer list for the drop‑down
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    (async () => {
      const res = await fetchCustomersPage(0, 999, "", []);
      setCustomers(res.records);
    })();
  }, []);

  // Initialise the form state with sensible defaults.  Assignee is
  // required because the upgraded API uses this field instead of owner.
  const [form, setForm] = useState({
    customerId: "",
    subject: "",
    description: "",
    status: "NEW",
    priority: "NORMAL",
    submitter: "",
    assignee: "",
  });

  // When editing an existing ticket, load its values into the form.  Note
  // that we copy both subject/title and assignee/owner to support legacy
  // data.  If a field is missing we fall back to an empty string.
  useEffect(() => {
    if (editing) {
      const t = getTicketById(parseInt(id, 10));
      if (t) {
        setForm({
          customerId: t.customerId ?? t.requesterId ?? "",
          subject: t.subject ?? t.title ?? "",
          description: t.description ?? "",
          status: t.status ?? "NEW",
          priority: t.priority ?? "NORMAL",
          submitter: t.submitter ?? "",
          assignee: t.assignee ?? t.owner ?? "",
        });
      }
    }
  }, [editing, id]);

  // Generic change handler for all form controls
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submission.  Performs basic validation and then creates or
  // updates the ticket.  We construct a record containing both subject
  // and title, and mirror assignee into owner for backwards compatibility.
  function onSubmit(e) {
    e.preventDefault();
    const { customerId, subject, assignee } = form;
    if (!customerId || !subject.trim() || !assignee.trim()) {
      alert("Customer, Subject and Assignee are required");
      return;
    }
    const rec = {
      ...form,
      customerId: parseInt(form.customerId, 10),
      requesterId: parseInt(form.customerId, 10),
      title: form.subject,
      owner: form.assignee,
    };
    editing ? updateTicket(parseInt(id, 10), rec) : addTicket(rec);
    nav("/ticketing");
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-lg font-medium mb-4">
        {editing ? "Edit" : "New"} Ticket
      </h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Customer select */}
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

        {/* Subject */}
        <label className="block">
          <span className="text-sm">Subject *</span>
          <input
            name="subject"
            className="mt-1 w-full border rounded p-2"
            value={form.subject}
            onChange={onChange}
            required
          />
        </label>

        {/* Description */}
        <label className="block">
          <span className="text-sm">Description</span>
          <textarea
            name="description"
            className="mt-1 w-full border rounded p-2"
            value={form.description}
            onChange={onChange}
            rows={4}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
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

          {/* Priority */}
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

        {/* Submitter */}
        <label className="block">
          <span className="text-sm">Submitter</span>
          <input
            name="submitter"
            className="mt-1 w-full border rounded p-2"
            value={form.submitter}
            onChange={onChange}
          />
        </label>

        {/* Assignee */}
        <label className="block">
          <span className="text-sm">Assignee *</span>
          <input
            name="assignee"
            className="mt-1 w-full border rounded p-2"
            value={form.assignee}
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