const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    staffId: String,
    staffName: { type: String, default: 'Unknown' },
    role: { type: Number, default: 0 },
    password: String,
}, { timestamps: true });

module.exports = mongoose.model('staff', staffSchema)