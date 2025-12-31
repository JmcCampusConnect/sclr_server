const DepartmentModel = require('../../../models/Department');

// -----------------------------------------------------------------------------
// Utility Response Helpers
// -----------------------------------------------------------------------------

const sendError = (res, status, message, error = null) => {
    if (error) console.error(message, error);
    return res.status(status).json({ success: false, message });
};

const sendSuccess = (res, status, message, data = {}) => {
    return res.status(status).json({ success: true, message, ...data });
};

// -----------------------------------------------------------------------------
// Fetch All Departments
// -----------------------------------------------------------------------------

const fetchDepts = async (req, res) => {
    try {
        const depts = await DepartmentModel.find().sort({ createdAt: -1 });
        return sendSuccess(res, 200, 'Departments fetched successfully.', { depts });
    } catch (error) {
        return sendError(res, 500, 'Server error while fetching departments.', error);
    }
};

// -----------------------------------------------------------------------------
// Add Department
// -----------------------------------------------------------------------------

const addDepartment = async (req, res) => {

    try {

        const { department, departmentName } = req.body;

        if (!department || !departmentName) {
            return sendError(res, 400, 'Department code and name are required.');
        }

        const existingDept = await DepartmentModel.findOne({
            $or: [{ department }, { departmentName }],
        });

        if (existingDept) {
            return sendError(res, 409, 'Department already exists.');
        }

        const newDepartment = await DepartmentModel.create({ department, departmentName });
        return sendSuccess(res, 201, 'Department added successfully.', { department: newDepartment });

    } catch (error) {
        return sendError(res, 500, 'Error while adding department.', error);
    }
};

// -----------------------------------------------------------------------------
// Update Department
// -----------------------------------------------------------------------------

const updateDepartment = async (req, res) => {

    try {

        const { department, departmentName } = req.body;

        if (!department || !departmentName) {
            return sendError(res, 400, 'Department code and new name are required.');
        }

        const existingDept = await DepartmentModel.findOne({
            departmentName, department: { $ne: department },
        });

        if (existingDept) {
            return sendError(res, 409, 'Another department with this name already exists.');
        }

        const updatedDept = await DepartmentModel.findOneAndUpdate(
            { department }, { $set: { departmentName } }, { new: true }
        );

        if (!updatedDept) {
            return sendError(res, 404, 'Department not found.');
        }

        return sendSuccess(res, 200, 'Department updated successfully.', { department: updatedDept });
    } catch (error) {
        return sendError(res, 500, 'Error while updating department.', error);
    }
};

// -----------------------------------------------------------------------------
// Delete Department
// -----------------------------------------------------------------------------

const deleteDepartment = async (req, res) => {

    try {

        const { department } = req.body;

        if (!department) {
            return sendError(res, 400, 'Department code is required to delete.');
        }

        const deletedDept = await DepartmentModel.findOneAndDelete({ department });

        if (!deletedDept) {
            return sendError(res, 404, 'Department not found.');
        }

        return sendSuccess(res, 200, 'Department deleted successfully.');
    } catch (error) {
        return sendError(res, 500, 'Error while deleting department.', error);
    }
};

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    fetchDepts,
    addDepartment,
    updateDepartment,
    deleteDepartment,
};
