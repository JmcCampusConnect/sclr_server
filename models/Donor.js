const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({

    academicYear: { type: String, required: true },

    // 1. Donor Identification
    donorId: { type: String, required: true, unique: true },
    donorName: { type: String, required: true },
    donorType: { type: String, required: true },
    panOrAadhaar: { type: String },

    // 2. Contact Information
    mobileNo: { type: String },
    emailId: { type: String },

    // 3. Address Details
    address: { type: String },
    district: { type: String },
    state: { type: String },
    pinCode: { type: Number },

    // 4. Donation Details
    generalAmt: { type: Number },
    zakkathAmt: { type: Number },

    // 5. Financial Balances
    generalBal: { type: Number },
    zakkathBal: { type: Number },

}, { timestamps: true });

module.exports = mongoose.model('donor', donorSchema);
