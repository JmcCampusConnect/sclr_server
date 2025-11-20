const ApplicationModel = require('../models/Application');
const Staff = require('../models/Staff');
const StaffModel = require('../models/Staff');
const StudentModel = require('../models/Student');
const { currentAcademicYear } = require('../utils/commonFunctions');
const mongoose = require("mongoose");

// -------------------------------------------------------------------------------------------------------------------------------------------------

// Password Change for Staffs 

const staffPasswordChange = async (req, res) => {

    const { staffId, password } = req.body;

    try {
        const updatedStaff = await StaffModel.findOneAndUpdate(
            { staffId },
            { password: password },
            { new: true }
        )
        if (!updatedStaff) { return res.status(404).json({ error: 'Staff not found' }) }
        res.json(updatedStaff);
    } catch (err) {
        console.error('Error in updating password pf staff : ', err);
        res.status(500).json({ error: 'Failed to update password' });
    }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------

// Get student data for COE

const getStudentCOE = async (req, res) => {

    try {

        const academicYear = await currentAcademicYear();
        const filter = { academicYear, semester: { $nin: ["I"] }, semesterMarkPercentage: -1 };
        const StuData = await ApplicationModel.find(filter);
        const totalApplications = await ApplicationModel.countDocuments({ academicYear });
        const pending = StuData.length
        const completed = totalApplications - pending;

        return res.status(200).json({
            data: StuData, success: true,
            counts: { totalApplications, pending, completed },
        })

    } catch (err) {
        console.error("Error fetching student data for COE : ", err);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching students",
            error: err.message,
        })
    }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------

// Save student for COE

const saveStudentMark = async (req, res) => {

    try {

        const { changedStudents } = req.body;

        if (!changedStudents || !Array.isArray(changedStudents)) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        const updates = await Promise.all(
            changedStudents.map(async (student) => {
                const filter = student._id
                    ? { _id: student._id }
                    : { registerNo: student.registerNo };

                return ApplicationModel.findOneAndUpdate(
                    filter,
                    {
                        $set: {
                            semesterMarkPercentage: student.semesterMarkPercentage,
                            semesterArrear: student.semesterArrear,
                            semesterGrade: student.semesterGrade,
                        },
                    },
                    { new: true }
                );
            })
        );

        res.status(200).json({
            message: "Students updated successfully",
            updatedStudents: updates.filter((s) => s),
        });

    } catch (error) {
        console.error("Error updating students for COE : ", error);
        res.status(500).json({ message: "Server error", error });
    }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------

// Get student for class attendance ( JMCRAA, JMCRAS, JMCRAW )

const getStudentClassAttendance = async (req, res) => {

    const userId = req.body.userId;

    const condition = (userId === "JMCRAA" ? "Aided" : userId === "JMCRAS" ? "SFM" : "SFW");

    try {

        const ac_year = await currentAcademicYear();
        const staffData = await StaffModel.findOne({ staffId: userId });

        const totalCount = await ApplicationModel.countDocuments({
            category: condition, academicYear: ac_year,
        })

        const notMarkedCount = await ApplicationModel.countDocuments({
            category: condition, academicYear: ac_year,
            classAttendancePercentage: -1,
        });

        const markedCount = totalCount - notMarkedCount;

        const studentData = await ApplicationModel.find({
            category: condition, academicYear: ac_year,
            classAttendancePercentage: -1
        });

        res.status(200).json({
            staffData: staffData,
            studentData: studentData,
            counts: {
                totalApplications: totalCount,
                completed: markedCount,
                pending: notMarkedCount
            }
        })

    } catch (err) {
        console.error("Error getting staff data and counts for class attendacne : ", err);
        res.status(500).json({ message: "Error fetching attendance data" });
    }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------

// Save attendance for class attendance ( JMCRAA, JMCRAS, JMCRAW )

const saveClassAttendance = async (req, res) => {

    const { enteredData } = req.body;

    try {

        const ac_year = await currentAcademicYear();
        const updatePromises = enteredData.map(stu =>
            ApplicationModel.updateOne(
                { registerNo: stu.regNo, academicYear: ac_year, _id: stu._id },
                {
                    $set: {
                        classAttendancePercentage: stu.percentage,
                        classAttendanceRemark: stu.remark
                    }
                }
            ).exec()
        )
        await Promise.all(updatePromises);
        res.status(200).json({ message: "Attendance updated successfully" });
    } catch (error) {
        console.error('Error in saving class attendance : ', error);
        res.status(500).json({ message: "Error updating attendance" });
    }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------

// Get Students for Deeniyath Moral 

const getStudentDM = async (req, res) => {

    const { userId } = req.body;
    const ac_year = await currentAcademicYear();

    let condition = {};

    switch (userId) {

        case "JMCDM":
            condition = {
                religion: "Muslim",
                academicYear: ac_year,
                deeniyathMoralAttendancePercentage: -1,
                category: { $in: ["SFM", "Aided"] }
            };
            break;

        case "JMCDW":
            condition = {
                religion: "Muslim",
                academicYear: ac_year,
                deeniyathMoralAttendancePercentage: -1,
                category: "SFW"
            };
            break;

        case "JMCMM":
            condition = {
                religion: { $ne: "Muslim" },
                academicYear: ac_year,
                deeniyathMoralAttendancePercentage: -1,
                category: { $in: ["SFM", "Aided"] }
            };
            break;

        case "JMCMW":
            condition = {
                religion: { $ne: "Muslim" },
                academicYear: ac_year,
                deeniyathMoralAttendancePercentage: -1,
                category: "SFW"
            };
            break;

        default: condition = {};
    }

    try {

        const students = await ApplicationModel.find(condition);
        const StaffData = await StaffModel.find({ staffId: userId })

        const completedCount = await ApplicationModel.countDocuments({
            ...condition, deeniyathMoralAttendancePercentage: { $ne: -1 }
        });

        const pendingCount = await ApplicationModel.countDocuments({
            ...condition, deeniyathMoralAttendancePercentage: -1
        });

        const totalCount = completedCount + pendingCount;

        res.json({
            students: students,
            counts: {
                completed: completedCount,
                pending: pendingCount,
                totalApplications: totalCount
            },
            StaffData: StaffData
        });
    } catch (error) {
        console.error('Error in fetching students for DM : ', error)
        res.status(500).json({ error: error.message });
    }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------

// Save Students for Deeniyath Moral 

const saveDMattendance = async (req, res) => {

    const studentsData = req.body;
    const ac_year = await currentAcademicYear();

    try {

        const bulkOps = studentsData.map(student => ({
            updateOne: {
                filter: { registerNo: student.registerNo, academicYear: ac_year },
                update: {
                    $set: {
                        deeniyathMoralRemark: student.remark,
                        deeniyathMoralAttendancePercentage: student.percentage
                    }
                }
            }
        }))

        if (bulkOps.length > 0) {
            const result = await ApplicationModel.bulkWrite(bulkOps);
            res.json({ message: "Update successful", result });
        } else {
            res.status(400).json({ message: "No student data to update" });
        }
    } catch (error) {
        console.error("Error while updating deeniyath and moral : ", error);
        res.status(500).json({ message: "Error during update" });
    }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------

// Fetch students for TPS and PPS

const sclrStudents = async (req, res) => {

    try {

        let { page = 1, limit = 20, staffId } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        const academicYear = await currentAcademicYear();

        const registerNos = await ApplicationModel.distinct("registerNo", { academicYear });

        if (registerNos.length === 0) {
            return res.status(200).json({
                success: true, page, limit, pages: 0,
                data: [], total: 0, pending: 0, complete: 0
            });
        }

        let categories = [];
        if (staffId === "JMCTPS") categories = ["SFM", "Aided"];
        if (staffId === "JMCPPS") categories = ["SFW"];

        const categoryFilter =
            categories.length === 1 ? categories[0] : { $in: categories };

        const pendingFilter = {
            registerNo: { $in: registerNos },
            category: categoryFilter,
            governmentScholarship: 0
        };

        const completeFilter = {
            registerNo: { $in: registerNos },
            category: categoryFilter,
            governmentScholarship: { $in: [1, 2] }
        };

        const students = await StudentModel.find(pendingFilter, {
            registerNo: 1, name: 1, category: 1,
            governmentScholarship: 1, department: 1
        }).skip(skip).limit(limit).lean();

        const total = await StudentModel.countDocuments(pendingFilter);
        const pending = total;
        const complete = await StudentModel.countDocuments(completeFilter);

        return res.status(200).json({
            success: true, page, limit,
            pages: Math.ceil(total / limit),
            data: students, total,
            pending, complete
        });

    } catch (error) {
        console.error("Error fetching students for sclr staff:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch student data",
            error: error.message
        });
    }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------

// For data saving for TPS and PPS

const submitAppliedScholarship = async (req, res) => {

    try {

        const { staffId, appliedList } = req.body;

        if (!staffId) {
            return res.status(400).json({ success: false, message: "staffId is required" });
        }

        if (!appliedList || typeof appliedList !== "object") {
            return res.status(400).json({ success: false, message: "Invalid appliedList" });
        }

        const updateEntries = Object.entries(appliedList);

        if (updateEntries.length === 0) {
            return res.json({ success: true, message: "No changes to update" });
        }

        const updates = updateEntries.map(([id, value]) => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(id) },
                update: { $set: { governmentScholarship: value } }
            }
        }));

        await StudentModel.bulkWrite(updates);

        res.json({ success: true, message: "Updated successfully" });

    } catch (error) {
        console.error("Scholarship Update Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------

// For tutor verification fetch details

const tutorStudents = async (req, res) => {

    try {
        const { userId } = req.query;

        const staff = await StaffModel.findOne({ staffId: userId });

        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        const students = await StudentModel.find({
            department: staff.department,
            section: staff.section,
        });

        const academicYear = await currentAcademicYear();

        const studentRegNos = students.map(s => s.registerNumber);

        const applications = await ApplicationModel.find({
            yearOfAdmission: staff.batch,
            tutorVerification: 0,
            department: staff.department,
            category: staff.category,
            academicYear: academicYear,
            registerNumber: { $in: studentRegNos }
        });

        return res.status(200).json(applications);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------

// For tutor verification fetch details

const saveTutorVerification = async (req, res) => {

    try {

        const { id } = req.params;

        const { tutorVerificationDetails, tutorVerification } = req.body;

        if (!tutorVerificationDetails) {
            return res.status(400).json({ message: "Missing verification details" });
        }

        if (![0, 1, 2].includes(tutorVerification)) {
            return res.status(400).json({ message: "Invalid tutorVerification value" });
        }

        const updatedDoc = await ApplicationModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    tutorVerificationDetails: tutorVerificationDetails,
                    tutorVerification: tutorVerification
                }
            },
            { new: true }
        );

        if (!updatedDoc) {
            return res.status(404).json({ message: "Student application not found" });
        }

        return res.status(200).json({
            message: "Tutor verification updated successfully",
            data: updatedDoc
        });

    } catch (error) {
        console.error("Error updating tutor verification:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------

module.exports = {
    getStudentCOE, submitAppliedScholarship, saveStudentMark, saveTutorVerification,
    sclrStudents, staffPasswordChange, getStudentClassAttendance,
    saveClassAttendance, getStudentDM, tutorStudents, saveDMattendance
}