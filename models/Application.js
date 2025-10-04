const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    academicYear: { type: String, required: true },
    registerNo: { type: String, required: true, unique: true },
    semester: { type: String, required: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    graduate: { type: String, required: true },
    programCategory: { type: String, required: true },
    specialCategory: { type: String, required: true },
    yearOfAdmission: { type: String, required: true },
    religion: { type: String, required: true },
    sclrType: { type: String, required: true, default: 'Fresher', enum: ['Fresher', 'Renewal'] },
    hasAppliedOtherScholarships: { type: String },
    lastStudiedInstitution: { type: String },
    yearOfPassing: { type: Number },
    lastStudiedInstitutionPercentage: { type: Number, default: -1 },
    // Class Attendance
    classAttendancePercentage: { type: Number, required: true, default: -1 },
    classAttendanceRemark: { type: String, required: true, default: 'Good' },
    // Deeniyath Moral Attendance
    deeniyatMoralAttendancePercentage: { type: Number, required: true, default: -1 },
    deeniyathMoralRemark: { type: String, required: true, default: 'Good' },
    // Academic performance
    semesterMarkPercentage: { type: Number, required: true, default: -1 },
    semesterArrear: { type: Number, required: true, default: 0 },
    semesterGrade: { type: String, required: true, default: 'A' },
    semesterRemark: { type: String },
    jamathLetter: { type: String, required: true },
    applicationStatus: { type: Number, enum: [0, 1, 2], default: 0 },
    reason: { type: String, required: true, default: 'Your Application is under Process' },
    // Financial Status
    lastYearCreditedAmount: { type: Number, default: 0 },
    currentYearCreditedAmount: { type: Number, default: 0 },
    totalCreditedAmount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("application", applicationSchema);
