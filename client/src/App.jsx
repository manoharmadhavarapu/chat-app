import Register from "./components/Register";
import axios from "axios";
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Chat from "./components/Chat";
import ProtectedRoutes from "./components/ProtectedRoutes";


function App() {

  axios.defaults.baseURL = 'http://localhost:4000';
  axios.defaults.withCredentials = true;

  return (
    <>
      <ToastContainer />

      <Routes>

        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<ProtectedRoutes />}>
          <Route path="chat" element={<Chat />} />
        </Route>

      </Routes>
    </>
  )
}

export default App
