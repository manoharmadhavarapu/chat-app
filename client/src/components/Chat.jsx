import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "./UserContext";
import Avatar from "./Avatar";
import Logo from "./Logo";
import axios from "axios";
import RightSideBar from "./RightSideBar";

const Chat = () => {

    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [offlinePeople, setOfflinePeople] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [contacts, setContacts] = useState([]);

    const [newMessage, setNewMessage] = useState('');
    const [receivedMessages, setReceivedMessages] = useState([]);

    const { username, id, setId, setUsername } = useContext(UserContext);

    useEffect(() => {
        connectToWs()
    }, []);

    function connectToWs() {
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws);

        ws.addEventListener('message', handleMessage)
        // ws.addEventListener('close', () => {
        //     setTimeout(() => {
        //         console.log('trying to reconnect')
        //         connectToWs();
        //     }, 1000)
        // })
    }

    const handleMessage = (e) => {
        const messageData = JSON.parse(e.data);
        console.log(messageData);

        if ('online' in messageData) {
            showOnlinePeople(messageData.online);
        }
        else {
            setReceivedMessages(prev => ([...prev, { ...messageData }]));
        }
    }

    const showOnlinePeople = (peopleArray) => {
        const people = {};
        peopleArray.forEach(({ username, userId }) => {
            people[userId] = username;
        });
        setOnlinePeople(people)
        console.log(people, 'people');
    }

    useEffect(() => {
        if (selectedUserId) {
            axios.get(`/messages/${selectedUserId}`).then((response) => {
                setReceivedMessages(response.data)
            }).catch((err) => console.log(err, '/messages endpoint'))
        }
    }, [selectedUserId])

    useEffect(() => {

        console.log('timer', onlinePeople)

        axios.get('/people').then(res => {
            const otherPeople = res.data.filter(p => p._id !== id);
            setContacts(otherPeople);

            const offlinePeopleArr = otherPeople.filter(op => {
                return !Object.keys(onlinePeople).includes(op._id)
            });

            setOfflinePeople(offlinePeopleArr);
        })

    }, [onlinePeople])


    const selectContact = (userId) => {
        setSelectedUserId(userId);
    }

    const sendMessage = (e) => {
        e.preventDefault();

        ws.send(JSON.stringify({
            message: {
                recipient: selectedUserId,
                text: newMessage
            }
        }));

        setNewMessage('');
        setReceivedMessages([...receivedMessages, { text: newMessage, sender: id, recipient: selectedUserId }]);
        console.log(receivedMessages)
    }

    const onlinePeopleExclOurUser = Object.keys(onlinePeople).filter(userId => onlinePeople[userId] !== username)

    const logoutHandler = () => {
        axios.post('/logout').then(res => {
            // ws.addEventListener('close', ()=>{
            //     console.log('logout success')
            // });
            ws.close();
            setWs(null);
            setId('');
            setUsername('');
        }).catch(err => console.log(err, 'logout error'))
    }

    const sendFile = async (e) => {
        console.log(e.target.files);
        const file = e.target.files[0];

        const formData = new FormData();
        formData.append('file', file);

        const res = await axios.post('/upload', formData);
        console.log(res);

        if (res.data.image) {
            ws.send(JSON.stringify({
                message: {
                    recipient: selectedUserId,
                    file: res.data.image,
                }
            }));
        }

    }

    return (
        <div className="flex h-screen">
            {/* left sidebar */}
            <div className={`bg-blue-100 ${selectedUserId ? 'hidden sm:flex' : 'w-full'} sm:w-1/3 flex flex-col`}>

                <Logo setSelectedUserId={setSelectedUserId} />
                <div className="flex-grow overflow-y-scroll chat-scroll mt-12">

                    {/* ONLINE PEOPLE */}
                    {
                        onlinePeopleExclOurUser?.map(userId => (
                            <div onClick={() => selectContact(userId)} key={userId} className={"border-b border-gray-100 pl-3 py-2 flex items-center gap-3 cursor-pointer " + (userId === selectedUserId ? "bg-blue-300" : "")}>
                                <Avatar online={true} username={onlinePeople[userId]} userId={userId} />
                                <span>{onlinePeople[userId]}</span>
                            </div>
                        ))
                    }

                    {/* OFFLINE PEOPLE */}
                    {
                        offlinePeople.map(user => (
                            <div onClick={() => selectContact(user._id)} key={user._id} className={"border-b border-gray-100 pl-3 py-2 flex items-center gap-3 cursor-pointer " + (user._id === selectedUserId ? "bg-blue-300" : "")}>
                                <Avatar online={false} username={user.username} userId={user._id} />
                                <span>{user.username}</span>
                            </div>
                        ))
                    }

                </div>
                <div className="mb-1 bg-black p-2 flex items-center justify-between z-50">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 bg-white text-green-700 rounded-full">
                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                        </svg>
                        <p className="text-white font-bold">{username}</p>

                    </div>
                    <button onClick={logoutHandler} className="text-white text-sm bg-red-600 p-1 px-2 rounded-md">Logout</button>
                </div>

            </div>

            {/* right sidebar */}
            <RightSideBar
                selectedUserId={selectedUserId}
                receivedMessages={receivedMessages}
                sendMessage={sendMessage}
                setNewMessage={setNewMessage}
                newMessage={newMessage}
                sendFile={sendFile}
                contacts={contacts}
            />
        </div>
    )
}

export default Chat