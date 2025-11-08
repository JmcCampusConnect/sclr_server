const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DonorModel = require('../../models/Donor');
const TransactionModel = require('../../models/Transaction');
const DepartmentModel = require('../../models/Department');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch departments

const fetchDepts = async (req, res) => {

    try {
        const depts = await DepartmentModel.find().sort({ createdAt: -1 });
        console.log(depts)
        return res.json({ depts });
    } catch (error) {
        console.error('Error fetching depts : ', error);
        return res.status(500).json({ message: 'Server error while fetching depts.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchDepts };