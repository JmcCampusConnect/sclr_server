const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const StaffModel = require('../../models/Staff');
const DonorModel = require('../../models/Donor');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch donors

const fetchTutors = async (req, res) => {
    
    try {
        const tutors = await StaffModel.find({ role: 3 }).sort({ createdAt: -1 });
        console.log(tutors)
        return res.json({ tutors });
    } catch (error) {
        console.error('Error fetching tutors : ', error);
        return res.status(500).json({ message: 'Server error while fetching tutors.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchTutors }