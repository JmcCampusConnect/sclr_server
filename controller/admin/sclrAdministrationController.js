const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DonorModel = require('../../models/Donor');
const DistributionModel = require('../../models/Distribution');
const { currentAcademicYear } = require('../../utils/commonFunctions');
const { mongoose } = require('mongoose');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch students for Admin Sclr Admisnistration

const fetchStudents = async (req, res) => {

    try {

        const currAcYear = await currentAcademicYear();
        const allApplications = await ApplicationModel.find({ academicYear: currAcYear });
        const combinedData = await Promise.all(
            allApplications.map(async (apln) => {
                const student = await StudentModel.findOne({ registerNo: apln.registerNo });
                return { ...apln.toObject(), ...(student ? student.toObject() : {}) }
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

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch students for Admin Sclr Admisnistration

// Fetch donars for Admin Sclr Admisnistration

const fetchDonors = async (req, res) => {

    try {
        const currAcYear = await currentAcademicYear();
        const donors = await DonorModel.find({ academicYear: currAcYear });
        return res.json({ donors });
    } catch (error) {
        console.error("Error fetching donars for admin application : ", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching donars for applications.",
        })
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Distribute scholarships to students

const sclrDistributions = async (req, res) => {

    try {

        const { scholarships } = req.body;
        const academicYear = await currentAcademicYear();

        // console.log(scholarships)

        if (!scholarships || scholarships.length === 0) { return res.status(400).json({ message: "No scholarships provided." }) }

        const validDocs = [];

        for (const s of scholarships) {

            const donor = await DonorModel.findOne({ donorId: s.donorId });
            if (!donor) {
                console.warn(`Donor not found: ${s.donorId} (${s.donorName})`);
                continue;
            }
            const amt = parseFloat(s.amount) || 0;
            if (s.amtType === "generalBal") { donor.generalBal = (donor.generalBal || 0) - amt }
            else if (s.amtType === "zakkathBal") { donor.zakkathBal = (donor.zakkathBal || 0) - amt }

            await donor.save();

            const app = await ApplicationModel.findOne({ registerNo: s.registerNo });
            if (app) {
                app.applicationStatus = 1;
                app.reason = "Application has been approved";
                app.currentYearCreditedAmount = (app.currentYearCreditedAmount || 0) + amt;
                app.totalCreditedAmount = (app.totalCreditedAmount || 0) + amt;
                await app.save();
            } else {
                console.warn(`Application not found for Register No : ${s.registerNo}`);
            }

            validDocs.push({
                academicYear, sclrType: s.sclrType, registerNo: s.registerNo,
                name: s.name, department: s.department, donorType: s.donorType,
                donorId: s.donorId, donorName: s.donorName, givenAmt: s.amount,
                category: s.category, amtType: s.amtType
            })
        }

        if (validDocs.length === 0) {
            return res.status(400).json({ message: "No valid scholarships — all donor IDs were invalid.", })
        }

        const saved = await DistributionModel.insertMany(validDocs);

        res.status(201).json({
            message: "Scholarships distributed successfully & donor balances updated.",
            count: saved.length, data: saved,
        })

    } catch (error) {
        console.error("Error saving scholarships : ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Reject applications for Admin

const rejectApplications = async (req, res) => {

    try {

        const { registerNo, reason } = req.body;
        const academicYear = await currentAcademicYear()

        const updatedApp = await ApplicationModel.findOneAndUpdate(
            { registerNo, academicYear },
            { $set: { applicationStatus: 2, reason: reason } },
            { new: true }
        )

        if (!updatedApp) {
            return res.status(404).json({
                success: false,
                message: "Application not found for the given register number.",
            })
        }

        res.status(200).json({
            success: true, data: updatedApp,
            message: "Application rejected successfully.",
        })

    } catch (error) {
        console.error("Error rejecting application : ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while rejecting application.",
        })
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchStudents, fetchDonors, sclrDistributions, rejectApplications }