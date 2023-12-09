const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    image: String,
    published: {
        type: Boolean,
        default: false
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Path `category` is required.'],
    },
    chatHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatMessage'
    }],
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    chatActive: {
        type: Boolean,
        default: true
    },
    lastActive: Date
})

module.exports = mongoose.model('Course', courseSchema);