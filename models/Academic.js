const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const AcademicSchema = new mongoose.Schema({
    academicId: Number,
    academicYear: String,
    active: { type: String,default: 0 }
})

AcademicSchema.plugin(AutoIncrement, { inc_field: 'academicId' });

module.exports = mongoose.model("academic", AcademicSchema)