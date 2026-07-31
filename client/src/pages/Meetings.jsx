import React, { useState, useEffect } from "react";
import api from "../api/api";

function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [client, setClient] = useState("");
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);

  const getAllMeetings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/meetings");
      setMeetings(response.data.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };


  const getAllClients = async()=>{
    try{
      const response = await api.get("/api/clients");
      setClients(response.data.data);
    }catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    getAllMeetings();
    getAllClients();
  }, []);

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

      console.log(client);
      getAllMeetings();
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
    setClient(meeting.client?._id || ""); // TODO: change after populate/dropdown
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this meeting?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/meetings/${id}`);
      getAllMeetings();
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
                  <p><span className="font-semibold">Date:</span> {meeting.date}</p>
                  <p><span className="font-semibold">Time:</span> {meeting.time}</p>
                  <p><span className="font-semibold">Status:</span> {meeting.status}</p>
                  <p><span className="font-semibold">Description:</span> {meeting.description}</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleEdit(meeting)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(meeting._id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* TODO: Replace client input with dropdown after implementing client fetch */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">
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
                <input value={title} onChange={(e)=>setTitle(e.target.value)} type="text" placeholder="Meeting Title" className="w-full border rounded-lg px-4 py-3"/>
                <textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows="3" placeholder="Description" className="w-full border rounded-lg px-4 py-3"/>
                <input value={date} onChange={(e)=>setDate(e.target.value)} type="date" className="w-full border rounded-lg px-4 py-3"/>
                <input value={time} onChange={(e)=>setTime(e.target.value)} type="time" className="w-full border rounded-lg px-4 py-3"/>
                <input value={status} onChange={(e)=>setStatus(e.target.value)} type="text" placeholder="Status" className="w-full border rounded-lg px-4 py-3"/>
                <select
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full border rounded-lg px-4 py-3"
                >
                    <option value="">
                      Select Client
                    </option>
                  {
                    clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button onClick={closeModal} className="px-6 py-3 border rounded-lg hover:bg-gray-100">Cancel</button>
                <button onClick={handleSubmit} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
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