const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    staffId: String,
    staffName: { type: String, default: 'Unknown' },
    batch: {type: String },
    department: { type: String },
    category: { type: String },
    section: { type: String },
    role: { type: Number, default: 0 }, 
    password: String,
}, { timestamps: true });

module.exports = mongoose.model('staff', staffSchema)