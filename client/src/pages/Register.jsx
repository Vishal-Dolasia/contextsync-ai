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
            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
                    <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_25px_70px_-25px_rgba(15,23,42,0.25)]">
                        <div className="border-b border-slate-200 bg-slate-900 px-8 py-8 text-white sm:px-10">
                            <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
                                Create account
                            </div>
                            <h1 className="mt-3 text-3xl font-semibold">Join ContextSync AI</h1>
                            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">
                                Start organizing your meetings, clients, and AI-generated summaries with a polished workspace.
                            </p>
                        </div>

                        <div className="p-8 sm:p-10">
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                                        onChange={(e) => setName(e.target.value)}
                                        value={name}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                                        onChange={(e) => setPassword(e.target.value)}
                                        value={password}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-slate-700 active:translate-y-[1px]"
                                >
                                    Register
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default Register;