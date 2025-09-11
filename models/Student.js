const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    registerNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    yearOfAdmission: { type: String, required: true },
    department: { type: String },
    section: { type: String },
    mobileNo: { type: String, required: true },
    aadharNo: { type: String, required: true },
    address: { type: String },
    district: { type: String },
    state: { type: String },
    pinCode: { type: Number },
    hostelStatus: { type: String, enum: ['Yes', 'No'], default: 'No' },
    governmentScholarship: { type: String, required: true, enum: ['Yes', 'No'], default: 'No' },
    // Parents Details
    parentName: { type: String },
    parentNo: { type: String },
    parentOccupation: { type: String },
    parentAnnualIncome: { type: Number },
    // Sibings Details
    siblingsStatus: { type: String, enum: ['Yes', 'No'], default: 'No' },
    siblingsCount: { type: Number },
    siblingsOccupation: { type: String },
    siblingsIncome: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("student", studentSchema);
