const StudentModel = require('../models/Student');
const ApplicationModel = require('../models/Application');
const StaffModel = require('../models/Staff');
const bcrypt = require('bcryptjs')
const { currentAcademicYear } = require('../utils/commonFunctions');

// -----------------------------------------------------------------------------------------------------------------

// For Registering User using hashing password ( Testing Purpose )

const registerUser = async (req, res) => {

    // console.log(req.body)

    const { userId, userPassword } = req.body;

    try {

        const userExists = await StudentModel.findOne({ registerNo: userId });
        // console.log(userExists)

        if (userExists) {
            return res.status(400).json({ message: "Register Number already in use" });
        }

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

module.exports = { registerUser, studentStatus }