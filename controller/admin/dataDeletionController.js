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
            appYears, stuYears, distYears, donYears, transYears, hasAssignedStaff
        ] = await Promise.all([
            ApplicationModel.distinct('yearOfAdmission'),
            StudentModel.distinct('yearOfAdmission'),
            DistributionModel.distinct('academicYear'),
            DonorModel.distinct('academicYear'),
            TransactionModel.distinct('academicYear'),
            StaffModel.findOne({
                role: { $ne: 1 },
                batch: { $ne: null, $exists: true },
                department: { $ne: null, $exists: true }
            })
        ]);

        res.json({
            success: true, data: {
                application: appYears.sort(),
                student: stuYears.sort(),
                distribution: distYears.sort(),
                donor: donYears.sort(),
                transaction: transYears.sort(),
                staff: hasAssignedStaff ? ['Purge All Staff Assignments'] : [],
            },
        });
    } catch (err) {
        console.error('Error in fetching unique values for data deletion : ', err.message0)
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ------------------------------------------------------------
// Delete data by academic year
// ------------------------------------------------------------

const deleteData = async (req, res) => {

    try {

        const { selections, adminPassword } = req.body;
        const summary = {};

        // 1. Password Verification
        const adminUser = await StaffModel.findOne({ role: 1 });
        if (!adminUser || adminPassword !== adminUser.password) {
            return res.status(401).json({ success: false, message: 'Invalid admin password' });
        }

        // 2. Staff Deletion Logic
        if (selections.staff?.includes('Purge All Staff Assignments')) {
            const result = await StaffModel.deleteMany({
                role: { $ne: 1 },
                $and: [
                    { batch: { $ne: null, $exists: true } },
                    { department: { $ne: null, $exists: true } },
                    { category: { $ne: null, $exists: true } },
                    { section: { $ne: null, $exists: true } }
                ]
            });
            summary.staff = result.deletedCount;
        }

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
        res.status(500).json({ success: false, message: 'Deletion failed' });
    }
};

module.exports = { fetchUniqueValues, deleteData };