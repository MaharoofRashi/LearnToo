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
})

module.exports = mongoose.model('Course', courseSchema);