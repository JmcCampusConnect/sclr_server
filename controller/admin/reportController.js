const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DistributionModel = require('../../models/Distribution');
const DonorModel = require('../../models/Donor');
const TransactionModel = require('../../models/Transaction');
const DepartmentModel = require('../../models/Department');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch Donors

const fetchDonors = async (req, res) => {
    try {
        const academicYear = await currentAcademicYear();
        const donors = await DonorModel.find({ academicYear }).sort({ createdAt: -1 });
        return res.json({ donors });
    } catch (error) {
        console.error('Error fetching donors : ', error);
        return res.status(500).json({ message: 'Server error while fetching donors.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch Data for Status Card

const fetchCardsData = async (req, res) => {

    try {

        const academicYear = await currentAcademicYear();

        const sumField = async (field) => {
            const result = await DonorModel.aggregate([
                { $match: { academicYear } },
                { $group: { _id: null, total: { $sum: `$${field}` } } },
            ]);
            return result[0]?.total || 0;
        };

        const [generalAmt, zakkathAmt, generalBal, zakkathBal] = await Promise.all([
            sumField("generalAmt"),
            sumField("zakkathAmt"),
            sumField("generalBal"),
            sumField("zakkathBal"),
        ]);

        const openingBal = generalAmt + zakkathAmt;

        const studentsBenefittedAgg = await DistributionModel.aggregate([
            { $match: { academicYear } },
            { $group: { _id: "$registerNo" } },
            { $count: "uniqueStudents" },
        ])

        const studentsBenefitted = studentsBenefittedAgg[0]?.uniqueStudents || 0;
        const totalStudents = await ApplicationModel.countDocuments({ academicYear });
        const totalDepartments = await DepartmentModel.countDocuments();

        res.status(200).json({
            totalStudents, generalAmt, zakkathAmt, openingBal,
            generalBal, zakkathBal, studentsBenefitted, totalDepartments,
        });

    } catch (error) {
        console.error("Error fetching benefitted students:", error);
        res.status(500).json({ message: "Error fetching benefitted students", error: error.message });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchDonors, fetchCardsData };