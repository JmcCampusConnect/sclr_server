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

const getStudentCoe = async (req, res) => {

    try {

        const condition = {
            $or: [
                { lastStudiedInstitutionPercentage: null },
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

const saveStuMark = async (req, res) => {

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

module.exports = { getStudentCoe, saveStuMark, staffPasswordChange }