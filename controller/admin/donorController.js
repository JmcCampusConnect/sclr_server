const DonorModel = require('../../models/Donor');
const TransactionModel = require('../../models/Transaction');
const DistributionModel = require('../../models/Distribution');
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
        const academicYear = await currentAcademicYear();
        const donors = await DonorModel.find({ academicYear }).sort({ createdAt: -1 });
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
            zakkathAmt: Number(zakkathAmt) || 0,
            academicYear
        };

        const transaction = await TransactionModel.create(transactionData);

        return sendSuccess(
            res, 201, 'Donor and initial transaction created successfully.', {
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

        const { donorId } = req.params;

        if (!donorId) { return sendError(res, 400, 'Donor ID is required') }

        const academicYear = await currentAcademicYear();

        const {
            donorName, donorType, mobileNo, emailId,
            panOrAadhaar, address, district, state, pinCode
        } = req.body;

        const updatedDonor = await DonorModel.findOneAndUpdate(
            { donorId, academicYear },
            {
                $set: {
                    donorName, donorType, mobileNo, emailId,
                    panOrAadhaar, address, district, state, pinCode
                }
            },
            { new: true }
        );

        if (!updatedDonor) {
            return sendError(res, 404, 'Donor not found');
        }

        await DistributionModel.updateMany(
            { donorId, academicYear },
            { $set: { donorName, donorType } }
        );

        await TransactionModel.updateMany(
            { donorId, academicYear },
            { $set: { donorName, donorType } }
        );

        return sendSuccess(res, 200, 'Donor updated successfully and synced across records', { updatedDonor });

    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error while updating donor', error);
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

        let { donorId, generalAmt, zakkathAmt } = req.body;

        const academicYear = await currentAcademicYear()

        if (!donorId) {
            return sendError(res, 400, 'Donor ID is required to add amount.');
        }

        const donor = await DonorModel.findOne({ donorId, academicYear });
        if (!donor) {
            return sendError(res, 404, 'Donor not found.');
        }

        const generalAmount = Number(generalAmt ?? 0);
        const zakkathAmount = Number(zakkathAmt ?? 0);

        const transaction = await TransactionModel.create({
            ...req.body, academicYear,
            generalAmt: generalAmount,
            zakkathAmt: zakkathAmount
        });

        const updatedGeneralAmt = (donor.generalAmt || 0) + generalAmount;
        const updatedGeneralBal = (donor.generalBal || 0) + generalAmount;
        const updatedZakkathAmt = (donor.zakkathAmt || 0) + zakkathAmount;
        const updatedZakkathBal = (donor.zakkathBal || 0) + zakkathAmount;

        await DonorModel.updateOne(
            { donorId, academicYear },
            {
                $set: {
                    generalAmt: updatedGeneralAmt,
                    generalBal: updatedGeneralBal,
                    zakkathAmt: updatedZakkathAmt,
                    zakkathBal: updatedZakkathBal
                }
            }
        );

        return sendSuccess(res, 200, 'Transaction recorded and donor balance updated.', { transaction });

    } catch (error) {
        return sendError(res, 500, 'Error while saving transaction.', error);
    }
}

//-----------------------------------------------------------------------------
// Get Transactions for Donor Amount Popup
// ----------------------------------------------------------------------------

const getTransaction = async (req, res) => {

    const { donorId } = req.params;
    const academicYear = await currentAcademicYear();

    if (!donorId) {
        return sendError(res, 400, 'Donor ID is required to delete donor.');
    }
    try {
        const transaction = await TransactionModel.find({ donorId, academicYear })
        return sendSuccess(res, 200, 'Transaction Data is Here.', { transaction });
    } catch (error) {
        return sendError(res, 500, 'Error while saving transaction.', error);
    }

}

//-----------------------------------------------------------------------------
// Delete Transactions
// ----------------------------------------------------------------------------

const deleteTransaction = async (req, res) => {

    try {

        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Transaction ID is required"
            });
        }

        const transaction = await TransactionModel.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        const { donorId, generalAmt = 0, zakkathAmt = 0, academicYear } = transaction;

        const donor = await DonorModel.findOneAndUpdate(
            { donorId: String(donorId), academicYear },
            {
                $inc: {
                    generalAmt: -generalAmt,
                    generalBal: -generalAmt,
                    zakkathAmt: -zakkathAmt,
                    zakkathBal: -zakkathAmt
                }
            },
            { new: true }
        );

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: "Donor not found"
            });
        }

        await TransactionModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Transaction deleted successfully",
            deletedTransaction: {
                _id: id, donorId, generalAmt, zakkathAmt
            },
            updatedDonor: {
                donorId: donor.donorId,
                generalAmt: donor.generalAmt,
                generalBal: donor.generalBal,
                zakkathAmt: donor.zakkathAmt,
                zakkathBal: donor.zakkathBal
            }
        });

    } catch (error) {
        console.error("Error deleting transaction:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// -----------------------------------------------------------------------------
// Edit Transactions
// -----------------------------------------------------------------------------

const editTransaction = async (req, res) => {

    const { _id, generalAmt, zakkathAmt } = req.body;

    try {

        // 1️⃣ Get existing transaction
        const existingTransaction = await TransactionModel
            .findById(_id)
            .select("generalAmt zakkathAmt donorId")
            .lean();

        if (!existingTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // 2️⃣ Get donor details
        const donor = await DonorModel
            .findOne({ donorId: existingTransaction.donorId })
            .select("generalAmt zakkathAmt generalBal zakkathBal")
            .lean();

        if (!donor) {
            return res.status(404).json({ message: "Donor not found" });
        }

        // 3️⃣ Calculate differences (NEW - OLD)
        const generalDiff = generalAmt - existingTransaction.generalAmt;
        const zakkathDiff = zakkathAmt - existingTransaction.zakkathAmt;

        // 4️⃣ Update transaction (direct set)
        await TransactionModel.updateOne(
            { _id },
            {
                $set: {
                    generalAmt,
                    zakkathAmt
                }
            }
        );

        // 5️⃣ Update donor balances
        await DonorModel.updateOne(
            { donorId: existingTransaction.donorId },
            {
                $inc: {
                    generalAmt: generalDiff,
                    zakkathAmt: zakkathDiff,
                    generalBal: generalDiff,
                    zakkathBal: zakkathDiff
                }
            }
        );

        return res.status(200).json({ message: "Transaction updated successfully" });

    } catch (error) {
        console.error("Edit Transaction Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
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
    addAmount,
    getTransaction,
    deleteTransaction,
    editTransaction
};
