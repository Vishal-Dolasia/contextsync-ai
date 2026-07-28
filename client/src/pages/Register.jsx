import { useState } from "react";
import api from "../api/api.js";
import {useNavigate} from 'react-router-dom';


function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/api/auth/register", {
                name,
                email,
                password,
            });
            navigate("/login");
            console.log(response);
        }catch (error) {
            if (error.response) {
                console.error("Backend Error:", error.response.data);
            } else {
                console.error("Network Error:", error.message);
            }
        }
    };

    return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        Register
                    </h1>

                    <form 
                        className="space-y-5"
                        onSubmit={handleSubmit}
                    >

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            
                        >
                            Register
                        </button>

                    </form>
                </div>
            </div>
    );
}

export default Register;