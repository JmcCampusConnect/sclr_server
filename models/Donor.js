const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    donorId: String,
    donorName: String,
    mobileNo: Number,
    emailId: String,
    panOrAadhaar: String,
    address: String,
    district: String,
    state: String,
    pinCode: Number,
    donorType: String,
    donorDate: String,
    generalAmt: Number,
    generalBal: Number,
    zakkathAmt: Number,
    zakkathBal: Number,
}, { timestamps: true });

module.exports = mongoose.model('donor', donorSchema)