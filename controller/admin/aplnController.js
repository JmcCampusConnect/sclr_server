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
        const donors = await DonorModel.find();
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

        const { scholarships, academicYear } = req.body;

        if (!scholarships || scholarships.length === 0) {
            return res.status(400).json({ message: "No scholarships provided." });
        }

        const validDocs = [];

        for (const s of scholarships) {

            const donor = await DonorModel.findOne({ donorId: s.donorId });
            if (!donor) {
                console.warn(`Donor not found: ${s.donorId} (${s.donorName})`);
                continue;
            }
            const amt = parseFloat(s.amount) || 0;
            if (s.sclrType === "generalBal") { donor.generalBal = (donor.generalBal || 0) - amt }
            else if (s.sclrType === "zakkathBal") { donor.zakkathBal = (donor.zakkathBal || 0) - amt }

            await donor.save();

            validDocs.push({
                academicYear, sclrType: s.sclrType, registerNo: s.registerNo,
                name: s.name, department: s.department, donorType: s.donorType,
                donorId: s.donorId, donorName: s.donorName, givenAmt: s.amount,
            })
        }

        if (validDocs.length === 0) {
            return res.status(400).json({
                message: "No valid scholarships — all donor IDs were invalid.",
            })
        }

        const saved = await DistributionModel.insertMany(validDocs);

        res.status(201).json({
            message: "Scholarships distributed successfully & donor balances updated.",
            count: saved.length, data: saved,
        });
    } catch (error) {
        console.error("Error saving scholarships : ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchStudents, fetchDonors, sclrDistributions }