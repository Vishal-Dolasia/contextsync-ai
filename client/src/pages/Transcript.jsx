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
        <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-semibold">
                Loading Transcript...
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
                Meeting Transcript
            </h1>

            {transcript.length === 0 ? (
                <p className="text-gray-500">
                    No transcript available.
                </p>
            ) : (
                <div className="space-y-6">
                    {transcript.map((item) => (
                        <div
                            key={item._id}
                            className="border-b pb-4"
                        >
                            <h2 className="text-lg font-bold text-blue-600">
                                {item.speaker}
                            </h2>

                            <p className="text-gray-800 mt-2">
                                {item.text}
                            </p>

                            <p className="text-sm text-gray-500 mt-2">
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