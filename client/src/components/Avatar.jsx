
const Avatar = ({ username, userId, online }) => {

    const colors = [
        "bg-orange-200", "bg-amber-500", "bg-lime-200",
        "bg-red-200", "bg-green-200", "bg-purple-200",
        "bg-blue-200", "bg-yellow-200", "bg-teal-200",
    ]

    const userIdBase10 = parseInt(userId, 16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];

    return (
        <div className={`relative w-8 h-8 flex items-center bg- rounded-full ${color}`}>
            <div className="w-full text-center opacity-75 font-semibold">
                {username && username[0]?.toUpperCase()}
            </div>
            {
                online ? (
                    <div className="absolute bottom-0 right-0 rounded-full w-2 h-2 bg-green-600"></div>
                ) : (
                    <div className="absolute bottom-0 right-0 rounded-full w-2 h-2 bg-gray-400"></div>
                )
            }
        </div>
    )
}

export default Avatar