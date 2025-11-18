const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const StaffModel = require('../../models/Staff');
const DonorModel = require('../../models/Donor');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch students

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

const passwordSemBasedChange = async (req, res) => {

    const { registerNo } = req.params;
    const { password, isSemBased } = req.body;

    try {
        await StudentModel.updateOne(
            { registerNo },
            { $set: { password, isSemBased } }
        );
        res.json({ success: true, message: "Student updated successfully" });
    } catch (err) {
        console.error("Error in saving student data : ", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchStudentData, passwordSemBasedChange }