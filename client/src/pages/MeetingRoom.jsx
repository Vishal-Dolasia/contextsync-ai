import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

    const requestToken = async(roomName) => {
        try{
            const response = await api.post('/api/livekit/token',{
                roomName,
            });
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
    },[meeting]);

    const fetchMeeting = async (id) => {
        try{
            const response = await api.get(`/api/meetings/${id}`);
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
        <div className="flex items-center justify-center h-screen">
            <h1 className="text-2xl font-semibold">
                Loading Meeting...
            </h1>
        </div>
        )
    }

    if (!token || !serverUrl) {
    return(
        <div className="flex items-center justify-center h-screen">
            <h1 className="text-2xl font-semibold">
                Joining Meeting...
            </h1>
        </div>
        )
    }

    return (
        <LiveKitRoom
            token={token}
            serverUrl={serverUrl}
            connect={true}
            video={true}
            audio={true}
            className="h-screen"
        >
            <VideoConference />
        </LiveKitRoom>
    );
}

export default MeetingRoom