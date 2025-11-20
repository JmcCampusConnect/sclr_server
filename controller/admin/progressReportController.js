const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DistributionModel = require('../../models/Distribution');
const DonorModel = require('../../models/Donor');
const TransactionModel = require('../../models/Transaction');
const DepartmentModel = require('../../models/Department');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch counts to show 

const fetchCounts = async (req, res) => {

    try {

        const academicYear = await currentAcademicYear();

        const totalApplicants = await ApplicationModel.countDocuments({ academicYear });

        // ---- COE REPORT ---- //

        const coeFinished = await ApplicationModel.countDocuments({
            academicYear,
            semesterMarkPercentage: { $ne: -1 },
            semester: { $ne: "I" }
        });

        const coeTotal = await ApplicationModel.countDocuments({
            academicYear,
            semester: { $ne: "I" }
        });

        const coePending = coeTotal - coeFinished;

        // ---- CLASS ATTENDANCE REPORT ---- //

        const attendanceFinished = await ApplicationModel.countDocuments({
            academicYear,
            classAttendancePercentage: { $ne: -1 }
        });

        const attendancePending = totalApplicants - attendanceFinished;

        // ---- DEENIYATH MORAL ATTENDANCE REPORT ---- //

        const deeniyathFinished = await ApplicationModel.countDocuments({
            academicYear,
            deeniyathMoralAttendancePercentage: { $ne: -1 }
        });

        const deeniyathPending = totalApplicants - deeniyathFinished;

        // ---- SCLR REPORT ----

        const uniqueRegisters = await ApplicationModel.distinct("registerNo", { academicYear });

        const totalRegisters = uniqueRegisters.length;

        const sclrFinished = await StudentModel.countDocuments({
            registerNo: { $in: uniqueRegisters },
            governmentScholarship: 1   
        });

        const sclrPending = totalRegisters - sclrFinished;

        // ---- TUTOR REPORT ---- //

        const tutorFinished = await ApplicationModel.countDocuments({
            academicYear,
            tutorVerification: 1
        });

        const tutorPending = totalApplicants - tutorFinished;

        return res.json({
            coe: {
                finished: coeFinished,
                total: coeTotal,
                pending: coePending,
            },
            attendance: {
                finished: attendanceFinished,
                total: totalApplicants,
                pending: attendancePending,
            },
            deeniyath: {
                finished: deeniyathFinished,
                total: totalApplicants,
                pending: deeniyathPending,
            },
            sclr: {
                finished: sclrFinished,
                total: totalApplicants,
                pending: sclrPending,
            },
            tutor: {
                finished: tutorFinished,
                total: totalApplicants,
                pending: tutorPending,
            }
        });

    } catch (err) {
        console.error("Error in fetchCounts for work progress report : ", err);
        res.status(500).json({ error: "Something went wrong", details: err.message });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchCounts };