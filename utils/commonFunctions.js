const express = require("express");
const router = express.Router();
const AcademicModel = require("../models/Academic");
const ApplicationModel = require("../models/Application");
const DepartmentModel = require("../models/Department");
const DonorModel = require("../models/Donor");
const StaffModel = require("../models/Staff");

// -----------------------------------------------------------------------------------------------------------------

// Get current academic year

const currentAcademicYear = async () => {
    const curr = await AcademicModel.findOne({ active: 1 }).lean();
    return curr?.academicYear;
};

// -----------------------------------------------------------------------------------------------------------------

// Fetch dropdown data

router.get("/fetchDropdownData", async (req, res) => {

    try {
        const batches = await ApplicationModel.distinct("yearOfAdmission");
        const departments = await DepartmentModel.find().select("department departmentName");
        const categories = await ApplicationModel.distinct("category");
        const donors = await DonorModel.find().select("donorId donorName");
        const tutors = await StaffModel.find({ category: { $ne: null } }).select("staffId staffName");
        res.json({ batches, departments, categories, donors, tutors });
    } catch (error) {
        console.error("Error fetching dropdown values : ", error);
        return res.status(500).json({ message: "Server error while fetching dropdown data" });
    }
});

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;
module.exports.currentAcademicYear = currentAcademicYear;