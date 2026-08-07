import  { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

function Summary() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSummary = async () => {
        try {
            const response = await api.get(`/api/meetings/${id}/summary`);
            setSummary(response.data.summary);
        } catch (err) {
            console.log(err);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-5xl items-center justify-center rounded-[28px] border border-slate-200 bg-white p-10 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)]">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"></div>
                        <h1 className="text-xl font-semibold text-slate-900">Loading Summary...</h1>
                        <p className="mt-2 text-sm text-slate-500">Preparing the AI-generated recap.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 sm:py-10">
            <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">

                <button
                    onClick={() => navigate("/meetings")}
                    className="mb-8 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    ← Back to Meetings
                </button>

                <div className="mb-8">
                    <p className="text-sm font-medium text-slate-500">AI-generated recap</p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900">AI Meeting Summary</h1>
                    <p className="mt-2 text-sm leading-7 text-slate-600">A structured, documentation-style view of the discussion.</p>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-lg">📝</span>
                            <h2 className="text-xl font-semibold text-slate-900">Summary</h2>
                        </div>

                        <p className="text-sm leading-8 text-slate-700">
                            {summary.summary}
                        </p>
                    </div>

                    <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-lg">✅</span>
                            <h2 className="text-xl font-semibold text-emerald-900">Action Items</h2>
                        </div>

                        <ul className="space-y-2 text-sm leading-7 text-emerald-800">
                            {summary.actionItems.map((item, index) => (
                                <li key={index} className="flex gap-2">
                                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-[24px] border border-violet-200 bg-violet-50 p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-lg">📌</span>
                            <h2 className="text-xl font-semibold text-violet-900">Key Decisions</h2>
                        </div>

                        <ul className="space-y-2 text-sm leading-7 text-violet-800">
                            {summary.keyDecisions.map((item, index) => (
                                <li key={index} className="flex gap-2">
                                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-lg">⚠</span>
                            <h2 className="text-xl font-semibold text-rose-900">Risks</h2>
                        </div>

                        {
                            summary.risks.length === 0 ? (
                                <p className="text-sm text-rose-700">No risks identified.</p>
                            ) : (
                                <ul className="space-y-2 text-sm leading-7 text-rose-800">
                                    {summary.risks.map((item, index) => (
                                        <li key={index} className="flex gap-2">
                                            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500"></span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )
                        }
                    </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-lg">➡</span>
                        <h2 className="text-xl font-semibold text-amber-900">Next Steps</h2>
                    </div>

                    <ul className="space-y-2 text-sm leading-7 text-amber-800">
                        {summary.nextSteps.map((item, index) => (
                            <li key={index} className="flex gap-2">
                                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500"></span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
}

export default Summary;