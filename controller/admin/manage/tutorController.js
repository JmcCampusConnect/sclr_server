const StaffModel = require('../../../models/Staff');
const DepartmentModel = require('../../../models/Department');
const XLSX = require('xlsx');

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

        const { staffId } = req.params;
        const { staffName, batch, department, category, section, password } = req.body;
        if (!staffId || !staffName || !batch || !department || !category || !section) {
            return sendError(res, 400, 'All fields are required to update a tutor.');
        }
        const updatedTutor = await StaffModel.findOneAndUpdate(
            { staffId },
            {
                staffName,
                batch,
                department,
                category,
                section,
                password,
            },
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
        const { staffId } = req.params;
        if (!staffId) { return sendError(res, 400, 'Staff ID is required to delete a tutor.') }
        const deletedTutor = await StaffModel.findOneAndDelete({ staffId });
        if (!deletedTutor) { return sendError(res, 404, 'Tutor not found.') }
        return sendSuccess(res, 200, 'Tutor deleted successfully.');
    } catch (error) {
        return sendError(res, 500, 'Server error while deleting tutor.', error);
    }
}

// -----------------------------------------------------------------------------
// Bulk Upload Tutors from Excel
// -----------------------------------------------------------------------------

const bulkUploadTutors = async (req, res) => {

    try {

        if (!req.file) {
            return sendError(res, 400, 'No file uploaded. Please upload an Excel file.');
        }

        // Read the Excel file
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (!data || data.length === 0) {
            return sendError(res, 400, 'Excel file is empty. Please provide valid data.');
        }

        // STEP 1: Set the four fields to null ONLY for records that already have these fields
        await StaffModel.updateMany(
            {
                $or: [
                    { batch: { $exists: true } },
                    { department: { $exists: true } },
                    { category: { $exists: true } },
                    { section: { $exists: true } }
                ]
            },
            {
                $set: {
                    batch: null,
                    department: null,
                    category: null,
                    section: null
                }
            }
        );

        const results = {
            inserted: 0,
            updated: 0,
            errors: []
        };

        for (let index = 0; index < data.length; index++) {

            const row = data[index];

            try {

                const staffId = row.staffId || row.StaffId || row.STAFFID || row.staff_id || row.Staff_ID;
                const staffName = row.staffName || row.StaffName || row.STAFFNAME || row.staff_name || row.Staff_Name;

                const getNullIfEmpty = (value) => {
                    if (value === undefined || value === null || value === '' || value === 'null' || value === 'NULL') {
                        return null;
                    }
                    return String(value);
                };

                const batch = getNullIfEmpty(row.batch || row.Batch || row.BATCH);
                const department = getNullIfEmpty(row.department || row.Department || row.DEPARTMENT);
                const category = getNullIfEmpty(row.category || row.Category || row.CATEGORY);
                const section = getNullIfEmpty(row.section || row.Section || row.SECTION);

                if (!staffId) {
                    results.errors.push({
                        row: index + 1,
                        error: 'Staff ID is required',
                        data: row
                    });
                    continue;
                }

                if (!staffName) {
                    results.errors.push({
                        row: index + 1,
                        error: 'Staff Name is required',
                        data: row
                    });
                    continue;
                }

                // Check if tutor exists
                const existingTutor = await StaffModel.findOne({ staffId });

                if (existingTutor) {
                    // UPDATE: Update with values from Excel 
                    existingTutor.batch = batch;
                    existingTutor.department = department;
                    existingTutor.category = category;
                    existingTutor.section = section;
                    existingTutor.staffName = staffName;

                    await existingTutor.save();
                    results.updated++;
                } else {
                    // INSERT: Create new tutor with values from Excel
                    const newTutor = new StaffModel({
                        staffId: String(staffId),
                        staffName: String(staffName),
                        batch: batch,
                        department: department,
                        category: category,
                        section: section,
                        role: 2,
                        password: 'jmc'
                    });
                    await newTutor.save();
                    results.inserted++;
                }
            } catch (rowError) {
                results.errors.push({
                    row: index + 1,
                    error: rowError.message,
                    data: row
                });
            }
        }

        return sendSuccess(res, 200, 'Bulk upload completed successfully.', {
            summary: {
                totalRows: data.length,
                inserted: results.inserted,
                updated: results.updated,
                errors: results.errors.length
            },
            errors: results.errors
        });

    } catch (error) {
        console.error('Bulk upload error:', error);
        return sendError(res, 500, 'Server error while processing bulk upload.', error);
    }
};

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    fetchTutors,
    fetchDepartments,
    addTutor,
    updateTutor,
    deleteTutor,
    bulkUploadTutors,
};