const StudentModel = require('../../../models/Student');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch students with pagination and filters

const fetchStudentData = async (req, res) => {

    try {
        
        const { 
            page = 1, 
            limit = 100, 
            search = '', 
            category = 'All', 
            department = 'All', 
            semBased = 'All' 
        } = req.query;

        // Build filter object
        const filter = {};
        if (category !== 'All') filter.category = category;
        if (department !== 'All') filter.department = department;
        if (semBased !== 'All') filter.isSemBased = parseInt(semBased);

        // Add search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { registerNo: { $regex: search, $options: 'i' } }
            ];
        }

        // Get total count
        const total = await StudentModel.countDocuments(filter);

        // Get paginated results
        const students = await StudentModel.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        return res.json({
            students,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching students.' 
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Update student 

const updateStudent = async (req, res) => {

    const { registerNo } = req.params;
    const updateData = req.body;

    try {

        const { _id, __v, createdAt, updatedAt, ...cleanData } = updateData;

        const result = await StudentModel.findOneAndUpdate(
            { registerNo },
            { $set: cleanData },
            { new: true, runValidators: true }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student updated successfully',
            student: result
        });
    } catch (err) {
        console.error('Error updating student:', err);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error', errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Quick save for specific fields (password, semBased, mobileNo, aadharNo)

const quickSaveStudent = async (req, res) => {

    const { registerNo } = req.params;
    const { password, isSemBased, mobileNo, aadharNo } = req.body;

    try {

        const result = await StudentModel.findOneAndUpdate(
            { registerNo },
            { 
                $set: { 
                    password, 
                    isSemBased, 
                    mobileNo, 
                    aadharNo 
                } 
            },
            { new: true, runValidators: true }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student updated successfully'
        });
    } catch (err) {
        console.error('Error in quick save:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchStudentData, updateStudent, quickSaveStudent };