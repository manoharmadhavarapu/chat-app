import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const { username: loggedInUsername ,setUsername: setLoggedInUsername, setId } = useContext(UserContext)

    const handleLogin = async (e) => {

        e.preventDefault();
        console.log('login calling')

        try {
            const response = await axios.post('/login', { username, password });
            console.log(response);
            setLoggedInUsername(username);
            setId(response.data.id);

            setUsername('');
            setPassword('');

            navigate('/chat')

        } catch (error) {
            toast.error(error.response?.data?.error)
        }

    }

    useEffect(()=>{
        if(loggedInUsername) {
            navigate('/chat')
        }
    }, [navigate, loggedInUsername])

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <div className="w-[70%] sm:w-[50%] md:w-[30%] mx-auto p-5 shadow-xl bg-white rounded-lg">
                <h1 className="mb-5 text-2xl text-green-600 text-center font-bold">Login</h1>
                <form className="w-full" onSubmit={handleLogin}>
                    <input type="text" placeholder="username"
                        className="block w-full p-2 mb-2 border border-gray-200 rounded-lg"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <input type="password" placeholder="password"
                        className="block w-full p-2 mb-2 border border-gray-200 rounded-lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button className="bg-green-500 text-white block w-full text-bold rounded-sm p-2 mt-5 mb-2">LOGIN</button>

                </form>
                <p className="text-center">New to ChatApp <span className="text-red-600 cursor-pointer font-medium mt-3 hover:underline"><Link to={'/'}>Sign up now.</Link></span></p>
            </div>
        </div>
    )
}

export default Login