const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    otp: Number,
    isBlocked: { type: Boolean, default: false },
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course'}],
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course'}],
    addresses: [{
        street: String,
        city: String,
        state: String,
        country: String,
        zip: String
    }],
    education: [{
        degree: String,
        institution: String,
        year: Number
    }]
})

module.exports = mongoose.model('User', userSchema);
