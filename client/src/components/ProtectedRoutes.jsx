import { useContext } from "react"
import { UserContext } from "./UserContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutes = () => {

    const {username} = useContext(UserContext);

  return username ? <Outlet/> : <Navigate to={'/login'} replace/>
}

export default ProtectedRoutes