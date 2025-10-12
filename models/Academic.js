const mongoose = require('mongoose');

const AcademicSchema = new mongoose.Schema({
    academicId: { type: Number, required: true, unique: true },
    academicYear: { type: String, required: true, trim: true },
    active: { type: Number, default: 0, enum: [0, 1] },
    applnStartDate: { type: Date, required: true },
    applnEndDate: { type: Date, required: true, },
}, { timestamps: true });

module.exports = mongoose.model('Academic', AcademicSchema);