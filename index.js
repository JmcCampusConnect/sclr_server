const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");

// -----------------------------------------------------------------------------------------------------------------

// Imported Functions

const connectDB = require('./config/db');

// -----------------------------------------------------------------------------------------------------------------

// Imported Model

const AcademicModel = require('./models/Academic');
const StudentModel = require('./models/Student');
const StaffModel = require('./models/Staff');

// -----------------------------------------------------------------------------------------------------------------

// Routes Path

const registerRoutes = require('./routes/registerRoutes');
const studentRoutes = require('./routes/studentRoutes');

// -----------------------------------------------------------------------------------------------------------------

// To load environment variables from .env to application

dotenv.config({ quiet: true });

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}))

connectDB();

app.use('/zamathfiles', express.static(path.join(__dirname, 'zamathfiles')));

// -----------------------------------------------------------------------------------------------------------------

// To verify in which port has taken the backend

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

// -----------------------------------------------------------------------------------------------------------------

// Routes Link

app.use('/api/register', registerRoutes);
app.use('/api/student', studentRoutes);

// -----------------------------------------------------------------------------------------------------------------

// For genetating token

const generateToken = (userId) => { return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '1h' }) }

// -----------------------------------------------------------------------------------------------------------------

// For user login

app.post('/api/user/login', async (req, res) => {

    try {

        const { userId, userPassword } = req.body;

        let userType = null;
        let user = null

        studentUser = await StudentModel.findOne({ registerNo: userId })
        staffUser = await StaffModel.findOne({ staffId: userId })

        if (studentUser) {
            userType = 'Student'
            user = studentUser;
        }
        else if (staffUser) {
            userType = 'Staff';
            user = staffUser;
        }
        else {
            return res.status(404).json({ status: 404, message: 'User not found' })
        }

        const match = userPassword === user.password
        if (!match) { return res.status(400).json({ status: 400, message: 'Invalid credentials' }) }

        const token = generateToken(user._id);

        res.cookie("jwt", token, {
            httpOnly: true,   // JS cannot read
            secure: false,    // must be false for localhost (HTTP)
            sameSite: "lax",  // strict/lax/cross-site — use lax for dev
            maxAge: 60 * 60 * 1000,
        });

        return res.status(200).json({
            status: 200,
            user: {
                userId: userType === 'Student' ? user.registerNo : user.staffId,
                role: userType === 'Student' ? 0 : user.role
            }
        })

    } catch (error) {
        console.error('Error during Login : ', error);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
})