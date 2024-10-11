import axios from "axios";
import { createContext, useEffect, useState } from "react";


export const UserContext = createContext({});

const UserContextProvider = ({children}) => {

    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);

    
    useEffect(()=>{

        axios.get('/profile').then((response)=>{
            // console.log(response, 'userdata');
            setId(response.data?.userId);
            setUsername(response.data?.username)
        }).catch(err => console.log(err, 'user context'))

    }, [])

  return (
    <UserContext.Provider value={{username, setUsername, id, setId}}>
        {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider

