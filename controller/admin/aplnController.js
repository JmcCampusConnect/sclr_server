const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const { currentAcademicYear } = require('../../utils/commonFunctions');
const { application } = require('express');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Academic years for dropdown values

const fetchStudents = async (req, res) => {

    try {

        const currAcYear = await currentAcademicYear();
        const allApplications = await ApplicationModel.find({ academicYear: currAcYear });
        const combinedData = await Promise.all(
            allApplications.map(async (apln) => {
                const student = await StudentModel.findOne({ registerNo: apln.registerNo });
                return { ...apln.toObject(), ...(student ? student.toObject() : {})}
            })
        )
        return res.json({ data: combinedData });
    } catch (error) {
        console.error("Error fetching students for admin application : ", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching students and applications.",
        })
    }
}

// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchStudents }