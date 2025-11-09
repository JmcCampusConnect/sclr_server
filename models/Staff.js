const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({

    // 1. Basic Identification
    staffId: { type: String, required: true, unique: true },
    staffName: { type: String, default: 'Unknown' },

    // 2. Academic Assignment
    batch: { type: String },
    department: { type: String },
    category: { type: String },
    section: { type: String },

    // 3. Role & Access Control
    role: { type: Number, default: 0 }, 

    // 4. Security
    password: { type: String, required: true },
    
}, { timestamps: true });

module.exports = mongoose.model('staff', staffSchema);
