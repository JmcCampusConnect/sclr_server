const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const StaffModel = require('../../models/Staff');
const DonorModel = require('../../models/Donor');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch donors

const fetchStaffs = async (req, res) => {

    try {
        const staffs = await StaffModel.find({
            role: 2,
            category: { $in: [null, undefined] }
        }).sort({ createdAt: -1 });

        return res.json({ staffs });
    } catch (error) {
        console.error('Error fetching staffs : ', error);
        return res.status(500).json({ message: 'Server error while fetching staffs.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

const updateStaff = async (req, res) => {

    const { staffId, staffName, password } = req.body;

    try {

        const updated = await StaffModel.findOneAndUpdate(
            { staffId },
            { staffName, password },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Staff not found" });
        }

        res.status(200).json({
            message: "Staff updated successfully",
            staff: updated
        });

    } catch (error) {
        console.error('Error updating staff : ', error);
        res.status(500).json({
            message: "Error updating staff",
            error: error.message
        })
    }
}

// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchStaffs, updateStaff }