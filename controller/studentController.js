const StudentModel = require('../models/Student');
const ApplicationModel = require('../models/Application');
const StaffModel = require('../models/Staff');
const AcademicModel = require('../models/Academic');
const bcrypt = require('bcryptjs')
const { currentAcademicYear } = require('../utils/commonFunctions');

// -----------------------------------------------------------------------------------------------------------------

// Application save through register application menu

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

// To check whether a register no is exists or not

const checkRegisterNo = async (req, res) => {

    const { registerNo } = req.query;

    try {
        const student = await StudentModel.findOne({ registerNo });
        if (student) { return res.json({ message: 'Already Applied' }) }
        else { return res.status(200).json({ success: true, message: "Allow to apply" }) }
    } catch (err) {
        console.error("Error in checking register number in Student Model for applying application : ", err);
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
}

// -----------------------------------------------------------------------------------------------------------------

// For Registering User using hashing password ( Testing Purpose )

const registerUser = async (req, res) => {

    // console.log(req.body)

    const { userId, userPassword } = req.body;

    try {

        const userExists = await StudentModel.findOne({ registerNo: userId });
        if (userExists) { return res.status(400).json({ message: "Register Number already in use" }) }
        const hashedPassword = await bcrypt.hash(userPassword, 10);
        await StaffModel.create({ staffName: userId, password: hashedPassword })
        res.status(201).json({ message: 'User created Successfully' });

    } catch (error) {
        console.error('Error in registering : ', error.message);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

// -----------------------------------------------------------------------------------------------------------------

// To dispaly the details for current academic year in student dashboard

const studentStatus = async (req, res) => {

    const { registerNo } = req.query;

    try {

        const academicYear = await currentAcademicYear();
        let applicant = await StudentModel.findOne({ registerNo })
        let application = await ApplicationModel.findOne({ registerNo, academicYear });

        if (application && applicant) {
            const applicationObj = application.toObject();
            const applicantObj = applicant.toObject();
            const studentData = { ...applicantObj, ...applicationObj };
            return res.json({ status: 200, student: studentData });
        } else {
            return res.json({ success: false, message: 'Applicantion does not exist' });
        }
    } catch (error) {
        console.log('Error in fetching student data for student dashboard : ', error);
        return res.status(500).json({ status: 500, message: 'An error occurred while fetching the student data' });
    }
}

// -----------------------------------------------------------------------------------------------------------------

// Data of students for login application menu


const fetchStudentData = async (req, res) => {

    const { registerNo } = req.query;

    try {
        let studentApplnData, permissionStatus;
        const academicYear = await currentAcademicYear();
        const  studentData= await StudentModel.findOne({ registerNo });
        if (!studentData) return res.status(404).send('Student not found');
        const latestApplication = await ApplicationModel
            .find({ registerNo }).sort({ academicYear: -1 }).limit(1).lean();
        const applicationData = latestApplication.length > 0 ? latestApplication[0] : null;

        if (applicationData) {
            const applicationObj = applicationData.toObject();
            const studentObj = studentData.toObject();
            studentApplnData = { ...studentObj, ...applicationObj };
        } else {
            return res.json({ success: false, message: 'Applicantion does not exist' });
        }

        const currAcademicForm = await ApplicationModel.findOne({ academicYear, registerNo });
        const semBasedAppln = await StudentModel.findOne({ registerNo });
        const isSemBased = semBasedAppln.isSemBased === 0 ? false : true;
        const dateData = await AcademicModel.findOne({ academicYear });
        const isDateEnded = dateData.applnEndDate < new Date() ? false : true;
        if (currAcademicForm || isDateEnded) {
            permissionStatus = false;
        }
        return res.json({ status: 200, student: studentApplnData });
    }
    catch (err) {
        console.error('Error fetching Student Data : ', err);
        res.status(500).send({ message: 'Internal server error', error: err });
    }
}

// -----------------------------------------------------------------------------------------------------------------

module.exports = { registerUser, studentStatus, registerApplicationSave, checkRegisterNo, fetchStudentData }