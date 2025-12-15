const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DistributionModel = require('../../models/Distribution');
const DonorModel = require('../../models/Donor');
const TransactionModel = require('../../models/Transaction');
const DepartmentModel = require('../../models/Department');
const { currentAcademicYear } = require('../../utils/commonFunctions');
const mongoose = require("mongoose");

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

        const distributed = await DistributionModel.aggregate([
            { $match: { academicYear } },
            { $group: { _id: null, totalGiven: { $sum: "$givenAmt" } } },
        ])
        const totalDistributed = distributed.length > 0 ? distributed[0].totalGiven : 0;

        const studentsBenefitted = studentsBenefittedAgg[0]?.uniqueStudents || 0;
        const totalStudents = await ApplicationModel.countDocuments({ academicYear });
        const totalDepartments = await DepartmentModel.countDocuments();

        res.status(200).json({
            totalStudents, generalAmt, zakkathAmt, openingBal, totalDistributed,
            generalBal, zakkathBal, studentsBenefitted, totalDepartments,
        });

    } catch (error) {
        console.error("Error fetching benefitted students:", error);
        res.status(500).json({ message: "Error fetching benefitted students", error: error.message });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch Data for Status Card

const fetchDonorTransactions = async (req, res) => {

    try {

        const academicYear = await currentAcademicYear();
        const transactions = await TransactionModel.find({ academicYear }).sort({ createdAt: -1 });
        res.status(200).json({ transactions });

    } catch (error) {
        console.error("Error fetching benefitted students:", error);
        res.status(500).json({ message: "Error fetching benefitted students", error: error.message });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Delete Transaction

const deleteTransaction = async (req, res) => {

    try {

        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Transaction ID is required"
            });
        }

        const transaction = await TransactionModel.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        const { donorId, generalAmt = 0, zakkathAmt = 0 } = transaction;

        const donor = await DonorModel.findOneAndUpdate(
            { donorId: String(donorId) },
            {
                $inc: {
                    generalAmt: -generalAmt,
                    generalBal: -generalAmt,
                    zakkathAmt: -zakkathAmt,
                    zakkathBal: -zakkathAmt
                }
            },
            { new: true }
        );

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: "Donor not found"
            });
        }

        await TransactionModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Transaction deleted successfully",
            deletedTransaction: {
                _id: id, donorId, generalAmt, zakkathAmt
            },
            updatedDonor: {
                donorId: donor.donorId,
                generalAmt: donor.generalAmt,
                generalBal: donor.generalBal,
                zakkathAmt: donor.zakkathAmt,
                zakkathBal: donor.zakkathBal
            }
        });

    } catch (error) {
        console.error("Error deleting transaction:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchDonors, fetchCardsData, fetchDonorTransactions, deleteTransaction };