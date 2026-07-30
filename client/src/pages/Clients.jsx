// NOTE: This file contains your existing Clients page plus a UI-only Add Client modal.
// Replace the placeholder comments with your own logic later.

import React from "react";
import { useState, useEffect } from "react";
import api from "../api/api";

function Clients() {
  const [clients, setClients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    try {
      if (editingId === null) {
        await api.post("/api/clients", {
          name,
          email,
          phone,
          company,
          notes,
        });
      } else {
        await api.patch(`/api/clients/${editingId}`, {
          name,
          email,
          phone,
          company,
          notes,
        });
      }

      getAllClients();

      setIsOpen(false);

      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setNotes("");
      setEditingId(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (client) => {
    setEditingId(client._id);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone);
    setCompany(client.company);
    setNotes(client.notes);
    setIsOpen(true);
  };

  const getAllClients = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/clients");
      setClients(response.data.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const closeModal = () => {
    setIsOpen(false);

    setEditingId(null);

    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setNotes("");
  };  

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this client?",
    );
    
    if (!confirmDelete) return;
    try {
      await api.delete(`/api/clients/${id}`);
      getAllClients();
    } catch (err) {
      console.log(err);
    }
  };
  
  
  useEffect(() => {
    getAllClients();
  }, []);

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl font-semibold">
                  Loading Clients...
              </h1>
          </div>
      );
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Clients</h1>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            onClick={() => setIsOpen(true)}
          >
            + Add Client
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <h2 className="text-2xl font-semibold text-gray-500">
                No Clients Found
              </h2>

              <p className="text-gray-400 mt-2">
                Click "Add Client" to create your first client.
              </p>
            </div>
          ) : (
            clients.map((client) => (
              <div
                key={client._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {client.name}
                </h2>

                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-semibold">Email:</span> {client.email}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span> {client.phone}
                  </p>
                  <p>
                    <span className="font-semibold">Company:</span>{" "}
                    {client.company}
                  </p>
                  <p>
                    <span className="font-semibold">Notes:</span> {client.notes}
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleEdit(client)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(client._id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ADD CLIENT MODAL (UI ONLY) */}
        {/* Later replace 'hidden' with conditional rendering */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 ">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                  {editingId ? "Edit Client" : "Add New Client"}
                </h2>

                <button
                  onClick={closeModal}
                  className="text-3xl text-gray-500 hover:text-red-500"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block mb-2 font-semibold">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Enter client's name"
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Enter email"
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="text"
                    placeholder="Enter phone number"
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Company</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    type="text"
                    placeholder="Company"
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                    placeholder="Additional notes..."
                    className="w-full border rounded-lg px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  {editingId ? "Update Client" : "Save Client"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Clients;
