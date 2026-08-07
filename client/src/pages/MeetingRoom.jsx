import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api.js';
import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";
function MeetingRoom() {
    const {id} = useParams();
    const [meeting,setMeeting] = useState(null);
    const [token, setToken] = useState("");
    const [serverUrl, setServerUrl] = useState("");

    const navigate = useNavigate();

    const requestToken = async(roomName) => {
        try{
            const response = await api.post('/api/livekit/token',{
                roomName,
            });
            console.log("Requesting token...");
            setToken(response.data.token);
            setServerUrl(response.data.url);
        }catch(err){
            console.log(err);
        }
    }

    useEffect(()=>{
        if(meeting?._id){
            requestToken(meeting._id);
        }
    },[meeting?._id]);

    const fetchMeeting = async (id) => {
        try{
            const response = await api.get(`/api/meetings/${id}`);
            console.log("Fetching meeting...");
            setMeeting(response.data.meeting);
        }catch(err){
            console.log(err);
        }
    }

    useEffect(()=>{
        fetchMeeting(id);
    },[id])
    if (!meeting) {
        return(
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="flex flex-col items-center rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)]">
                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"></div>
                <h1 className="text-xl font-semibold text-slate-900">
                    Loading Meeting...
                </h1>
                <p className="mt-2 text-sm text-slate-500">Preparing the live room.</p>
            </div>
        </div>
        )
    }

    if (!token || !serverUrl) {
    return(
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="flex flex-col items-center rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)]">
                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"></div>
                <h1 className="text-xl font-semibold text-slate-900">
                    Joining Meeting...
                </h1>
                <p className="mt-2 text-sm text-slate-500">Securing your session connection.</p>
            </div>
        </div>
        )
    }


    return (
        <div className="min-h-screen bg-slate-50">
            <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live room</p>
                        <h2 className="text-sm font-semibold text-slate-900">{meeting?.title || "Meeting"}</h2>
                    </div>
                    <button
                        onClick={() => navigate("/meetings")}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Leave room
                    </button>
                </div>
            </div>
            <LiveKitRoom
                token={token}
                serverUrl={serverUrl}
                connect={true}
                video={true}
                audio={true}
                className="h-[calc(100vh-73px)]"
                onDisconnected={()=>{
                    navigate("/meetings");
                }}
            >
                <VideoConference />
            </LiveKitRoom>
        </div>
    );
}

export default MeetingRoom