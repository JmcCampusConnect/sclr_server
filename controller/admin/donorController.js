const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DonorModel = require('../../models/Donor');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch donors

const fetchDonors = async (req, res) => {
    
    try {
        const donors = await DonorModel.find().sort({ createdAt: -1 });
        return res.json({ donors });
    } catch (error) {
        console.error('Error fetching donors : ', error);
        return res.status(500).json({ message: 'Server error while fetching donors.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchDonors }