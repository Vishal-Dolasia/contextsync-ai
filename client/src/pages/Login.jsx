import { useState } from "react";
import useAuth from "../hooks/useAuth.js";
import api from "../api/api.js";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("");
    const {setToken} = useAuth();
    const navigate = useNavigate();

    const testProtectedRoute = async () => {
        try {
            const response = await api.get("/api/auth/me");
            console.log(response.data);
        } catch (err) {
            console.log(err.response?.data);
        }
    };


    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            const response = await api.post(
                "/api/auth/login",
                {
                    email,
                    password
                }
            );
            console.log(response.data); // to be removed
            localStorage.setItem("token",response.data.token);
            setToken(response.data.token);
            navigate("/dashboard");

        }catch (err) {
            if (err.response) {
                console.log(err.response.data);
            } else {
                console.log(err.message);
            }
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">
                    Login
                </h1>

                <form 
                    className="space-y-4"
                    onSubmit={handleSubmit}
                >
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e)=>{
                                setEmail(e.target.value);
                            }}
                            value={email}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Password
                        </label>
                        <input
                            onChange={(e)=>{
                                setPassword(e.target.value);
                            }}
                            value={password}
                            type="password"
                            placeholder="Enter your password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <a
                        href="/register"
                        className="text-blue-600 hover:underline"
                    >
                        Register
                    </a>
                </p>


                <button
                    type="button"
                    onClick={testProtectedRoute}
                >
                    Test Protected Route
                </button>
            </div>
        </div>
    );
}

export default Login;