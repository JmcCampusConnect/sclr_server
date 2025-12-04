const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({

    // 1. Basic Information
    registerNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    religion: { type: String, required: true },

    // 2. Academic Information
    yearOfAdmission: { type: String, required: true },
    graduate: { type: String },
    department: { type: String },
    section: { type: String },
    category: { type: String, required: true },

    // 3. Contact & Identity Details
    mobileNo: { type: String, required: true },
    aadharNo: { type: String, required: true },
    address: { type: String },
    district: { type: String },
    state: { type: String },
    pinCode: { type: Number },

    // 4. Family Information
    parentName: { type: String },
    parentNo: { type: String },
    parentOccupation: { type: String },
    parentAnnualIncome: { type: Number },

    // 5. Sibling Information
    siblingsStatus: { type: String, enum: ['Yes', 'No'], default: 'No' },
    siblingsCount: { type: Number },
    siblingsOccupation: { type: String },
    siblingsIncome: { type: Number },

    // 6. Miscellaneous / Status Fields
    hostelStatus: { type: String, enum: ['Yes', 'No'], default: 'No' },
    governmentScholarship: { type: Number, required: true, default: 0, enum: [0, 1, 2] },
    isSemBased: { type: Number, required: true, default: 0, enum: [0, 1] },
    totalCreditedAmount: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model("student", studentSchema);