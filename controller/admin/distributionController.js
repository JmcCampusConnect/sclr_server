const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DonorModel = require('../../models/Donor');
const DistributionModel = require('../../models/Distribution');
const { currentAcademicYear } = require('../../utils/commonFunctions');
const { mongoose } = require('mongoose');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch students distribution statements

const fetchDistribution = async (req, res) => {

    try {
        const academicYear = await currentAcademicYear();
        const distributions = await DistributionModel.find({ academicYear }).sort({ createdAt: -1 });
        return res.json({ distributions });
    } catch (error) {
        console.error('Error fetching distribution statements : ', error);
        return res.status(500).json({ message: 'Server error while fetching distribution statements.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

const fetchCardsData = async (req, res) => {

    try {
        const academicYear = await currentAcademicYear();
        const totalApplicants = await ApplicationModel.countDocuments({ academicYear });
        const totalBenefitted = await DistributionModel.distinct("registerNo", { academicYear });
        const totalBenefittedCount = totalBenefitted.length;
        const donors = await DonorModel.aggregate([
            { $match: { academicYear } },
            {
                $group: { _id: null, totalGeneral: { $sum: "$generalAmt" }, totalZakat: { $sum: "$zakkathAmt" } },
            },
        ]);

        const totalSclrshipAwarded = donors.length > 0 ? donors[0].totalGeneral + donors[0].totalZakat : 0;

        const distributed = await DistributionModel.aggregate([
            { $match: { academicYear } },
            { $group: { _id: null, totalGiven: { $sum: "$givenAmt" } } },
        ])
        const totalDistributed = distributed.length > 0 ? distributed[0].totalGiven : 0;

        res.status(200).json({
            totalApplicants,
            totalBenefitted: totalBenefittedCount,
            totalSclrshipAwarded,
            totalDistributed,
        })

    } catch (error) {
        console.error("Error fetching card data for distribution statement : ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchDistribution, fetchCardsData }