const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    otp: Number,
    isBlocked: { type: Boolean, default: false },
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course'}]
})

module.exports = mongoose.model('User', userSchema);
