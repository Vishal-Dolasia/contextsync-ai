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
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
                <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_25px_70px_-25px_rgba(15,23,42,0.25)] lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="flex flex-col justify-between bg-slate-900 p-8 text-white sm:p-10 lg:p-12">
                        <div>
                            <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
                                ContextSync AI
                            </div>
                            <h1 className="text-3xl font-semibold sm:text-4xl">
                                Turn every meeting into a polished follow-up.
                            </h1>
                            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
                                Capture conversations, review transcripts, and share summaries in one calm workspace.
                            </p>
                        </div>
                        <div className="mt-10 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
                            <p className="font-medium text-white">✨ Focused workflow</p>
                            <p className="mt-2 leading-6 text-slate-300">A cleaner experience for clients, meetings, and AI-generated insights.</p>
                        </div>
                    </div>

                    <div className="p-8 sm:p-10 lg:p-12">
                        <div className="mb-8">
                            <p className="text-sm font-medium text-slate-500">Welcome back</p>
                            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Log in to your workspace</h2>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                                    onChange={(e)=>{
                                        setEmail(e.target.value);
                                    }}
                                    value={email}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <input
                                    onChange={(e)=>{
                                        setPassword(e.target.value);
                                    }}
                                    value={password}
                                    type="password"
                                    placeholder="Enter your password"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-slate-700 active:translate-y-[1px]"
                            >
                                Login
                            </button>
                        </form>

                        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <span>Need a new account?</span>
                            <a href="/register" className="font-semibold text-slate-900 transition hover:text-slate-700">
                                Register
                            </a>
                        </div>

                        <button
                            type="button"
                            onClick={testProtectedRoute}
                            className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        >
                            Test Protected Route
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;