const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const StaffModel = require('../../models/Staff');
const DonorModel = require('../../models/Donor');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch donors

const fetchStudentData = async (req, res) => {

    try {
        const students = await StudentModel.find().sort({ createdAt: -1 });
        return res.json({ students });
    } catch (error) {
        console.error('Error fetching students : ', error);
        return res.status(500).json({ message: 'Server error while fetching students.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchStudentData }