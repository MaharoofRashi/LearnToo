const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    totalAmount: Number,
    discountedAmount: Number,
    transactionId: String,
    paymentStatus: String,
    orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);