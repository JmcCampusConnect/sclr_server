const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DonorModel = require('../../models/Donor');
const TransactionModel = require('../../models/Transaction');
const DepartmentModel = require('../../models/Department');
const {currentAcademicYear} = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch departments

const fetchDepts = async (req, res) => {

    try {
        const depts = await DepartmentModel.find().sort({createdAt: -1});
        // console.log(depts)
        return res.json({depts});
    } catch (error) {
        console.error('Error fetching depts : ', error);
        return res.status(500).json({message: 'Server error while fetching depts.'});
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------
// Add Department 
const addDepartment = async (req, res) => {
    try {
        const {department, departmentName} = req.body;

        if (!department || !departmentName) {
            return res.status(400).json({
                success: false,
                message: "Department name and code are required."
            });
        }

        const existingDept = await DepartmentModel.findOne({
            $or: [
                {department: department},
                {departmentName: departmentName}
            ]
        });

        if (existingDept) {
            return res.status(409).json({
                success: false,
                message: "Department already exists."
            });
        }

        const newDepartment = await DepartmentModel.create(req.body);

        return res.status(200).json({
            success: true,
            message: "Department added successfully.",
            data: newDepartment
        });

    } catch (error) {
        console.error("Error while adding department:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------
// Edit  Department 


const updateDepartment = async (req, res) => {
    // console.log("dept", req.body)
    try {
        const checkExist = await DepartmentModel.findOne({departmentName: req.body.departmentName});
        if (checkExist) {
            return res.status(409).json({
                success: false,
                message: "Department Name already exists."
            });
        }
        const UpdateDept = await DepartmentModel.updateOne(
            {department: req.body.department},
            {$set: {departmentName: req.body.departmentName}}
        )
        res.status(200).json({
            success: true,
            message: "Department Updated.",
            data: UpdateDept
        })
    } catch (e) {

    }
}


// ---------------------------------------------------------------------------------------------------------------------------------------------
// Delete   Department 

const deleteDepartment = async (req, res) => {
    try {
        const {department} = req.body;

        const deleteDept = await DepartmentModel.deleteOne({department: department});

        if (deleteDept.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting department:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
};


module.exports = {fetchDepts, addDepartment, updateDepartment, deleteDepartment};