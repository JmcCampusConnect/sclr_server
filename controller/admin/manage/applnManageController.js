const StudentModel = require('../../../models/Student');
const ApplicationModel = require('../../../models/Application');
const DistributionModel = require('../../../models/Distribution');
const { currentAcademicYear } = require('../../../utils/commonFunctions');

// ----------------------------------------------------------------------------------------------------------------

// Fetch applications for Application Management

const fetchApplicationData = async (req, res) => {

    try {

        const academicYear = await currentAcademicYear();
        if (!academicYear) {
            return res.status(400).json({ message: "Academic year not found." });
        }

        const applications = await ApplicationModel.find({ academicYear }).select(`
            registerNo name department graduate yearOfAdmission semester category religion
            semesterMarkPercentage semesterGrade semesterArrear
            classAttendancePercentage classAttendanceRemark
            deeniyathMoralAttendancePercentage deeniyathMoralRemark jamathLetter`)
            .lean();

        for (const app of applications) {

            const student = await StudentModel.findOne({ registerNo: app.registerNo })
                .select("section mobileNo aadharNo")
                .lean();

            app.applicationId = app._id;
            delete app._id;

            if (student) {
                app.studentId = student._id;
                app.section = student.section ?? null;
                app.mobileNo = student.mobileNo ?? null;
                app.aadharNo = student.aadharNo ?? null;
            } else {
                app.studentId = null;
                app.section = null;
                app.mobileNo = null;
                app.aadharNo = null;
            }
        }

        return res.status(200).json({
            message: "Applications fetched successfully",
            count: applications.length, data: applications
        });

    } catch (error) {
        console.error('Error in fetching applications for appln manage : ', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ----------------------------------------------------------------------------------------------------------------

// For deleting an application

const deleteApplication = async (req, res) => {

    try {

        const { id } = req.body;

        if (!id) return res.status(400).json({ message: "ID is required" });

        const deleted = await ApplicationModel.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Application not found" });
        }

        return res.status(200).json({ message: "Application deleted successfully" });

    } catch (error) {
        console.error("Delete Error : ", error);
        return res.status(500).json({ message: "Server error while deleting" });
    }
}

// ----------------------------------------------------------------------------------------------------------------

// For updating an application

const updateApplication = async (req, res) => {

    try {

        const { oldRegNo, applicationId } = req.body;
        const formData = req.body;

        if (!oldRegNo || !applicationId) {
            return res.status(400).json({ message: "Missing required identifiers" });
        }

        const numericFields = [
            "classAttendancePercentage",
            "deeniyathMoralAttendancePercentage",
            "semesterMarkPercentage",
            "semesterArrear"
        ];

        numericFields.forEach(field => {
            if (formData[field] !== undefined && formData[field] !== "") {
                formData[field] = Number(formData[field]);
            }
        });

        /* ========= STUDENT (ONE) ========= */
        const studentFields = [
            "registerNo", "name", "department", "graduate",
            "yearOfAdmission", "category", "religion",
            "section", "mobileNo", "aadharNo"
        ];

        const studentUpdate = {};
        studentFields.forEach(f => {
            if (formData[f] !== undefined) studentUpdate[f] = formData[f];
        });

        await StudentModel.findOneAndUpdate(
            { registerNo: oldRegNo },
            { $set: studentUpdate },
            { runValidators: true }
        );

        /* ========= APPLICATION (MANY – BASIC DETAILS) ========= */
        const applicationBasicFields = [
            "registerNo", "name", "department", "graduate",
            "yearOfAdmission", "category", "religion"
        ];

        const applicationBasicUpdate = {};
        applicationBasicFields.forEach(f => {
            if (formData[f] !== undefined) applicationBasicUpdate[f] = formData[f];
        });

        await ApplicationModel.updateMany(
            { registerNo: oldRegNo },
            { $set: applicationBasicUpdate }
        );

        /* ========= APPLICATION (ONE – ACADEMIC DETAILS) ========= */
        const applicationAcademicFields = [
            "classAttendancePercentage", "classAttendanceRemark",
            "deeniyathMoralAttendancePercentage", "deeniyathMoralRemark",
            "semesterArrear", "semesterGrade",
            "semester", "semesterMarkPercentage"
        ];

        const applicationAcademicUpdate = {};
        applicationAcademicFields.forEach(f => {
            if (formData[f] !== undefined) applicationAcademicUpdate[f] = formData[f];
        });

        await ApplicationModel.findByIdAndUpdate(
            applicationId,
            { $set: applicationAcademicUpdate },
            { runValidators: true }
        );

        /* ========= DISTRIBUTION (MANY) ========= */
        const application = await ApplicationModel.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const distributionFields = [
            "registerNo", "name", "department",
            "category", "graduate", "semester"
        ];

        const distributionUpdate = {};
        distributionFields.forEach(f => {
            if (formData[f] !== undefined) distributionUpdate[f] = formData[f];
        });

        await DistributionModel.updateMany(
            {
                registerNo: oldRegNo,
                academicYear: application.academicYear,
                createdAt: { $gte: application.createdAt }
            },
            { $set: distributionUpdate }
        );

        /* ========= FILE UPDATE (JAMATH LETTER) ========= */
        if (req.file) {
            const filePath = `zamathfiles\\${req.file.filename}`;
            await ApplicationModel.findByIdAndUpdate(
                applicationId,
                { $set: { jamathLetter: filePath } }
            );
        }

        return res.status(200).json({
            message: "Student, Application & Distribution updated successfully"
        });

    } catch (error) {
        console.error("Update Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Duplicate value error",
                field: Object.keys(error.keyValue)[0]
            });
        }

        return res.status(500).json({
            message: "Server error while updating data"
        });
    }
};

// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchApplicationData, deleteApplication, updateApplication };