const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ----------------------------------------------------------------------------------------------------------------

// Fetch applications for Application Management

const fetchApplicationData = async (req, res) => {

    try {

        const academicYear = await currentAcademicYear();
        if (!academicYear) { return res.status(400).json({ message: "Academic year not found." }) }
        const applications = await ApplicationModel.find({ academicYear }).lean();

        for (const app of applications) {

            const student = await StudentModel.findOne({ registerNo: app.registerNo }).lean();

            app.applicationId = app._id;

            if (student) {
                app.studentId = student._id;
                app.section = student.section ?? null;
                app.mobileNo = student.mobileNo ?? null;
                app.aadharNo = student.aadharNo ?? null;
            } else {
                app.studentId = null;
                app.section = null;
                app.mobileNo = null;
                app.aadharNo = null;
            }
        }

        if (!applications.length) { return res.status(404).json({ message: "No pending applications found.", data: [] }) }

        return res.status(200).json({
            message: "Applications fetched successfully.",
            count: applications.length, data: applications
        });

    } catch (error) {
        console.error("Error fetching applications : ", error);
        return res.status(500).json({
            message: "Internal server error while fetching applications.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

// ----------------------------------------------------------------------------------------------------------------

// For deleting an application

const deleteApplication = async (req, res) => {

    try {

        const { id } = req.body;

        if (!id) return res.status(400).json({ message: "ID is required" });

        const deleted = await ApplicationModel.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Application not found" });
        }

        return res.status(200).json({ message: "Application deleted successfully" });

    } catch (error) {
        console.error("Delete Error : ", error);
        return res.status(500).json({ message: "Server error while deleting" });
    }
}

// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchApplicationData, deleteApplication };