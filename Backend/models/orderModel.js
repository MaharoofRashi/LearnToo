const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    totalAmount: Number,
    discountedAmount: Number,
    transactionId: String,
    paymentStatus: String,
    orderDate: { type: Date, default: Date.now },
    billingAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        zip: String
    }
});

module.exports = mongoose.model('Order', orderSchema);