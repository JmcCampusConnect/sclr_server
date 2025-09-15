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

// For User Login
 
const loginUser = async (req, res) => {

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

module.exports = { registerUser }