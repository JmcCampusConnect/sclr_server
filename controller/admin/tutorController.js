const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const StaffModel = require('../../models/Staff');
const DonorModel = require('../../models/Donor');
const {currentAcademicYear} = require('../../utils/commonFunctions');
const DepartmentModel = require('../../models/Department');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch donors

const fetchTutors = async (req, res) => {

    try {
        const tutors = await StaffModel.find({role: 3}).sort({createdAt: -1});
        return res.json({tutors});
    } catch (error) {
        console.error('Error fetching tutors : ', error);
        return res.status(500).json({message: 'Server error while fetching tutors.'});
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------
// fetch departments for tutor addition

const fetchDepartments = async (req, res) => {
    try {
        const departments = await DepartmentModel.find({}, {department: 1, departmentName: 1}).sort({department: 1});

        // console.log(departments)
        return res.json({departments});
    } catch (error) {
        console.error('Error fetching departments : ', error);
        return res.status(500).json({message: 'Server error while fetching departments.'});
    }

}


// ----------------------------------------------------------------------------------------------------------------
// Add new tutor

const addTutor = async (req, res) => {
    try {
        const {staffId, staffName, batch, department, category, section} = req.body;

        if (!staffId || !staffName || !batch || !department || !category || !section) {
            return res.status(401).json({message: 'All fields are required to add a tutor.'});
        }

        const newTutor = new StaffModel({
            staffId,
            staffName,
            batch,
            department,
            programCategory: category,
            section,
            role: 3, // Tutor role
            password: 123
        });
        const checkExisting = await StaffModel.findOne({staffId});
        if (checkExisting) {
            return res.status(400).json({message: 'Tutor with this Staff ID already exists.'});
        }

        await newTutor.save();
        return res.status(201).json({message: 'Tutor added successfully.', tutor: newTutor});
    } catch (error) {
        console.error('Error adding tutor : ', error);
        return res.status(500).json({message: 'Server error while adding tutor.'});
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------
// Update tutor details

const updateTutor = async (req, res) => {
    try {
        const {staffId, staffName, batch, department, programCategory, section} = req.body;
        if (!staffId || !staffName || !batch || !department || !programCategory || !section) {
            return res.status(401).json({message: 'All fields are required to update a tutor.'});
        }
        const tutor = await StaffModel.findOne({staffId});
        if (!tutor) {
            return res.status(404).json({message: 'Tutor not found.'});
        }
        tutor.staffName = staffName;
        tutor.batch = batch;
        tutor.department = department;
        tutor.programCategory = programCategory;
        tutor.section = section;

        await tutor.save();

        return res.status(200).json({message: 'Tutor updated successfully.', updatedTutor: tutor});
    } catch (error) {
        console.error('Error updating tutor : ', error);
        return res.status(500).json({message: 'Server error while updating tutor.'});
    }
}
module.exports = {fetchTutors, fetchDepartments, addTutor, updateTutor}