const express = require('express')
const http = require('http');
const {Server} = require('socket.io');
const setupChatServer = require('./realTime/chatServer');
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const port = 3000
const morgan = require('morgan');
require('dotenv').config();



app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(cors({origin: "*"}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

setupChatServer(io);

mongoose.connect('mongodb+srv://rashimon083:OabLjTASMzmFzZ10@cluster0.1vego6i.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const adminRoute = require('./routes/adminRoute');
const userRoute = require('./routes/userRoutes')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/admin', adminRoute);
app.use('/user', userRoute);


server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})