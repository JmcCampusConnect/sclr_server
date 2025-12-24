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

// Distribution Statement Update 

const updateStatement = async (req, res) => {

    try {

        const { _id } = req.params;

        /* 1️⃣ Fetch old distribution */
        const oldDist = await DistributionModel.findById(_id);
        if (!oldDist) {
            return res.status(404).json({ message: "Distribution not found" });
        }

        /* 2️⃣ Destructure old values */
        const { donorId: oldDonorId, amtType: oldAmtType, givenAmt: oldAmt, academicYear, registerNo } = oldDist;

        /* 3️⃣ Destructure new values */
        const {
            donorId: newDonorId,
            amtType: newAmtType,
            givenAmt: newAmt
        } = req.body;

        const oldAmount = Number(oldAmt) || 0;
        const newAmount = Number(newAmt) || 0;

        /* ---------------- DONOR BALANCE LOGIC ---------------- */

        // CASE 1️⃣ SAME DONOR
        if (oldDonorId === newDonorId) {

            // Same amount type ➜ apply difference
            if (oldAmtType === newAmtType) {
                const diff = newAmount - oldAmount;

                await DonorModel.updateOne(
                    { donorId: oldDonorId, academicYear },
                    { $inc: { [oldAmtType]: -diff } }
                );
            }

            // Amount type changed
            else {
                // Add back to old type
                await DonorModel.updateOne(
                    { donorId: oldDonorId, academicYear },
                    { $inc: { [oldAmtType]: oldAmount } }
                );

                // Deduct from new type
                await DonorModel.updateOne(
                    { donorId: oldDonorId, academicYear },
                    { $inc: { [newAmtType]: -newAmount } }
                );
            }
        }

        // CASE 2️⃣ DIFFERENT DONOR
        else {
            // Revert old donor
            await DonorModel.updateOne(
                { donorId: oldDonorId, academicYear },
                { $inc: { [oldAmtType]: oldAmount } }
            );

            // Deduct from new donor
            await DonorModel.updateOne(
                { donorId: newDonorId, academicYear },
                { $inc: { [newAmtType]: -newAmount } }
            );
        }

        /* ---------------- DONOR DETAILS SYNC (FIX) ---------------- */

        // Do not trust frontend for donor fields

        delete req.body.donorName;
        delete req.body.donorType;

        // If donorId changed, fetch correct donor details

        if (oldDonorId !== newDonorId) {
            const donor = await DonorModel.findOne({
                donorId: newDonorId,
                academicYear
            });
            if (!donor) { return res.status(404).json({ message: "New donor not found" }) }
            req.body.donorName = donor.donorName;
            req.body.donorType = donor.donorType;
        }

        /* ---------------- UPDATE DISTRIBUTION ---------------- */
        const updatedDistribution = await DistributionModel.findByIdAndUpdate(id, req.body, { new: true });

        /* ---------------- STUDENT ---------------- */
        const diffAmount = newAmount - oldAmount;
        await StudentModel.updateOne({ registerNo }, { $inc: { totalCreditedAmount: diffAmount } });

        /* ---------------- APPLICATION ---------------- */
        await ApplicationModel.updateMany(
            { registerNo, academicYear },
            { $inc: { currentYearCreditedAmount: diffAmount } }
        );

        return res.status(200).json({
            success: true,
            message: "Distribution updated successfully",
            updatedDistribution
        });

    } catch (error) {
        console.error("Update distribution error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating distribution"
        });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Distribution Statement Delete 

const deleteStatement = async (req, res) => {

    try {

        const { _id } = req.params;

        const dist = await DistributionModel.findById(_id);

        if (!dist) {
            return res.status(404).json({
                success: false,
                message: "Distribution record not found"
            });
        }

        const { givenAmt, registerNo, amtType, donorId, academicYear } = dist;

        // 2️⃣ Update donor balances
        if (amtType === 'generalBal') {
            await DonorModel.updateOne(
                { donorId },
                {
                    $inc: {
                        generalBal: givenAmt,
                        generalAmt: givenAmt
                    }
                }
            );
        }

        if (amtType === 'zakkathBal') {
            await DonorModel.updateOne(
                { donorId },
                {
                    $inc: {
                        zakkathBal: givenAmt,
                        zakkathAmt: givenAmt
                    }
                }
            );
        }

        // 3️⃣ Update student total credited amount
        await StudentModel.updateOne(
            { registerNo },
            {
                $inc: { totalCreditedAmount: -givenAmt }
            }
        );

        // 4️⃣ Update application current year credited amount
        await ApplicationModel.updateMany(
            { registerNo, academicYear },
            {
                $inc: { currentYearCreditedAmount: -givenAmt }
            }
        );

        // 5️⃣ Delete distribution record
        await DistributionModel.findByIdAndDelete(_id);

        return res.status(200).json({
            success: true,
            message: "Distribution statement deleted and balances reverted successfully"
        });

    } catch (error) {
        console.error("Delete distribution error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting distribution"
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch distribution students by semesters

const getStudentsBySemesters = async (req, res) => {

    try {

        const { semesters } = req.body;

        if (!Array.isArray(semesters)) {
            return res.status(400).json({ message: "Invalid semesters" });
        }

        const students = await ApplicationModel.find({
            semester: { $in: semesters }
        }).select("registerNo name department category graduate semester sclrType");

        res.json(students);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchDistribution, fetchCardsData, deleteStatement, updateStatement, getStudentsBySemesters }