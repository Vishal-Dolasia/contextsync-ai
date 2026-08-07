import React from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";


function Dashboard() {
    const { setToken } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="border-b border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Workspace</p>
                        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
                    </div>

                    <button
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)]">
                    <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white sm:p-10">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-300">Welcome</p>
                                <h2 className="mt-2 text-3xl font-semibold">You are successfully logged in.</h2>
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                                    Keep track of clients, meetings, and AI-generated notes from one simple operating layer.
                                </p>
                            </div>
                            <div className="inline-flex rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">
                                ✨ All systems ready
                            </div>
                        </div>
                    </div>

                    <div className="p-8 sm:p-10">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm font-medium text-slate-500">Clients</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-900">Manage</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm font-medium text-slate-500">Meetings</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-900">Review</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm font-medium text-slate-500">Summary</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-900">Share</p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button
                                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-slate-700 active:translate-y-[1px]"
                                onClick={()=>navigate("/clients")}
                            >
                                View Clients
                            </button>

                            <button
                                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-slate-300 hover:bg-slate-50"
                                onClick={()=>navigate("/meetings")}
                            >
                                Open Meetings
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;