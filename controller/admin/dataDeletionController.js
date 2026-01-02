const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const DonorModel = require('../../models/Donor');
const DistributionModel = require('../../models/Distribution');
const TransactionModel = require('../../models/Transaction');
const StaffModel = require('../../models/Staff')

// ------------------------------------------------------------
// Fetch unique academic years
// ------------------------------------------------------------

const fetchUniqueValues = async (req, res) => {

    try {

        const [
            applicationYears, studentYears, distributionYears, donorYears,
            transactionYears,
        ] = await Promise.all([
            ApplicationModel.distinct('yearOfAdmission'),
            StudentModel.distinct('yearOfAdmission'),
            DistributionModel.distinct('academicYear'),
            DonorModel.distinct('academicYear'),
            TransactionModel.distinct('academicYear'),
        ]);

        res.json({
            success: true,
            data: {
                application: applicationYears.sort(),
                student: studentYears.sort(),
                distribution: distributionYears.sort(),
                donor: donorYears.sort(),
                transaction: transactionYears.sort(),
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unique values',
        });
    }
};

// ------------------------------------------------------------
// Delete data by academic year
// ------------------------------------------------------------

const deleteData = async (req, res) => {

    try {

        const { selections, adminPassword } = req.body;
        console.log(req.body)

        if (!adminPassword) {
            return res.status(400).json({
                success: false,
                message: 'Admin password required',
            });
        }

        const originalPassword = await StaffModel.findOne({ role: 1 })

        if (adminPassword !== originalPassword.password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin password',
            });
        }

        const summary = {};

        if (selections.application?.length) {
            const result = await ApplicationModel.deleteMany({
                yearOfAdmission: { $in: selections.application },
            });
            summary.application = result.deletedCount;
        }

        if (selections.student?.length) {
            const result = await StudentModel.deleteMany({
                yearOfAdmission: { $in: selections.student },
            });
            summary.student = result.deletedCount;
        }

        if (selections.distribution?.length) {
            const result = await DistributionModel.deleteMany({
                academicYear: { $in: selections.distribution },
            });
            summary.distribution = result.deletedCount;
        }

        if (selections.donor?.length) {
            const result = await DonorModel.deleteMany({
                academicYear: { $in: selections.donor },
            });
            summary.donor = result.deletedCount;
        }

        if (selections.transaction?.length) {
            const result = await TransactionModel.deleteMany({
                academicYear: { $in: selections.transaction },
            });
            summary.transaction = result.deletedCount;
        }

        res.json({
            success: true,
            message: 'Data deleted successfully',
            deletedSummary: summary,
        });
    } catch (err) {
        console.error('Error in deleting data : ', err.message)
        res.status(500).json({
            success: false,
            message: 'Deletion failed',
        });
    }
};

module.exports = { fetchUniqueValues, deleteData };