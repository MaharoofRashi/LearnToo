const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    }
}, { timestamps: true });


module.exports = mongoose.model('Lesson', lessonSchema);
