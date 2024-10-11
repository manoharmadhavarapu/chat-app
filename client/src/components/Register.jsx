import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { UserContext } from "./UserContext";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cPassword, setCPassword] = useState('');

    const navigate = useNavigate();

    const { username: loggedInUsername ,setUsername: setLoggedInUsername, setId } = useContext(UserContext)

    const handleRegister = async (e) => {

        e.preventDefault();

        if (password !== cPassword) {
            toast.error("password & confirm password should be same");
            return;
        }

        try {
            const response = await axios.post('/register', { username, email, password });
            console.log(response);

            setLoggedInUsername(username);
            setId(response.data.id);

            setUsername('');
            setEmail('');
            setPassword('');
            setCPassword('');

        } catch (error) {
            toast.error(error?.response?.data?.error)
        }
    }

    useEffect(()=>{
        if(loggedInUsername) {
            navigate('/chat')
        }
    }, [loggedInUsername, navigate])

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <div className="w-[70%] sm:w-[50%] md:w-[30%] mx-auto p-5 shadow-xl bg-white rounded-lg">
                <h1 className="mb-5 text-2xl text-indigo-600 text-center font-bold">Register</h1>
                <form className="w-full" onSubmit={handleRegister}>
                    <input type="text" placeholder="username"
                        className="block w-full p-2 mb-2 border border-gray-200 rounded-lg"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <input type="email" placeholder="email"
                        className="block w-full p-2 mb-2 border border-gray-200 rounded-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input type="password" placeholder="password"
                        className="block w-full p-2 mb-2 border border-gray-200 rounded-lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <input type="password" placeholder="confirm password"
                        className="block w-full p-2 mb-2 border border-gray-200 rounded-lg"
                        value={cPassword}
                        onChange={(e) => setCPassword(e.target.value)}
                        required
                    />

                    <button className="bg-blue-500 text-white block w-full text-semibold rounded-sm p-2 mt-5 mb-2">REGISTER</button>

                </form>
                <p className="text-center">Already have an account? <span className="text-red-600 cursor-pointer font-medium mt-3 hover:underline"><Link to={'/login'}>Login</Link></span></p>
            </div>
        </div>
    )
}

export default Register