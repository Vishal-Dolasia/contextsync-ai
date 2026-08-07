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
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">Loading Meetings...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Meetings</h1>

          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + Add Meeting
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search meetings..."
              className="w-full md:w-96 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </div>

          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full md:w-60 px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">Sort By</option>
              <option value="az">Title (A-Z)</option>
              <option value="za">Title (Z-A)</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <h2 className="text-2xl font-semibold text-gray-500">
                No Meetings Found
              </h2>
              <p className="text-gray-400 mt-2">
                Click "Add Meeting" to create your first meeting.
              </p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {meeting.title}
                </h2>

                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-semibold">Client:</span>{" "}
                    {meeting.client ? meeting.client.name : "No Client"}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span> {meeting.date}
                  </p>
                  <p>
                    <span className="font-semibold">Time:</span> {meeting.time}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span> {meeting.status}
                  </p>
                  <p>
                    <span className="font-semibold">Description:</span>{" "}
                    {meeting.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">

                  <button
                      onClick={() => navigate(`/meeting/${meeting._id}`)}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                  >
                      Join Meeting
                  </button>

                  <button
                      onClick={() => navigate(`/meetings/${meeting._id}/transcript`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                  >
                      View Transcript
                  </button>

                  <button
                      onClick={() => handleEdit(meeting)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition"
                  >
                      Edit
                  </button>

                  <button
                      onClick={() => handleDelete(meeting._id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
                  >
                      Delete
                  </button>
                  <button
                    onClick={() => navigate(`/meetings/${meeting._id}/summary`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition"
                >
                    View Summary
                </button>

              </div>
                </div>
            ))
          )}
        </div>

        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                  {editingId ? "Edit Meeting" : "Add New Meeting"}
                </h2>

                <button
                  onClick={closeModal}
                  className="text-3xl text-gray-500 hover:text-red-500"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-5">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  placeholder="Meeting Title"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Description"
                  className="w-full border rounded-lg px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  type="time"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  type="text"
                  placeholder="Status"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
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