import React from "react";
import useAuth from "../hooks/useAuth";
import {useNavigate} from "react-router-dom";

function Dashboard() {
    const {setToken} = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login")
    }



    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    Dashboard
                </h1>

                <button
                    className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </nav>

            <main className="p-8">
                <div className="bg-white rounded-xl shadow-md p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome!
                    </h2>

                    <p className="text-gray-600">
                        You are successfully logged in.
                    </p>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;