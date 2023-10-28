const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course'}]
})

module.exports = mongoose.model('User', userSchema);
