const ApplicationModel = require('../models/Application');
const StaffModel = require('../models/Staff');

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

        const condition = {
            $or: [
                { lastStudiedInstitutionPercentage: -1 },
                { lastStudiedInstitutionPercentage: { $exists: false } }
            ]
        }

        const StuData = await ApplicationModel.find({ $and: [condition, { semesterMarkPercentage: -1 }] })

        const totalApplications = await ApplicationModel.countDocuments(condition);

        const pending = await ApplicationModel.countDocuments({
            ...condition,
            semesterMarkPercentage: -1
        })

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
                return ApplicationModel.findOneAndUpdate(
                    { registerNo: student.registerNo },
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
            updatedStudents: updates,
        })

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
            programCategory: condition, academicYear: ac_year,
        })

        const notMarkedCount = await ApplicationModel.countDocuments({
            programCategory: condition,
            academicYear: ac_year,
            classAttendancePercentage: -1,
        });

        const markedCount = totalCount - notMarkedCount;

        const studentData = await ApplicationModel.find({
            programCategory: condition,
            academicYear: ac_year,
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
        console.log("Error getting staff data and counts for class attendacne : ", err);
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
                { registerNo: stu.regNo, academicYear: ac_year },
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

module.exports = { getStudentCOE, saveStudentMark, staffPasswordChange, getStudentClassAttendance, saveClassAttendance }