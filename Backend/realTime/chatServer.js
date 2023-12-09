const {Server} = require('socket.io');
const Redis = require('ioredis');
const User = require('../models/userModel');
const ChatMessage = require('../models/chatMessage');
const Course = require('../models/courseModel');
const Room = require('../models/roomModel');

const redisClient = new Redis(); //127.0.0.1:6379

console.log("started socketio")

module.exports = function (io) {
    io.on('connection', async (socket) => {
        console.log('A user connected to the chat server', socket.id);

        const userId = socket.handshake.query.userId;
        const isAdmin = socket.handshake.query.isAdmin === 'true';
        console.log(`User ID: ${userId}, isAdmin: ${isAdmin}`);

        await User.findByIdAndUpdate(userId, { isOnline: true });

        try {
            let rooms = [];
            console.log('rooms', rooms)
            if (isAdmin) {
                const courses = await Course.find({});
                for (const course of courses) {
                    const roomId = `course_${course._id}`;
                    rooms.push(roomId);
                    socket.join(roomId);
                    console.log(`User ${userId} joined room: ${roomId}`);
                    await Room.updateOne(
                        { _id: roomId },
                        { $addToSet: { users: userId } },
                        { upsert: true }
                    );
                }
                console.log('room', rooms)
            } else {
                const user = await User.findById(userId).populate('purchasedCourses');
                for (const course of user.purchasedCourses) {
                    const roomId = `course_${course._id}`;
                    rooms.push(roomId);
                    socket.join(roomId);
                    console.log(`User ${userId} joined room: ${roomId}`);
                    await Room.updateOne(
                        { _id: roomId },
                        { $addToSet: { users: userId } },
                        { upsert: true }
                    );
                }
                console.log('room', rooms)
            }

            rooms.forEach(room => {
                socket.to(room).emit('userJoined', { userId, room });
            });

            socket.on('sendMessage', async ({ sender, message, courseId }) => {
                try {
                    console.log('Received message:', { sender, message, courseId });
                    const newMessage = new ChatMessage({ sender, course: courseId, message, readBy: [sender] });
                    await newMessage.save();

                    await redisClient.lpush(`course_chat_${courseId}`, JSON.stringify(newMessage));
                    await redisClient.ltrim(`course_chat_${courseId}`, 0, 99);

                    io.to(`course_${courseId}`).emit('newMessage', newMessage);
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            });

            socket.on('markMessageAsRead', async ({ messageId, userId }) => {
                try {
                    await ChatMessage.updateOne(
                        { _id: messageId },
                        { $addToSet: { readBy: userId } }
                    );
                    io.to(`course_${courseId}`).emit('messageRead', { messageId, userId });
                } catch (error) {
                    console.error('Error marking message as read:', error);
                }
            });

            socket.on('getChatHistory', async (courseId, offset = 0, limit = 50) => {
                try {
                    let messages;
                    const cacheKey = `course_chat_${courseId}`;
                    const start = offset;
                    const end = start + limit - 1;

                    const cachedMessages = await redisClient.lrange(cacheKey, start, end);

                    if (cachedMessages.length > 0) {
                        messages = cachedMessages.map(msg => JSON.parse(msg));
                    } else {
                        messages = await ChatMessage.find({ course: courseId })
                            .sort({ createdAt: -1 })
                            .skip(offset)
                            .limit(limit)
                            .populate('sender');
                    }

                    socket.emit('chatHistory', messages);
                } catch (error) {
                    console.error('Error fetching chat history:', error);
                }
            });


            socket.on('disconnect', async () => {
                console.log(`User ${userId} disconnected`);
                for (const room of rooms) {
                    await Room.updateOne(
                        { _id: room },
                        { $pull: { users: userId } }
                    );
                    socket.to(room).emit('userLeft', { userId, room });
                }
                await User.findByIdAndUpdate(userId, { isOnline: false });
            });

        } catch (error) {
            console.error('Error in socket connection:', error);
        }
    });
};
