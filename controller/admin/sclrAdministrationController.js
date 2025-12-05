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
                const aplnData = apln.toObject();
                const studentData = student ? student.toObject() : {};
                return {
                    ...aplnData, applicationId: aplnData._id,
                    studentId: studentData._id, ...studentData
                }
            })
        )

        return res.json({ data: combinedData });

    } catch (error) {
        console.error("Error fetching students for admin application : ", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching students and applications.",
        });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

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

            const app = await ApplicationModel.findOne({ _id: s.applicationId });
            if (app) {
                app.applicationStatus = 1;
                app.rejectionReasons = [];
                app.currentYearCreditedAmount = (app.currentYearCreditedAmount || 0) + amt;
                await app.save({ validateBeforeSave: false });
                const student = await StudentModel.findOne({ registerNo: s.registerNo });
                if (student) {
                    student.totalCreditedAmount = (student.totalCreditedAmount || 0) + amt;
                    await student.save();
                } else {
                    console.warn(`Student not found : ${s.registerNo}`);
                }
            } else {
                console.warn(`Application not found for Register No : ${s.registerNo}`);
            }

            if (app) {
                const previousApp = await ApplicationModel.findOne({
                    registerNo: s.registerNo,
                    academicYear: app.academicYear,
                    _id: { $ne: app._id }
                });
                if (previousApp) {
                    previousApp.currentYearCreditedAmount =
                        (previousApp.currentYearCreditedAmount || 0) + amt;
                    await previousApp.save({ validateBeforeSave: false });
                    console.log(`Previous application also updated for ${s.registerNo}`);
                }
            }

            validDocs.push({
                academicYear, sclrType: s.sclrType, registerNo: s.registerNo,
                name: s.name, department: s.department, donorType: s.donorType,
                donorId: s.donorId, donorName: s.donorName, givenAmt: s.amount,
                category: s.category, amtType: s.amtType, graduate: s.graduate,
                semester: s.semester
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
        console.error("Error saving scholarships ---- : ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Reject applications for Admin

const rejectApplications = async (req, res) => {

    try {

        const { registerNo, reasons, applicationId } = req.body;
        const academicYear = await currentAcademicYear()

        const updatedApp = await ApplicationModel.findOneAndUpdate(
            { registerNo, academicYear, _id: applicationId },
            {
                $push: { rejectionReasons: { $each: reasons } },
                $set: { applicationStatus: 2 }
            },
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

// Fetch Students for Quick Rejection

const quickRejection = async (req, res) => {

    try {

        const academicYear = await currentAcademicYear();
        const applications = await ApplicationModel.find({ applicationStatus: 0, academicYear });

        const combined = await Promise.all(applications.map(async (appl) => {
            const a = appl.toObject();
            const student = await StudentModel.findOne({ registerNo: a.registerNo });
            const s = student ? student.toObject() : {};
            const parentIncome = Number(s.parentAnnualIncome || 0);
            const siblingsIncome = Number(s.siblingsIncome || 0);
            const combinedIncome = parentIncome + siblingsIncome;

            return {
                ...a, studentId: s._id || null,
                parentAnnualIncome: parentIncome,
                siblingsIncome: siblingsIncome,
                combinedIncome,
            };
        }));

        return res.status(200).json({ application: combined });

    } catch (e) {
        console.error("Error in Quick Rejection: ", e.message || "Error in Quick Rejection: ", e);
        return res.status(500).json({ success: false, message: 'Server error fetching quick rejection data.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Quick reject Applications 

const quickRejectApplications = async (req, res) => {

    try {

        const { applications } = req.body;
        const academicYear = await currentAcademicYear();

        if (!applications || !Array.isArray(applications) || applications.length === 0) {
            return res.status(400).json({ success: false, message: 'No applications provided for rejection.' });
        }

        const results = [];

        for (const appData of applications) {

            const { registerNo, reasons, applicationId } = appData;

            if (!registerNo || !reasons || !Array.isArray(reasons)) {
                results.push({
                    registerNo: registerNo || '?', success: false,
                    message: 'Missing registerNo or reasons.'
                });
                continue;
            }

            try {
                const updatedApp = await ApplicationModel.findOneAndUpdate(
                    { registerNo, academicYear, _id: applicationId },
                    {
                        $push: { rejectionReasons: { $each: reasons } },
                        $set: { applicationStatus: 2 }
                    },
                    { new: true }
                );

                if (!updatedApp) {
                    results.push({ registerNo, success: false, message: 'Application not found.' });
                } else {
                    results.push({ registerNo, success: true, message: 'Rejected successfully.', data: updatedApp });
                }
            } catch (err) {
                results.push({ registerNo, success: false, message: err.message });
            }
        }

        const succeeded = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        return res.status(200).json({
            success: true, results,
            message: `Processed ${applications.length} applications. Succeeded: ${succeeded}, Failed: ${failed}.`,
        });

    } catch (e) {
        console.error('Error in quick reject application save :', e);
        return res.status(500).json({ success: false, message: 'Server error during bulk rejection.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchStudents, fetchDonors, sclrDistributions, rejectApplications, quickRejection, quickRejectApplications }