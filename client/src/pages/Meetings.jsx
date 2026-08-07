import  { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [client, setClient] = useState("");
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sort, setSort] = useState("");
  const navigate = useNavigate();

  const fetchMeetings = async () => {
    try {
      const response = await api.get(
        `/api/meetings?search=${debouncedSearch}&sort=${sort}`
      );
      setMeetings(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadMeetings = async () => {
    setLoading(true);
    try {
      await fetchMeetings();
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const getAllClients = async () => {
    try {
      const response = await api.get("/api/clients");
      setClients(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [debouncedSearch, sort]);

  useEffect(() => {
    loadMeetings();
    getAllClients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      if (editingId === null) {
        await api.post("/api/meetings", {
          title,
          description,
          date,
          time,
          status,
          client,
        });
      } else {
        await api.patch(`/api/meetings/${editingId}`, {
          title,
          description,
          date,
          time,
          status,
          client,
        });
      }

      fetchMeetings();
      closeModal();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (meeting) => {
    setEditingId(meeting._id);
    setTitle(meeting.title);
    setDescription(meeting.description);
    setDate(meeting.date);
    setTime(meeting.time);
    setStatus(meeting.status);
    setClient(meeting.client?._id || "");
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this meeting?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/meetings/${id}`);
      fetchMeetings();
    } catch (err) {
      console.log(err);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setStatus("Scheduled");
    setClient("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-center rounded-[28px] border border-slate-200 bg-white p-10 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"></div>
            <h1 className="text-xl font-semibold text-slate-900">Loading Meetings...</h1>
            <p className="mt-2 text-sm text-slate-500">Gathering your upcoming sessions.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Session planner</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">Meetings</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">Plan your conversations and keep everything easy to review later.</p>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-slate-700 active:translate-y-[1px]"
          >
            + Add Meeting
          </button>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search meetings..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </div>

          <div className="w-full sm:max-w-[220px]">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Sort By</option>
              <option value="az">Title (A-Z)</option>
              <option value="za">Title (Z-A)</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {meetings.length === 0 ? (
            <div className="col-span-full rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-slate-800">No Meetings Found</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">Click “Add Meeting” to create your first session.</p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{meeting.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{meeting.client ? meeting.client.name : "No Client"}</p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
                    {meeting.status || "Scheduled"}
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">Date:</span> {meeting.date}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Time:</span> {meeting.time}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Status:</span> {meeting.status}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Description:</span>{" "}
                    {meeting.description}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                      onClick={() => navigate(`/meeting/${meeting._id}`)}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                      Join
                  </button>

                  <button
                      onClick={() => navigate(`/meetings/${meeting._id}/transcript`)}
                      className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                  >
                      Transcript
                  </button>

                  <button
                      onClick={() => handleEdit(meeting)}
                      className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                  >
                      Edit
                  </button>

                  <button
                      onClick={() => handleDelete(meeting._id)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                      Delete
                  </button>
                  <button
                    onClick={() => navigate(`/meetings/${meeting._id}/summary`)}
                    className="col-span-2 rounded-2xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                >
                    View Summary
                </button>

              </div>
                </div>
            ))
          )}
        </div>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
            <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-8">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {editingId ? "Edit Meeting" : "Add New Meeting"}
                </h2>

                <button
                  onClick={closeModal}
                  className="rounded-full p-2 text-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4 px-6 py-6 sm:px-8">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  placeholder="Meeting Title"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Description"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                />
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                />
                <input
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  type="time"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                />
                <input
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  type="text"
                  placeholder="Status"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                />
                <select
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                <button
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  {editingId ? "Update Meeting" : "Save Meeting"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Meetings;