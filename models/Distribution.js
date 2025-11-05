const mongoose = require('mongoose');

const DistributionSchema = new mongoose.Schema({
    academicYear: String,
    donorId: String,
    donorType: String,
    donorName: String,
    sclrType: String,
    registerNo: String,
    name: String,
    department: String,
    category: String,
    amtType: String,
    givenAmt: Number,
}, { timestamps: true });

module.exports = mongoose.model('Distribution', DistributionSchema);