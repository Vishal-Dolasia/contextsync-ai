import React, { use, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { data, useNavigate } from "react-router-dom";


function Dashboard() {
    const { setToken } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    Dashboard
                </h1>

                <button
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </nav>

            <main className="max-w-5xl mx-auto p-8">
                <div className="bg-white rounded-xl shadow-md p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Welcome!
                    </h2>

                    <p className="text-gray-600 mb-8">
                        You are successfully logged in.
                    </p>

                    <div className="flex gap-4">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                            onClick={()=>navigate("/clients")}
                        >
                            View Clients
                        </button>

                        <button
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
                            
                        >
                            Add Client
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;