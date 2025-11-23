const express = require("express");
const router = express.Router();
const AcademicModel = require("../models/Academic");
const ApplicationModel = require("../models/Application");
const DepartmentModel = require("../models/Department");
const DonorModel = require("../models/Donor");

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
        res.json({ batches, departments, categories, donors });
    } catch (error) {
        console.error("Dropdown Error:", error);
        return res.status(500).json({ message: "Server error while fetching dropdown data" });
    }
});

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;
module.exports.currentAcademicYear = currentAcademicYear;