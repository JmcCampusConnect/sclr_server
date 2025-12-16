const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema({

    // 1. Academic Information
    academicYear: { type: String, required: true },

    // 2. Donor Details
    donorId: { type: String, required: true },
    donorName: { type: String, required: true },
    donorType: { type: String, required: true },

    // 3. Student Details
    registerNo: { type: String, required: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    category: { type: String, required: true },
    graduate: { type: String, required: true },
    semester: { type: String, required: true },

    // 4. Scholarship Details
    sclrType: { type: String, required: true, enum: ['Fresher', 'Renewal'] },
    amtType: { type: String, required: true, enum: ['generalBal', 'zakkathBal'] },

    // 5. Distribution Details
    givenAmt: { type: Number, required: true, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('distribution', distributionSchema);
