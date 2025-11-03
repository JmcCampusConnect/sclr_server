const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    donorId: String,
    donorName: String,
    donorType: String,
    generalAmt: Number,
    zakkathAmt: Number,
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);