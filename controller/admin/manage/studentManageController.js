const StudentModel = require('../../../models/Student');
const ApplicationModel = require('../../../models/Application');
const DistributionModel = require('../../../models/Distribution');
const { currentAcademicYear } = require('../../../utils/commonFunctions');

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
        
        const oldRegisterNo = registerNo;
        const newRegisterNo = cleanData.registerNo;
        const isRegisterNoChanged = oldRegisterNo !== newRegisterNo;

        const studentResult = await StudentModel.findOneAndUpdate(
            { registerNo: oldRegisterNo },
            { $set: cleanData },
            { new: true, runValidators: true }
        );

        if (!studentResult) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // 2. Prepare update operations
        const operations = [];

        // Applications update
        const appUpdate = {
            filter: { registerNo: isRegisterNoChanged ? oldRegisterNo : newRegisterNo },
            update: {
                $set: {
                    name: cleanData.name,
                    department: cleanData.department,
                    category: cleanData.category,
                    religion: cleanData.religion,
                    yearOfAdmission: cleanData.yearOfAdmission,
                    graduate: cleanData.graduate
                }
            }
        };
        if (isRegisterNoChanged) {
            appUpdate.update.$set.registerNo = newRegisterNo;
        }
        operations.push(
            ApplicationModel.updateMany(appUpdate.filter, appUpdate.update)
        );

        // Distributions update
        const distUpdate = {
            filter: { registerNo: isRegisterNoChanged ? oldRegisterNo : newRegisterNo },
            update: {
                $set: {
                    name: cleanData.name,
                    department: cleanData.department,
                    category: cleanData.category,
                    graduate: cleanData.graduate
                }
            }
        };
        if (isRegisterNoChanged) {
            distUpdate.update.$set.registerNo = newRegisterNo;
        }
        operations.push(
            DistributionModel.updateMany(distUpdate.filter, distUpdate.update)
        );

        // Execute all updates
        const results = await Promise.allSettled(operations);

        // Check if any update failed
        const failedUpdates = results.filter(r => r.status === 'rejected');
        if (failedUpdates.length > 0) {
            console.error('Some updates failed:', failedUpdates);
            return res.status(207).json({
                success: true,
                partial: true,
                message: `Student updated but ${failedUpdates.length} related updates failed`,
                errors: failedUpdates.map(f => f.reason?.message || 'Unknown error'),
                student: studentResult
            });
        }

        res.json({
            success: true,
            message: isRegisterNoChanged 
                ? 'Student and related records updated successfully' 
                : 'Student updated successfully',
            student: studentResult,
            updatedCounts: {
                applications: results[0]?.value?.modifiedCount || 0,
                distributions: results[1]?.value?.modifiedCount || 0
            }
        });

    } catch (err) {
        console.error('Error updating student:', err);
        
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Register number already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: err.message || 'Internal server error'
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