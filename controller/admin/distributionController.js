const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DonorModel = require('../../models/Donor');
const DistributionModel = require('../../models/Distribution');
const { currentAcademicYear } = require('../../utils/commonFunctions');
const { mongoose } = require('mongoose');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch students distribution statements

const fetchDistribution = async (req, res) => {
    
    try {
        const distributions = await DistributionModel.find().sort({ createdAt: -1 });
        return res.json({ distributions });
    } catch (error) {
        console.error('Error fetching distribution statements : ', error);
        return res.status(500).json({ message: 'Server error while fetching distribution statements.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchDistribution}