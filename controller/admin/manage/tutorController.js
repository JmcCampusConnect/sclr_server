const StaffModel = require('../../../models/Staff');
const DepartmentModel = require('../../../models/Department');

// -----------------------------------------------------------------------------
// Utility functions
// -----------------------------------------------------------------------------

const sendError = (res, status, message, error = null) => {
    if (error) console.error(message, error);
    return res.status(status).json({ success: false, message });
};

const sendSuccess = (res, status, message, data = {}) => {
    return res.status(status).json({ success: true, message, ...data });
};

// -----------------------------------------------------------------------------
// Fetch Tutors
// -----------------------------------------------------------------------------

const fetchTutors = async (req, res) => {
    try {
        const tutors = await StaffModel.find({ role: 2, category: { $ne: null } }).sort({ createdAt: -1 });
        return sendSuccess(res, 200, 'Tutors fetched successfully.', { tutors });
    } catch (error) {
        return sendError(res, 500, 'Server error while fetching tutors.', error);
    }
};

// -----------------------------------------------------------------------------
// Fetch Departments
// -----------------------------------------------------------------------------

const fetchDepartments = async (req, res) => {
    try {
        const departments = await DepartmentModel.find({}, { department: 1, departmentName: 1 })
            .sort({ department: 1 });
        // console.log(departments)
        return sendSuccess(res, 200, 'Departments fetched successfully.', { departments });
    } catch (error) {
        return sendError(res, 500, 'Server error while fetching departments.', error);
    }
};

// -----------------------------------------------------------------------------
// Add Tutor
// -----------------------------------------------------------------------------

const addTutor = async (req, res) => {

    try {

        const { staffId, staffName, batch, department, category, section } = req.body;

        if (!staffId || !staffName || !batch || !department || !category || !section) {
            return sendError(res, 400, 'All fields are required to add a tutor.');
        }

        const existingTutor = await StaffModel.findOne({ staffId });
        if (existingTutor) {
            return sendError(res, 400, 'Tutor with this Staff ID already exists.');
        }

        const newTutor = new StaffModel({
            staffId, staffName, batch, department,
            category, section, role: 2, password: 'jmc',
        });
        await newTutor.save();
        return sendSuccess(res, 201, 'Tutor added successfully.', { tutor: newTutor });
    } catch (error) {
        return sendError(res, 500, 'Server error while adding tutor.', error);
    }
}

// -----------------------------------------------------------------------------
// Update Tutor
// -----------------------------------------------------------------------------

const updateTutor = async (req, res) => {

    try {

        const { staffId, staffName, batch, department, category, section } = req.body;

        if (!staffId || !staffName || !batch || !department || !category || !section) {
            return sendError(res, 400, 'All fields are required to update a tutor.');
        }

        const updatedTutor = await StaffModel.findOneAndUpdate(
            { staffId },
            { staffName, batch, department, category, section },
            { new: true }
        );

        if (!updatedTutor) { return sendError(res, 404, 'Tutor not found.') }

        return sendSuccess(res, 200, 'Tutor updated successfully.', { tutor: updatedTutor });
    } catch (error) {
        return sendError(res, 500, 'Server error while updating tutor.', error);
    }
}

// -----------------------------------------------------------------------------
// Delete Tutor
// -----------------------------------------------------------------------------

const deleteTutor = async (req, res) => {

    try {

        const { staffId } = req.body;

        if (!staffId) {
            return sendError(res, 400, 'Staff ID is required to delete a tutor.');
        }

        const deletedTutor = await StaffModel.findOneAndDelete({ staffId });

        if (!deletedTutor) {
            return sendError(res, 404, 'Tutor not found.');
        }

        return sendSuccess(res, 200, 'Tutor deleted successfully.');
    } catch (error) {
        return sendError(res, 500, 'Server error while deleting tutor.', error);
    }
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    fetchTutors,
    fetchDepartments,
    addTutor,
    updateTutor,
    deleteTutor,
}