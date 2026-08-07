import  { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function Transcript() {
    const { id } = useParams();
    const [transcript, setTranscript] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTranscript = async () => {
        try {
            const response = await api.get(`/api/meetings/${id}/transcript`);

            setTranscript(response.data.transcript.transcript);
        } catch (err) {
            console.log(err);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchTranscript();
    }, []);


    if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-4xl items-center justify-center rounded-[28px] border border-slate-200 bg-white p-10 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)]">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"></div>
                    <h1 className="text-xl font-semibold text-slate-900">Loading Transcript...</h1>
                    <p className="mt-2 text-sm text-slate-500">Pulling the latest conversation details.</p>
                </div>
            </div>
        </div>
    );
}   
    return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-10">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">

            <button
                onClick={() => navigate("/meetings")}
                className="mb-8 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
                ← Back to Meetings
            </button>

            <div className="mb-8">
                <p className="text-sm font-medium text-slate-500">Meeting notes</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Meeting Transcript</h1>
                <p className="mt-2 text-sm leading-7 text-slate-600">A cleaner, chat-like view of each spoken message and timestamp.</p>
            </div>

            {transcript.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="text-sm text-slate-500">No transcript available.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {transcript.map((item) => (
                        <div
                            key={item._id}
                            className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-semibold text-slate-900">
                                    {item.speaker}
                                </h2>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                                    Speaker
                                </span>
                            </div>

                            <p className="mt-3 text-[15px] leading-8 text-slate-700">
                                {item.text}
                            </p>

                            <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                                {new Date(item.timestamp).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            )}

        </div>
    </div>
);
}

export default Transcript;