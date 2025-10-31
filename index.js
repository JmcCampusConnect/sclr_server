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
const DonarModel = require('./models/Donor');

// -----------------------------------------------------------------------------------------------------------------

// Routes Path

const registerRoutes = require('./routes/registerRoutes');
const studentRoutes = require('./routes/studentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const authRoutes = require("./routes/authRoutes");
const aplnSettingsRoutes = require("./routes/admin/aplnSettingsRoutes");
const aplnRoutes = require("./routes/admin/aplnRoutes");
const donorRoutes = require("./routes/admin/donorRoutes");
const tutorRoutes = require("./routes/admin/tutorRoutes");
const staffManageRoutes = require("./routes/admin/staffRoutes");

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

app.use("/auth", authRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/application/settings', aplnSettingsRoutes);
app.use('/api/admin/application', aplnRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/staffManage', staffManageRoutes);

// -----------------------------------------------------------------------------------------------------------------