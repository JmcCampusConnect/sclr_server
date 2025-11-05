const mongoose = require('mongoose');


const transactionSchema = new mongoose.Schema({
    
    // 1. Donor Identification
    donorId: { type: String, required: true },
    donorName: { type: String, required: true },
    donorType: { type: String, required: true },

    // 2. Transaction Details
    generalAmt: { type: Number, default: 0 },
    zakkathAmt: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('transaction', transactionSchema);
