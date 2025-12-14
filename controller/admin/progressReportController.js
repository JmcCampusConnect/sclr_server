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

        // Fetch all applications for the year
        const allApplications = await ApplicationModel.find({ academicYear });

        // Helper to classify semester
        const isEvenSemester = (semester) => ["II", "IV", "VI"].includes(semester);
        const isOddSemester = (semester) => ["I", "III", "V"].includes(semester);

        // ---- COE REPORT ---- //
        const coe = { odd: { finished: 0, total: 0, pending: 0 }, even: { finished: 0, total: 0, pending: 0 } };
        allApplications.forEach(app => {
            if (app.semester !== "I") {
                if (isEvenSemester(app.semester)) coe.even.total++;
                if (isOddSemester(app.semester)) coe.odd.total++;

                if (app.semesterMarkPercentage !== -1) {
                    if (isEvenSemester(app.semester)) coe.even.finished++;
                    if (isOddSemester(app.semester)) coe.odd.finished++;
                }
            }
        });
        coe.even.pending = coe.even.total - coe.even.finished;
        coe.odd.pending = coe.odd.total - coe.odd.finished;

        // ---- CLASS ATTENDANCE REPORT ---- //
        const categories = ["Aided", "SFM", "SFW"];
        const attendance = { odd: {}, even: {} };
        for (const cat of categories) {
            attendance.odd[cat] = { finished: 0, total: 0, pending: 0 };
            attendance.even[cat] = { finished: 0, total: 0, pending: 0 };
        }
        allApplications.forEach(app => {
            const { category, semester, classAttendancePercentage } = app;
            if (!categories.includes(category)) return;
            const target = isEvenSemester(semester) ? attendance.even : attendance.odd;
            target[category].total++;
            if (classAttendancePercentage !== -1) target[category].finished++;
        });
        categories.forEach(cat => {
            attendance.odd[cat].pending = attendance.odd[cat].total - attendance.odd[cat].finished;
            attendance.even[cat].pending = attendance.even[cat].total - attendance.even[cat].finished;
        });

        // ---- DEENIYATH MORAL ATTENDANCE REPORT ---- //
        const deeniyathSections = ["aidedSfmMuslim", "sfwMuslim", "aidedSfmNonMuslim", "sfwNonMuslim"];
        const deeniyath = { odd: {}, even: {} };
        deeniyathSections.forEach(sec => {
            deeniyath.odd[sec] = { finished: 0, total: 0, pending: 0 };
            deeniyath.even[sec] = { finished: 0, total: 0, pending: 0 };
        });
        allApplications.forEach(app => {
            const { category, religion, semester, deeniyathMoralAttendancePercentage } = app;
            let section = "";
            if ((category === "Aided" || category === "SFM") && religion === "Muslim") section = "aidedSfmMuslim";
            else if (category === "SFW" && religion === "Muslim") section = "sfwMuslim";
            else if ((category === "Aided" || category === "SFM") && religion !== "Muslim") section = "aidedSfmNonMuslim";
            else if (category === "SFW" && religion !== "Muslim") section = "sfwNonMuslim";
            if (!section) return;
            const target = isEvenSemester(semester) ? deeniyath.even : deeniyath.odd;
            target[section].total++;
            if (deeniyathMoralAttendancePercentage !== -1) target[section].finished++;
        });
        deeniyathSections.forEach(sec => {
            deeniyath.odd[sec].pending = deeniyath.odd[sec].total - deeniyath.odd[sec].finished;
            deeniyath.even[sec].pending = deeniyath.even[sec].total - deeniyath.even[sec].finished;
        });

        // ---- SCLR REPORT ---- //
        const sclr = { odd: { finished: 0, total: 0, pending: 0 }, even: { finished: 0, total: 0, pending: 0 } };
        const uniqueRegisters = await ApplicationModel.distinct("registerNo", { academicYear, applicationStatus: 0 });

        for (const reg of uniqueRegisters) {
            const appsForReg = allApplications.filter(app => app.registerNo === reg);
            const oddSemester = appsForReg.some(app => isOddSemester(app.semester));
            const evenSemester = appsForReg.some(app => isEvenSemester(app.semester));

            if (oddSemester) sclr.odd.total++;
            if (evenSemester) sclr.even.total++;

            const hasScholarship = await StudentModel.exists({ registerNo: reg, governmentScholarship: 1 });
            if (hasScholarship) {
                if (oddSemester) sclr.odd.finished++;
                if (evenSemester) sclr.even.finished++;
            }
        }
        sclr.odd.pending = sclr.odd.total - sclr.odd.finished;
        sclr.even.pending = sclr.even.total - sclr.even.finished;

        // ---- TUTOR REPORT ---- //
        const tutor = { odd: { finished: 0, total: 0, pending: 0 }, even: { finished: 0, total: 0, pending: 0 } };
        const tutorFinishedRegisters = await ApplicationModel.distinct("registerNo", { academicYear, tutorVerification: 1 });

        for (const reg of uniqueRegisters) {
            const appsForReg = allApplications.filter(app => app.registerNo === reg);
            const oddSemester = appsForReg.some(app => isOddSemester(app.semester));
            const evenSemester = appsForReg.some(app => isEvenSemester(app.semester));

            const isTutorFinished = tutorFinishedRegisters.includes(reg);
            if (oddSemester) tutor.odd.total++;
            if (evenSemester) tutor.even.total++;
            if (isTutorFinished) {
                if (oddSemester) tutor.odd.finished++;
                if (evenSemester) tutor.even.finished++;
            }
        }
        tutor.odd.pending = tutor.odd.total - tutor.odd.finished;
        tutor.even.pending = tutor.even.total - tutor.even.finished;

        // ---- RETURN FINAL REPORT ---- //
        return res.json({ coe, attendance, deeniyath, sclr, tutor });

    } catch (err) {
        console.error("Error in fetchCounts for work progress report: ", err);
        res.status(500).json({ error: "Something went wrong", details: err.message });
    }
};


// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchCounts };