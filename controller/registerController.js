const StudentModel = require('../models/Student');
const ApplicationModel = require('../models/Application');
const { currentAcademicYear } = require('../utils/commonFunctions');

// -----------------------------------------------------------------------------------------------------------------

// Application Save through Register Mode 

const registerApplicationSave = async (req, res) => {

    // console.log(req.body)

    let savedStudent;

    try {
        const academicYear = await currentAcademicYear()
        const formData = { ...req.body };
        if (req.file) { formData.jamathLetter = req.file.path }
        const studentBasicDetails = new StudentModel(formData);
        const studentOtherDetails = new ApplicationModel({ ...formData, academicYear });
        savedStudent = await studentBasicDetails.save();
        await studentOtherDetails.save();
        return res.status(201).json({ status: 201, message: 'Application registered successfully' });
    } catch (error) {
        if (savedStudent?._id) { await StudentModel.findByIdAndDelete(savedStudent._id) }
        console.error('Error in saving Fresher Application : ', error.message)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// -----------------------------------------------------------------------------------------------------------------

// To check whether a Register Number is exists or not

const checkRegisterNo = async (req, res) => {

    const { registerNo } = req.body;

    try {
        const student = await StudentModel.findOne({ registerNo });
        if (student) { return res.json({ message: 'Already Applied' }) } 
        else {return res.status(200).json({ success: true, message: "Allow to apply" })}
    } catch (err) {
        console.error("Error in checking register number in Student Model for applying application : ", err);
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
}

// -----------------------------------------------------------------------------------------------------------------

module.exports = { registerApplicationSave, checkRegisterNo }