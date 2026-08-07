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
  const [search,setSearch] = useState("");
  const [debouncedSearch,setDebouncedSearch] = useState(search);
  const [sort, setSort] = useState("");
  
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

      fetchClients();

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

  const fetchClients = async () => {
    try {
      const response = await api.get(`/api/clients?search=${debouncedSearch}&sort=${sort}`);
      setClients(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };
  const loadClients = async () => {
    setLoading(true);
    try{
      await fetchClients();
    }catch(err){
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
      fetchClients();
    } catch (err) {
      console.log(err);
    }
  };
  
  useEffect(() => {
    fetchClients();
  }, [debouncedSearch,sort]);
  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(()=>{
      setDebouncedSearch(search);
    },500);

    return ()=>{
      clearTimeout(timer);
    }
  }, [search]);
  

  if (loading) {
      return (
          <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
              <div className="mx-auto flex max-w-6xl items-center justify-center rounded-[28px] border border-slate-200 bg-white p-10 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)]">
                  <div className="flex flex-col items-center text-center">
                      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"></div>
                      <h1 className="text-xl font-semibold text-slate-900">
                          Loading Clients...
                      </h1>
                      <p className="mt-2 text-sm text-slate-500">Preparing your client workspace.</p>
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
            <p className="text-sm font-medium text-slate-500">Client directory</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">Clients</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">Keep contact details, notes, and follow-up context beautifully organized.</p>
          </div>

          <button
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-slate-700 active:translate-y-[1px]"
            onClick={() => setIsOpen(true)}
          >
            + Add Client
          </button>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search clients by name, email or company..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              />
          </div>

            <div className="w-full sm:max-w-[220px]">
          <select
            value = {sort} 
            onChange={(e)=>setSort(e.target.value)} 
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Sort By</option>
            <option value="az">Name (A-Z)</option>
            <option value="za">Name (Z-A)</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.length === 0 ? (
            <div className="col-span-full rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-slate-800">
                No Clients Found
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-500">
                Click “Add Client” to create your first client profile.
              </p>
            </div>
          ) : (
            clients.map((client) => (
              <div
                key={client._id}
                className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {client.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{client.company || "Independent contact"}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
                    Client
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">Email:</span> {client.email}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Phone:</span> {client.phone}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Company:</span>{" "}
                    {client.company}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Notes:</span> {client.notes}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleEdit(client)}
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(client._id)}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Delete
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
                  {editingId ? "Edit Client" : "Add New Client"}
                </h2>

                <button
                  onClick={closeModal}
                  className="rounded-full p-2 text-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4 px-6 py-6 sm:px-8">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Enter client's name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Enter email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="text"
                    placeholder="Enter phone number"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Company</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    type="text"
                    placeholder="Company"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                    placeholder="Additional notes..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                  />
                </div>
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
