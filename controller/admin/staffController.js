const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const StaffModel = require('../../models/Staff');
const DonorModel = require('../../models/Donor');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch donors

const fetchStaffs = async (req, res) => {
    
    try {
        const staffs = await StaffModel.find({ role: 2 }).sort({ createdAt: -1 });
        return res.json({ staffs });
    } catch (error) {
        console.error('Error fetching staffs : ', error);
        return res.status(500).json({ message: 'Server error while fetching staffs.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchStaffs }