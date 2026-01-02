const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");

// -----------------------------------------------------------------------------------------------------------------

// Imported Functions

const connectDB = require('./config/db');

// -----------------------------------------------------------------------------------------------------------------

// Routes Path

const commonFunctions = require('./utils/commonFunctions');
const studentRoutes = require('./routes/studentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const authRoutes = require("./routes/authRoutes");
const aplnSettingsRoutes = require("./routes/admin/aplnSettingsRoutes");
const sclrAdministrationRoutes = require("./routes/admin/sclrAdministrationRoutes");
const donorManageRoutes = require("./routes/admin/manage/donorManageRoutes");
const tutorManageRoutes = require("./routes/admin/manage/tutorManageRoutes");
const staffManageRoutes = require("./routes/admin/staffManageRoutes");
const distributionRoutes = require("./routes/admin/distributionRoutes");
const dashboardRoutes = require("./routes/admin/dashboardRoutes");
const deptManageRoutes = require("./routes/admin/manage/deptManageRoutes");
const reportRoutes = require("./routes/admin/reportRoutes");
const changePasswordRoutes = require("./routes/admin/changePasswordRoutes");
const studentManageRoutes = require("./routes/admin/manage/studentManageRoutes");
const progressReportRoutes = require("./routes/admin/progressReportRoutes");
const applnManageRoutes = require("./routes/admin/manage/applnManageRoutes");
const fileUploadRoutes = require("./routes/admin/fileUploadRoutes");
const dataDeletionRoutes = require("./routes/admin/dataDeletionRoutes");

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

app.use("/api/common", commonFunctions);
app.use("/auth", authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/application/settings', aplnSettingsRoutes);
app.use('/api/admin/application', sclrAdministrationRoutes);
app.use('/api/donor', donorManageRoutes);
app.use('/api/tutor', tutorManageRoutes);
app.use('/api/staffManage', staffManageRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dept', deptManageRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/password', changePasswordRoutes);
app.use('/api/studentManage', studentManageRoutes);
app.use('/api/progressReport', progressReportRoutes);
app.use('/api/manage/appln', applnManageRoutes);
app.use('/api/fileUpload', fileUploadRoutes);
app.use('/api/dataDeletion', dataDeletionRoutes);

// -----------------------------------------------------------------------------------------------------------------