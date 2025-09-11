const StudentModel = require('../models/Student');
const ApplicationModel = require('../models/Application');
const { currentAcademicYear } = require('../utils/commonFunctions');

// -----------------------------------------------------------------------------------------------------------------

// Application Save through Register Mode 

const registerApplicationSave = async (req, res) => {

    let savedStudent;

    try {
        const academicYear = await currentAcademicYear()
        const formData = { ...req.body };
        if (req.file) {
            formData.jamathLetter = req.file.path
        }
        const studentBasicDetails = new StudentModel(formData);
        const studentOtherDetails = new ApplicationModel({ ...formData, academicYear });
        savedStudent = await studentBasicDetails.save();
        await studentOtherDetails.save();
        return res.status(201).json({ message: 'Application submitted successfully' });
    } catch (error) {
        if (savedStudent?._id) {
            await StudentModel.findByIdAndDelete(savedStudent._id)
        }
        console.error('Error in saving Fresher Application : ', error.message)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// -----------------------------------------------------------------------------------------------------------------

module.exports = { registerApplicationSave }