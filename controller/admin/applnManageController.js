const StaffModel = require('../../models/Staff');
const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DonorModel = require('../../models/Donor');
const DistributionModel = require('../../models/Distribution');
const { currentAcademicYear } = require('../../utils/commonFunctions');
const { mongoose } = require('mongoose');

// ----------------------------------------------------------------------------------------------------------------

// Fetch applications for Application Management

const fetchApplicationData = async (req, res) => {

    try {

        const academicYear = await currentAcademicYear();
        if (!academicYear) { return res.status(400).json({ message: "Academic year not found." }) }

        const applications = await ApplicationModel.find(
            { academicYear, applicationStatus: 0 }, { __v: 0 }
        ).lean();

        if (!applications.length) { return res.status(404).json({ message: "No pending applications found.", data: [] }) }

        return res.status(200).json({
            message: "Applications fetched successfully.",
            count: applications.length,
            data: applications
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
        console.error("Delete Error:", error);
        return res.status(500).json({ message: "Server error while deleting" });
    }
}

// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchApplicationData, deleteApplication };