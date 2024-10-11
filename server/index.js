const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const ws = require('ws');
const path = require('path');

const connectDB = require('./db/db');
const UserModel = require('./models/userModel');
const MessageModel = require('./models/messageModel');
const uploadRoutes = require('./routes/uploadRoutes');

dotenv.config();
const PORT = process.env.PORT

connectDB();

const app = express();
let count = 0

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
// app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.post('/register', async (req, res) => {

    const { username, email, password } = req.body;

    if (!username.trim() || !email.trim() || !password.trim()) {
        return res.status(400).json({
            error: 'Please fill all the inputs'
        })
    }

    const usernameExits = await UserModel.findOne({ username });
    if (usernameExits) {
        res.status(400).json({
            error: username + " Username already exist"
        })
    }

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
        res.status(400).json({
            error: "User already exist with this email"
        })
    }

    try {

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const createdUser = await UserModel.create({ username, email, password: hashedPassword });

        jwt.sign({ userId: createdUser._id, username }, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 1 * 24 * 60 * 60 * 1000
            }).status(201).json({
                id: createdUser._id,
                username: createdUser.username,
            })
        })

    } catch (error) {
        res.status(400).json({ error: error.message })
    }

});

app.get('/profile', (req, res) => {
    const token = req.cookies?.token;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
            if (err) throw err;
            // console.log(userData)
            res.json(userData)
        })
    } else {
        res.status(401).json('no token');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const foundUser = await UserModel.findOne({ username });

    if (foundUser) {
        const isPasswordValid = await bcrypt.compare(password, foundUser.password);

        if (isPasswordValid) {
            jwt.sign({ userId: foundUser._id, username: foundUser.username }, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
                if (err) throw err;
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    sameSite: 'strict',
                    maxAge: 1 * 24 * 60 * 60 * 1000
                }).status(201).json({
                    id: foundUser._id,
                    username: foundUser.username,
                })
            })
        } else {
            res.status(404).json({ error: "Password incorrect or not found" })
        }

    } else {
        res.status(404).json({ error: "user not found" })
    }

});

app.get('/messages/:userId', async (req, res) => {
    const { userId } = req.params;
    const token = req.cookies?.token;
    if (token) {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decodedData);
        const { userId: ourUserId } = decodedData;

        const messages = await MessageModel.find({
            sender: {
                $in: [userId, ourUserId],
            },
            recipient: {
                $in: [userId, ourUserId],
            }
        });

        res.json(messages);

    } else {
        res.status(401).json({
            error: "Unauthorized"
        })
    }
});

app.get('/people', async (req, res) => {
    try {
        const users = await UserModel.find({}, { _id: 1, username: 1 });
        console.log(users, 'users', count++);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json('something went wromg')
    }
});

app.post('/logout', async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 0
    }).status(200).json('ok')
})

app.use('/upload', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
console.log(path.join(__dirname, '/uploads'));

const server = app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`)
})


// WEBSOCKET SERVER
const wsServer = new ws.WebSocketServer({ server });

wsServer.on('connection', (connection, request) => {

    // read username and id from the cookie
    const cookies = request.headers.cookie;

    if (cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.trim().startsWith('token='));

        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1];

            if (token) {
                jwt.verify(token, process.env.JWT_SECRET, {}, (err, decoded) => {
                    if (err) throw err;
                    const { userId, username } = decoded;
                    connection.userId = userId;
                    connection.username = username;
                })
            }
        }
    }

    connection.on('message', async (message) => {

        const messageData = JSON.parse(message.toString());
        console.log(messageData)
        const { recipient, text, file } = messageData?.message;

        // storing messages in db
        const messageDoc = await MessageModel.create({
            sender: connection.userId,
            recipient,
            text: text ? text : undefined,
            file: file ? file : undefined,
        })

        if (recipient && (text || file)) {
            [...wsServer.clients].filter(c => c.userId === recipient).forEach(c => c.send(JSON.stringify({
                text: text ? text : undefined,
                file: file ? file : undefined,
                sender: connection.userId,
                recipient,
                id: messageDoc._id
            })))
        }
    });

    // notify about online people
    function notifyAboutOnlinePeople() {
        [...wsServer.clients].forEach(client => {
            client.send(JSON.stringify({
                online: [...wsServer.clients].map(c => ({
                    userId: c.userId,
                    username: c.username,
                }))
            }))
        });
    }
    notifyAboutOnlinePeople();

    // connection.send(JSON.stringify({
    //     online: [...wsServer.clients].map(c => ({
    //         userId: c.userId,
    //         username: c.username,
    //     }))
    // }));

    connection.on('close', () => {
        notifyAboutOnlinePeople();
    });
})
