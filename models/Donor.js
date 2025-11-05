const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({

    // 1. Donor Identification
    donorId: { type: String, required: true, unique: true },
    donorName: { type: String, required: true },
    donorType: { type: String, required: true },
    panOrAadhaar: { type: String },

    // 2. Contact Information
    mobileNo: { type: String, required: true },
    emailId: { type: String },

    // 3. Address Details
    address: { type: String },
    district: { type: String },
    state: { type: String },
    pinCode: { type: Number },

    // 4. Donation Details
    donorDate: { type: String }, 
    generalAmt: { type: Number, default: 0 },
    zakkathAmt: { type: Number, default: 0 },

    // 5. Financial Balances
    generalBal: { type: Number, default: 0 },
    zakkathBal: { type: Number, default: 0 },
    
}, { timestamps: true });

module.exports = mongoose.model('donor', donorSchema);
