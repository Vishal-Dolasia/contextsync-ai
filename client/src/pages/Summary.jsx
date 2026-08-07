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
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-semibold">
                    Loading Summary...
                </h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">

                <button
                    onClick={() => navigate("/meetings")}
                    className="mb-6 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                    ← Back to Meetings
                </button>

                <h1 className="text-4xl font-bold mb-8">
                    AI Meeting Summary
                </h1>

                {/* Summary */}

                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                        📝 Summary
                    </h2>

                    <p className="text-gray-700 leading-8">
                        {summary.summary}
                    </p>
                </div>

                {/* Action Items */}

                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-green-600 mb-3">
                        ✅ Action Items
                    </h2>

                    <ul className="list-disc pl-6 space-y-2">
                        {summary.actionItems.map((item, index) => (
                            <li key={index}>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Key Decisions */}

                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-purple-600 mb-3">
                        📌 Key Decisions
                    </h2>

                    <ul className="list-disc pl-6 space-y-2">
                        {summary.keyDecisions.map((item, index) => (
                            <li key={index}>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Risks */}

                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-red-600 mb-3">
                        ⚠ Risks
                    </h2>

                    {
                        summary.risks.length === 0 ? (
                            <p className="text-gray-500">
                                No risks identified.
                            </p>
                        ) : (
                            <ul className="list-disc pl-6 space-y-2">
                                {summary.risks.map((item, index) => (
                                    <li key={index}>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )
                    }
                </div>

                {/* Next Steps */}

                <div>
                    <h2 className="text-2xl font-semibold text-orange-600 mb-3">
                        ➡ Next Steps
                    </h2>

                    <ul className="list-disc pl-6 space-y-2">
                        {summary.nextSteps.map((item, index) => (
                            <li key={index}>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
}

export default Summary;