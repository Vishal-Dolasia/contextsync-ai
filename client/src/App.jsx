import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Clients from "./pages/Clients.jsx";
import Meetings from "./pages/Meetings.jsx"
import MeetingRoom from "./pages/MeetingRoom.jsx";
import Transcript from "./pages/Transcript.jsx";
import Summary from "./pages/Summary.jsx";


function App(){
  return(
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
          }/>
        <Route path="/clients" element = {
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
          }/>
        <Route path="/meetings" element = {
          <ProtectedRoute>
            <Meetings />
          </ProtectedRoute>
          }/>
        <Route path="/meeting/:id" element = {
          <ProtectedRoute>
            <MeetingRoom />
          </ProtectedRoute>
          }/>
        <Route
          path="/meetings/:id/transcript"
          element={
              <ProtectedRoute>
                  <Transcript />
              </ProtectedRoute>
        }/>
        <Route
        path="/meetings/:id/summary"
        element={
            <ProtectedRoute>
                <Summary />
            </ProtectedRoute>
        }/>  
      </Routes>
  )
}

export default App;