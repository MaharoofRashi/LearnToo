const ChatMessage = require('../models/chatMessage');

const fetchChatHistory = async (req, res) => {
    const { courseId } = req.params;
    const { offset = 0, limit = 50 } = req.query;

    try {
        const messages = await ChatMessage.find({ course: courseId })
            .sort({ createdAt: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .populate('sender');
        res.json(messages);
    } catch (error) {
        res.status(500).send({ message: "Error fetching chat history", error });
    }
};

module.exports = {
    fetchChatHistory,
};
