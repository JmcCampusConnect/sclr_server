const StudentModel = require('../models/Student');
const ApplicationModel = require('../models/Application');
const StaffModel = require('../models/Staff');
const AcademicModel = require('../models/Academic');
const DistributionModel = require('../models/Distribution');
const bcrypt = require('bcryptjs')
const { currentAcademicYear } = require('../utils/commonFunctions');

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

// To change password

const passwordChange = async (req, res) => {

    try {

        const { registerNo, password } = req.body;

        if (!registerNo || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const student = await StudentModel.findOneAndUpdate({ registerNo }, { password });

        if (!student) return res.status(404).json({ message: "Student not found" });
        return res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Error updating password : ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// -----------------------------------------------------------------------------------------------------------------

// Forgot password

const forgotPassword = async (req, res) => {

    try {

        const { registerNo, aadharNo, mobileNo, newPassword } = req.body;

        const student = await StudentModel.findOneAndUpdate({ mobileNo, aadharNo, registerNo }, { password: newPassword });
        if (!student) return res.status(404).json({ message: "Student not found" });
        return res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Error updating password : ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// -----------------------------------------------------------------------------------------------------------------

// Student details for student dashboard

const studentStatus = async (req, res) => {

    const { registerNo } = req.query;

    try {

        const academicYear = await currentAcademicYear();
        let applicant = await StudentModel.findOne({ registerNo })
        let application = await ApplicationModel.findOne({ registerNo, academicYear }).sort({ _id: -1 });;

        if (application && applicant) {
            const applicationObj = application.toObject();
            const applicantObj = applicant.toObject();
            const studentData = { ...applicantObj, ...applicationObj };
            return res.json({ status: 200, student: studentData });
        } else {
            return res.json({ success: false, message: 'Application does not exist' });
        }
    } catch (error) {
        console.error('Error in fetching student data for student dashboard : ', error);
        return res.status(500).json({ status: 500, message: 'An error occurred while fetching the student data' });
    }
}

// -----------------------------------------------------------------------------------------------------------------

// Student details for application menu

const fetchStudentData = async (req, res) => {

    const { registerNo } = req.query;

    try {

        const academicYear = await currentAcademicYear();
        if (!academicYear) return res.status(404).json({ message: "Active academic year not found" });

        const student = await StudentModel.findOne({ registerNo })
            .select('-governmentScholarship -createdAt -updatedAt -__v -_id')
            .lean();
        if (!student) return res.status(404).json({ message: "Student not found" });

        const applications = await ApplicationModel.find({ registerNo, academicYear }).lean().sort({ _id: -1 });
        const academicData = await AcademicModel.findOne({ academicYear }).lean();
        const endDate = new Date(academicData.applnEndDate);
        endDate.setHours(23, 59, 59, 999);
        const isDateEnded = new Date() > endDate;

        let canApply = true;

        if (student.isSemBased === 1) {
            if (isDateEnded || applications.length >= 2) { canApply = false }
            else { canApply = true }
        }
        else {
            if (isDateEnded || applications.length >= 1) {
                canApply = false
            }
            else {
                canApply = true
            }
        }

        const latestApplication = await ApplicationModel.findOne({ registerNo }).sort({ _id: -1 }).lean();
        const studentApplnData = JSON.parse(JSON.stringify(latestApplication ? { ...student, ...latestApplication } : { ...student }));

        const removeFields = [
            "jamathLetter", "sclrType", "_id",
            "lastStudiedInstitution", "lastStudiedInstitutionPercentage", "yearOfPassing",
            "classAttendancePercentage", "classAttendanceRemark",
            "deeniyathMoralAttendancePercentage", "deeniyathMoralRemark",
            "semesterMarkPercentage", "semesterArrear", "semesterGrade",
            "tutorVerification", "applicationStatus", "rejectionReasons",
            "createdAt", "updatedAt", "__v", "isSemBased", "tutorVerificationDetails"
        ];

        if (canApply) removeFields.push("semester");
        removeFields.forEach(field => delete studentApplnData[field]);
        return res.json({ status: 200, student: studentApplnData, canApply });

    } catch (err) {
        console.error("Error fetching student data for login application : ", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

// -----------------------------------------------------------------------------------------------------------------

// Application save through register application menu

const registerApplication = async (req, res) => {

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
        console.error('Error in saving register application : ', error.message)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// -----------------------------------------------------------------------------------------------------------------

// Application save through login application menu

const loginApplication = async (req, res) => {

    const { academicYear } = req.body

    try {

        const currAcademicYear = await currentAcademicYear();
        const formData = { ...req.body };

        formData.lastYearCreditedAmount = Number(formData.lastYearCreditedAmount) || 0;
        formData.currentYearCreditedAmount = Number(formData.currentYearCreditedAmount) || 0;

        if (currAcademicYear !== academicYear) {
            formData.lastYearCreditedAmount = formData.currentYearCreditedAmount;
            formData.currentYearCreditedAmount = 0;
        }
        if (req.file) { formData.jamathLetter = req.file.path }

        const studentApplicationDetails = new ApplicationModel({ ...formData, academicYear: currAcademicYear });
        await studentApplicationDetails.save();

        if (formData.registerNo) {
            const studentFields = Object.keys(StudentModel.schema.paths).filter(field => !['createdAt', 'updatedAt', '__v'].includes(field));
            const updateData = {};
            for (const key of Object.keys(formData)) { if (studentFields.includes(key)) { updateData[key] = formData[key] } }
            await StudentModel.findOneAndUpdate(
                { registerNo: formData.registerNo },
                { $set: updateData }, { new: true }
            )
        }

        return res.status(201).json({ status: 201, message: 'Application registered successfully' });

    } catch (error) {
        console.error('Error in saving login application : ', error.message)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// -----------------------------------------------------------------------------------------------------------------

module.exports = { registerUser, passwordChange, studentStatus, registerApplication, forgotPassword, checkRegisterNo, fetchStudentData, loginApplication }