const mongoose = require('mongoose');

const DistributionSchema = new mongoose.Schema({
    academicYear: String,
    sclrType: String,
    registerNo: String,
    name: String,
    department: String,
    donorType: String,
    donorId: String,
    donorName: String,
    givenAmt: Number,
}, { timestamps: true });

module.exports = mongoose.model('Distribution', DistributionSchema);