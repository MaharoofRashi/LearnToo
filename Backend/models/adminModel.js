const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: String,
    password: String,
    fullName: String
})

module.exports = mongoose.model('Admin', AdminSchema);