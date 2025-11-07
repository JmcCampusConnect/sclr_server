const StudentModel = require('../models/Student');
const ApplicationModel = require('../models/Application');
const StaffModel = require('../models/Staff');
const AcademicModel = require('../models/Academic');
const DistributionModel = require('../models/Distribution');
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

// For registering using hashing password ( Testing Purpose )

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
        
        const academicYear = await currentAcademicYear();
        if (!academicYear)
            return res.status(404).json({ message: "Active academic year not found" });

        const student = await StudentModel.findOne({ registerNo }).lean();
        if (!student)
            return res.status(404).json({ message: "Student not found" });

        const applications = await ApplicationModel.find({ registerNo, academicYear }).lean();
        const academicData = await AcademicModel.findOne({ academicYear }).lean();
        const isDateEnded = new Date() > new Date(academicData.applnEndDate);

        const canApply = !isDateEnded && applications.length === 0;
        const latestApplication = await ApplicationModel.findOne({ registerNo }).sort({ academicYear: -1 }).lean();
        const currentAcademic = await AcademicModel.findOne({ academicYear }).lean();
        let totalAmtGiven = 0;

        const allAcademics = await AcademicModel.find({ academicId: { $lt: currentAcademic.academicId } }).sort({ academicId: -1 }).lean();

        for (const prevAcademic of allAcademics) {
            const distributions = await DistributionModel.find({ academicYear: prevAcademic.academicYear, registerNo }).lean();
            if (distributions && distributions.length > 0) {
                totalAmtGiven = distributions.reduce((sum, entry) => sum + (entry.givenAmt || 0), 0);
                break;
            }
        }

        const studentApplnData = latestApplication ? { ...student, ...latestApplication } : { ...student };
        return res.json({ status: 200, student: studentApplnData, canApply, totalAmtGiven });

    } catch (err) {
        console.error("Error fetching student data for login application : ", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

// -----------------------------------------------------------------------------------------------------------------

module.exports = { registerUser, studentStatus, registerApplicationSave, checkRegisterNo, fetchStudentData }