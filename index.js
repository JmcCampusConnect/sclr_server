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
const staffRoutes = require('./routes/staffRoutes');

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
// app.use('/api/staff', staffRoutes);

// -----------------------------------------------------------------------------------------------------------------

// For genetating token

const generateToken = (userId) => { return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '1h' }) }

// -----------------------------------------------------------------------------------------------------------------

// For user login

app.post('/user/login', async (req, res) => {

    try {

        const { userId, userPassword } = req.body;

        let userType = null;
        let user = null;

        const studentUser = await StudentModel.findOne({ registerNo: userId });
        const staffUser = await StaffModel.findOne({ staffId: userId });

        if (studentUser) {
            userType = 'Student';
            user = studentUser;
        } else if (staffUser) {
            userType = 'Staff';
            user = staffUser;
        } else {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const match = userPassword === user.password;
        if (!match) return res.status(400).json({ status: 400, message: 'Password does not match' });

        const token = generateToken(user._id, userType === 'Student' ? 0 : user.role);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            maxAge: 60 * 60 * 1000
        });

        return res.status(200).json({
            status: 200,
            user: {
                userId: userType === 'Student' ? user.registerNo : user.staffId,
                role: userType === 'Student' ? 0 : user.role
            }
        });

    } catch (error) {
        console.error('Error during Login : ', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
})

// -----------------------------------------------------------------------------------------------------------------

// For user logout

app.post('/api/user/logout', (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out successfully" });
})

// -----------------------------------------------------------------------------------------------------------------

// Protect Middleware

const protect = (req, res, next) => {

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

// -----------------------------------------------------------------------------------------------------------------

app.get("/user/profile", protect, (req, res) => {

    return res.status(200).json({
        status: 200,
        user: {
            userId: req.user.userId,
            role: req.user.role,
        },
        message: "Authenticated",
    })
})

// -----------------------------------------------------------------------------------------------------------------