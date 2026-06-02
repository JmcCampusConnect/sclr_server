const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({

    academicYear: { type: String, required: true, trim: true },

    // 1. Donor Identification
    donorId: { type: String, required: true },
    donorName: { type: String, required: true },
    donorType: { type: String, required: true },

    // 4. Donation Details
    generalAmt: { type: Number },
    zakkathAmt: { type: Number },

    // 5. Financial Balances
    generalBal: { type: Number },
    zakkathBal: { type: Number },

}, { timestamps: true });

module.exports = mongoose.model('fund', fundSchema);