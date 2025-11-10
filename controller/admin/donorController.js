const DonorModel = require('../../models/Donor');
const TransactionModel = require('../../models/Transaction');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// -----------------------------------------------------------------------------
// Utility response helpers
// -----------------------------------------------------------------------------

const sendError = (res, status, message, error = null) => {
    if (error) console.error(message, error);
    return res.status(status).json({ success: false, message });
};

const sendSuccess = (res, status, message, data = {}) => {
    return res.status(status).json({ success: true, message, ...data });
};

// -----------------------------------------------------------------------------
// Fetch Donors
// -----------------------------------------------------------------------------

const fetchDonors = async (req, res) => {
    try {
        const donors = await DonorModel.find().sort({ createdAt: -1 });
        return sendSuccess(res, 200, 'Donors fetched successfully.', { donors });
    } catch (error) {
        return sendError(res, 500, 'Server error while fetching donors.', error);
    }
};

// -----------------------------------------------------------------------------
// Add Donor
// -----------------------------------------------------------------------------

const addDonor = async (req, res) => {

    try {

        const {
            donorName, donorType, mobileNo, emailId, panOrAadhaar, address,
            district, state, pinCode, generalAmt = 0, zakkathAmt = 0,
        } = req.body;
        // console.log(req.body)

        if (!donorName || !donorType) {
            return sendError(res, 400, 'Donor Name and Donor Type are required.');
        }

        const lastDonor = await DonorModel
            .findOne()
            .sort({ donorId: -1 })
            .collation({ locale: 'en_US', numericOrdering: true })
            .select('donorId');

        const newDonorId = lastDonor ? (parseInt(lastDonor.donorId, 10) + 1).toString() : '1';
        const academicYear = await currentAcademicYear();

        const donorData = {
            academicYear, donorId: newDonorId, donorName, mobileNo, donorType,
            emailId, panOrAadhaar, address, district, state, pinCode,
            generalAmt: Number(generalAmt),
            generalBal: Number(generalAmt),
            zakkathAmt: Number(zakkathAmt),
            zakkathBal: Number(zakkathAmt),
        };

        const newDonor = await DonorModel.create(donorData);

        const transactionData = {
            donorId: newDonorId, donorName, donorType,
            generalAmt: Number(generalAmt) || 0,
            zakkathAmt: Number(zakkathAmt) || 0
        };

        const transaction = await TransactionModel.create(transactionData);

        return sendSuccess(res, 201, 'Donor and initial transaction created successfully.', {
            donor: newDonor, transaction
        });

    } catch (error) {
        return sendError(res, 500, 'Server error while adding donor.', error);
    }
};

// -----------------------------------------------------------------------------
// Update Donor
// -----------------------------------------------------------------------------

const updateDonor = async (req, res) => {

    try {

        const { donorId } = req.body;

        if (!donorId) {
            return sendError(res, 400, 'Donor ID is required to update donor.');
        }

        const updatedDonor = await DonorModel.findOneAndUpdate(
            { donorId }, { $set: { ...req.body } }, { new: true }
        );

        if (!updatedDonor) { return sendError(res, 404, 'Donor not found.') }

        return sendSuccess(res, 200, 'Donor updated successfully.', { donor: updatedDonor });
    } catch (error) {
        return sendError(res, 500, 'Server error while updating donor.', error);
    }
};

// -----------------------------------------------------------------------------
// Delete Donor
// -----------------------------------------------------------------------------

const deleteDonor = async (req, res) => {

    try {

        const { donorId } = req.params;

        if (!donorId) {
            return sendError(res, 400, 'Donor ID is required to delete donor.');
        }

        const deleted = await DonorModel.findOneAndDelete({ donorId });

        if (!deleted) {
            return sendError(res, 404, 'Donor not found.');
        }

        return sendSuccess(res, 200, 'Donor deleted successfully.');
    } catch (error) {
        return sendError(res, 500, 'Server error while deleting donor.', error);
    }
};

// -----------------------------------------------------------------------------
// Add Amount for Donor
// -----------------------------------------------------------------------------

const addAmount = async (req, res) => {

    try {

        const { donorId, generalAmt = 0, zakkathAmt = 0 } = req.body;

        if (!donorId) {
            return sendError(res, 400, 'Donor ID is required to add amount.');
        }

        const donor = await DonorModel.findOne({ donorId });
        if (!donor) {
            return sendError(res, 404, 'Donor not found.');
        }

        const transaction = await TransactionModel.create(req.body);

        const updatedGeneralAmt = (donor.generalAmt || 0) + Number(generalAmt);
        const updatedGeneralBal = (donor.generalBal || 0) + Number(generalAmt);
        const updatedZakkathAmt = (donor.zakkathAmt || 0) + Number(zakkathAmt);
        const updatedZakkathBal = (donor.zakkathBal || 0) + Number(zakkathAmt);

        await DonorModel.updateOne(
            { donorId },
            {
                $set: {
                    generalAmt: updatedGeneralAmt,
                    generalBal: updatedGeneralBal,
                    zakkathAmt: updatedZakkathAmt,
                    zakkathBal: updatedZakkathBal
                }
            }
        );

        return sendSuccess(res, 200, 'Transaction recorded and donor balance updated.', {
            transaction
        });
    } catch (error) {
        return sendError(res, 500, 'Error while saving transaction.', error);
    }
};

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    fetchDonors,
    addDonor,
    updateDonor,
    deleteDonor,
    addAmount
};
