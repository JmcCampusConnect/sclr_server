const mongoose = require('mongoose')

const AcademicSchema = new mongoose.Schema({
    academicId: Number,
    academicYear: String,
    active: { type: String,default: 0 }
})

module.exports = mongoose.model("academic", AcademicSchema)