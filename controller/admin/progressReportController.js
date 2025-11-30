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

        const uniqueRegisters = await ApplicationModel.distinct("registerNo", {
            academicYear,
            applicationStatus: 0
        });

        const totalRegisters = uniqueRegisters.length;

        let sclrFinished = 0;

        for (const reg of uniqueRegisters) {
            const exists = await StudentModel.exists({
                registerNo: reg,
                governmentScholarship: 1
            });
            if (exists) sclrFinished++;
        }

        const sclrPending = totalRegisters - sclrFinished;

        // ---- TUTOR REPORT ---- //

        const tutorFinishedRegisters = await ApplicationModel.distinct("registerNo", {
            academicYear,
            tutorVerification: 1
        });

        const tutorFinished = tutorFinishedRegisters.length;

        const tutorPending = totalRegisters - tutorFinished;

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
                total: totalRegisters,
                pending: sclrPending,
            },
            tutor: {
                finished: tutorFinished,
                total: totalRegisters,
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