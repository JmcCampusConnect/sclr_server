const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({

    // 1. Student & Academic Identification
    academicYear: { type: String, required: true },
    registerNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    graduate: { type: String, required: true, enum: ['UG', 'PG'] }, 
    yearOfAdmission: { type: String, required: true },
    semester: { type: String, required: true },
    category: { type: String, required: true },
    specialCategory: { type: String, required: true },
    religion: { type: String, required: true },

    // 2. Scholarship Type & Related Info
    sclrType: { type: String, required: true, default: 'Fresher', enum: ['Fresher', 'Renewal'] },
    hasAppliedOtherScholarships: { type: String },
    jamathLetter: { type: String, required: true },

    // 3. Previous Study Details
    lastStudiedInstitution: { type: String },
    yearOfPassing: { type: Number },
    lastStudiedInstitutionPercentage: { type: Number, default: -1 },

    // 4. Attendance & Moral Records
    classAttendancePercentage: { type: Number, required: true, default: -1 },
    classAttendanceRemark: { type: String, required: true, default: 'Good' },
    deeniyathMoralAttendancePercentage: { type: Number, required: true, default: -1 },
    deeniyathMoralRemark: { type: String, required: true, default: 'Good' },

    // 5. Academic Performance
    semesterMarkPercentage: { type: Number, required: true, default: -1 },
    semesterArrear: { type: Number, required: true, default: 0 },
    semesterGrade: { type: String, required: true, default: 'A' },

    // 6. Application Verification & Status
    tutorVerification: { type: Number, required: true, default: 0, enum: [0, 1, 2] },
    applicationStatus: { type: Number, enum: [0, 1, 2], default: 0 },
    reason: { type: String, required: true, default: 'Your Application is under Process' },

    // 7. Financial Details
    lastYearCreditedAmount: { type: Number, default: 0 },
    currentYearCreditedAmount: { type: Number, default: 0 },
    totalCreditedAmount: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model("application", applicationSchema);