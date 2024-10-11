import React, { useContext, useEffect, useRef } from 'react'
import { UserContext } from './UserContext';

const RightSideBar = ({ selectedUserId, receivedMessages, sendMessage, setNewMessage, newMessage, sendFile, contacts }) => {

    const underMessagesRef = useRef();
    const { id } = useContext(UserContext);

    const selectedUsername = contacts && contacts.filter((user) =>{
        if(user && user._id === selectedUserId) {
           return user.username
        }
    });

    useEffect(() => {
        if (underMessagesRef.current) {
            underMessagesRef.current.scrollIntoView(
                {
                    behavior: 'smooth',
                    block: 'end',
                    inline: 'nearest'
                })
        }
    }, [receivedMessages]);

    const uniqueReceived = [...new Set(receivedMessages)];

    return (
        <div className={`${!selectedUserId ? 'hidden' : 'flex w-full'} sm:flex flex-col bg-blue-300 sm:w-2/3`}>
            {
                selectedUserId && (
                    <div className={`bg-blue-800 p-2 flex sm:hidden items-center fixed w-full justify-between z-50 shadow-xl`}>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 bg-white text-green-700 rounded-full">
                                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                            </svg>
                            <p className="text-white font-bold">{selectedUsername[0].username}</p>
                        </div>
                    </div>
                )
            }

            <div className="flex-grow overflow-y-scroll chat-scroll sm:mt-0 mt-10 p-2">
                {
                    !selectedUserId && (
                        <div className="flex items-center justify-center h-full">
                            <p>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                                    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                                </svg>
                            </p>

                            <p className="font-bold text-amber-700 text-lg ml-3">Select Chats</p>
                        </div>
                    )
                }
                {
                    !!selectedUserId && (
                        <div>
                            {
                                uniqueReceived && uniqueReceived.map((message, index) => (
                                    <div key={index} className={`${message.sender === id ? 'text-right' : 'text-left'}`}>
                                        {
                                            message.text && (
                                                <div className={`text-left inline-block p-2 my-2 text-sm rounded-lg ${message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'}`}>
                                                    <p className='text-xs opacity-50 mb-1'>{(message.createdAt).substring(0, 10)} --- {(message.createdAt).substring(11, 16)}</p>
                                                    <p>{message.text}</p>
                                                </div>
                                            )
                                        }

                                        {
                                            message.file && (
                                                <div className={`text-left inline-block p-2 my-2 text-sm rounded-lg ${message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'}`}>
                                                    <a className="underline my-1 font-medium" target="blank" href={`http://localhost:4000/uploads${message.file}`}>{message.file}</a>
                                                    <img className="w-[20%] h-[20%]" src={`http://localhost:4000/uploads${message.file}`} />
                                                </div>
                                            )
                                        }
                                        <div ref={underMessagesRef}></div>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>

            {
                selectedUserId &&
                <form onSubmit={sendMessage} className="flex items-center gap-1">
                    <input
                        type="text"
                        placeholder="Type your message"
                        className="bg-white p-2 border flex-grow rounded-md"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <label className="bg-blue-500 p-2 text-white rounded-md cursor-pointer">
                        <input type="file" className="hidden" onChange={sendFile} />
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                        </svg>

                    </label>
                    <button type="submit" className="bg-blue-500 p-2 text-white rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            }
        </div>
    )
}

export default RightSideBar