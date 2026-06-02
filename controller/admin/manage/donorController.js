const XLSX = require('xlsx');
const DonorModel = require('../../../models/Donor');
const FundModel = require('../../../models/Fund');
const TransactionModel = require('../../../models/Transaction');
const DistributionModel = require('../../../models/Distribution');
const { currentAcademicYear } = require('../../../utils/commonFunctions');

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
// Helper function to get or create fund document for current year
// -----------------------------------------------------------------------------

const getOrCreateFundForYear = async (donorId, donorName, donorType, academicYear) => {

    let fund = await FundModel.findOne({ donorId, academicYear });

    if (!fund) {
        fund = await FundModel.create({
            academicYear,
            donorId,
            donorName,
            donorType,
            generalAmt: 0,
            zakkathAmt: 0,
            generalBal: 0,
            zakkathBal: 0
        });
    }

    return fund;
};

// -----------------------------------------------------------------------------
// Fetch Donors
// -----------------------------------------------------------------------------

const fetchDonors = async (req, res) => {

    try {

        const academicYear = await currentAcademicYear();
        const donors = await DonorModel.find().sort({ createdAt: -1 });
        const funds = await FundModel.find({ academicYear });

        const fundMap = new Map();
        funds.forEach(fund => {
            fundMap.set(fund.donorId, fund);
        });

        const combinedDonors = donors.map(donor => {
            const currentYearFund = fundMap.get(donor.donorId);

            return {
                // Donor static information
                _id: donor._id,
                donorId: donor.donorId,
                donorName: donor.donorName,
                donorType: donor.donorType,
                mobileNo: donor.mobileNo,
                emailId: donor.emailId,
                panOrAadhaar: donor.panOrAadhaar,
                address: donor.address,
                district: donor.district,
                state: donor.state,
                pinCode: donor.pinCode,
                createdAt: donor.createdAt,
                updatedAt: donor.updatedAt,
                // Current academic year fund data
                academicYear: academicYear,
                generalAmt: currentYearFund?.generalAmt || 0,
                zakkathAmt: currentYearFund?.zakkathAmt || 0,
                generalBal: currentYearFund?.generalBal || 0,
                zakkathBal: currentYearFund?.zakkathBal || 0,
                hasCurrentYearFund: !!currentYearFund
            };
        });

        return sendSuccess(res, 200, 'Donors fetched successfully.', {
            donors: combinedDonors, academicYear
        });
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

        // Generate new donor ID
        const lastDonor = await DonorModel
            .findOne()
            .sort({ donorId: -1 })
            .collation({ locale: 'en_US', numericOrdering: true })
            .select('donorId');

        const newDonorId = lastDonor ? (parseInt(lastDonor.donorId, 10) + 1).toString() : '1';
        const academicYear = await currentAcademicYear();

        // Create donor document 
        const donorData = {
            donorId: newDonorId,
            donorName,
            donorType,
            mobileNo,
            emailId,
            panOrAadhaar,
            address,
            district,
            state,
            pinCode
        };

        const newDonor = await DonorModel.create(donorData);

        // Create fund document for current year
        const fundData = {
            academicYear,
            donorId: newDonorId,
            donorName,
            donorType,
            generalAmt: Number(generalAmt),
            generalBal: Number(generalAmt),
            zakkathAmt: Number(zakkathAmt),
            zakkathBal: Number(zakkathAmt),
        };

        const newFund = await FundModel.create(fundData);

        // Create initial transaction
        const transactionData = {
            donorId: newDonorId,
            donorName,
            donorType,
            generalAmt: Number(generalAmt) || 0,
            zakkathAmt: Number(zakkathAmt) || 0,
            academicYear
        };

        const transaction = await TransactionModel.create(transactionData);

        return sendSuccess(
            res, 201, 'Donor and initial transaction created successfully.', {
            donor: { ...newDonor.toObject(), ...newFund.toObject() },
            transaction
        });

    } catch (error) {
        return sendError(res, 500, 'Server error while adding donor.', error);
    }
}

// -----------------------------------------------------------------------------
// Update Donor (updates static info across all years)
// -----------------------------------------------------------------------------

const updateDonor = async (req, res) => {

    try {

        const { donorId } = req.params;

        if (!donorId) { return sendError(res, 400, 'Donor ID is required') }

        const {
            donorName, donorType, mobileNo, emailId,
            panOrAadhaar, address, district, state, pinCode
        } = req.body;

        // Update donor static info
        const updatedDonor = await DonorModel.findOneAndUpdate(
            { donorId },
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

        // Update donor name and type in all fund documents
        await FundModel.updateMany(
            { donorId },
            { $set: { donorName, donorType } }
        );

        // Update donor name and type in distributions
        await DistributionModel.updateMany(
            { donorId },
            { $set: { donorName, donorType } }
        );

        // Update donor name and type in transactions
        await TransactionModel.updateMany(
            { donorId },
            { $set: { donorName, donorType } }
        );

        return sendSuccess(res, 200, 'Donor updated successfully and synced across records', { updatedDonor });

    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error while updating donor', error);
    }
};

// -----------------------------------------------------------------------------
// Delete Donor (deletes from current year only)
// -----------------------------------------------------------------------------

const deleteDonor = async (req, res) => {

    try {

        const { donorId } = req.params;

        if (!donorId) {
            return sendError(res, 400, 'Donor ID is required to delete donor.');
        }

        // Check if donor exists
        const donor = await DonorModel.findOne({ donorId });
        if (!donor) {
            return sendError(res, 404, 'Donor not found.');
        }

        // Delete all related records
        const [
            deletedFunds,
            deletedDonor,
            deletedTransactions,
            deletedDistributions
        ] = await Promise.all([
            FundModel.deleteMany({ donorId }),
            DonorModel.findOneAndDelete({ donorId }),
            TransactionModel.deleteMany({ donorId }),
            DistributionModel.deleteMany({ donorId })
        ]);

        return sendSuccess(res, 200, 'Donor and all associated records deleted successfully.', {
            donorId: donorId,
            donorName: donor.donorName,
            deletedFundsCount: deletedFunds.deletedCount,
            deletedTransactionsCount: deletedTransactions.deletedCount,
            deletedDistributionsCount: deletedDistributions.deletedCount
        });

    } catch (error) {
        console.error('Error deleting donor:', error);
        return sendError(res, 500, 'Server error while deleting donor.', error);
    }
};

//-----------------------------------------------------------------------------
// Get Transactions for Donor Amount Popup
// ----------------------------------------------------------------------------

const getTransaction = async (req, res) => {

    const { donorId } = req.params;
    const academicYear = await currentAcademicYear();

    if (!donorId) { return sendError(res, 400, 'Donor ID is required.') }
    try {
        const transactions = await TransactionModel.find({ donorId, academicYear });
        return sendSuccess(res, 200, 'Transaction Data is Here.', { transaction: transactions });
    } catch (error) {
        return sendError(res, 500, 'Error while fetching transactions.', error);
    }
};

// -----------------------------------------------------------------------------
// Add Amount for Donor
// -----------------------------------------------------------------------------

const addTransaction = async (req, res) => {

    try {

        let { donorId, generalAmt, zakkathAmt } = req.body;
        const academicYear = await currentAcademicYear();

        if (!donorId) {
            return sendError(res, 400, 'Donor ID is required to add amount.');
        }

        // Get donor static info
        const donor = await DonorModel.findOne({ donorId });
        if (!donor) {
            return sendError(res, 404, 'Donor not found.');
        }

        // Get or create fund for current year
        const fund = await getOrCreateFundForYear(donorId, donor.donorName, donor.donorType, academicYear);

        const generalAmount = Number(generalAmt ?? 0);
        const zakkathAmount = Number(zakkathAmt ?? 0);

        // Create transaction
        const transaction = await TransactionModel.create({
            donorId,
            donorName: donor.donorName,
            donorType: donor.donorType,
            academicYear,
            generalAmt: generalAmount,
            zakkathAmt: zakkathAmount
        });

        // Update fund balances
        const updatedGeneralAmt = (fund.generalAmt || 0) + generalAmount;
        const updatedGeneralBal = (fund.generalBal || 0) + generalAmount;
        const updatedZakkathAmt = (fund.zakkathAmt || 0) + zakkathAmount;
        const updatedZakkathBal = (fund.zakkathBal || 0) + zakkathAmount;

        await FundModel.updateOne(
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

        const fund = await FundModel.findOneAndUpdate(
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

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: "Fund record not found for this donor and year"
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
                donorId: fund.donorId,
                generalAmt: fund.generalAmt,
                generalBal: fund.generalBal,
                zakkathAmt: fund.zakkathAmt,
                zakkathBal: fund.zakkathBal
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

        const academicYear = await currentAcademicYear();

        // 1️⃣ Get existing transaction
        const existingTransaction = await TransactionModel
            .findById(_id)
            .select("generalAmt zakkathAmt donorId")
            .lean();

        if (!existingTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // 2️⃣ Get fund details
        const fund = await FundModel
            .findOne({ donorId: existingTransaction.donorId, academicYear })
            .select("generalAmt zakkathAmt generalBal zakkathBal")
            .lean();

        if (!fund) {
            return res.status(404).json({ message: "Fund record not found" });
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

        // 5️⃣ Update fund balances
        await FundModel.updateOne(
            { donorId: existingTransaction.donorId, academicYear },
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
}

// -----------------------------------------------------------------------------
// Bulk Upload Donors from Excel
// -----------------------------------------------------------------------------

const bulkUploadDonors = async (req, res) => {

    try {

        if (!req.file) {
            return sendError(res, 400, 'Please upload an Excel file.');
        }
        
        const academicYear = await currentAcademicYear();
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        if (!data || data.length === 0) {
            return sendError(res, 400, 'Excel file is empty.');
        }
        
        const results = {
            successful: [],
            failed: [],
            total: data.length
        };
        
        // Get the last donor ID for generating new IDs
        const lastDonor = await DonorModel
            .findOne()
            .sort({ donorId: -1 })
            .collation({ locale: 'en_US', numericOrdering: true })
            .select('donorId')
            .lean();
        
        let nextDonorId = lastDonor ? parseInt(lastDonor.donorId, 10) + 1 : 1;
        
        for (const row of data) {

            try {
                
                // Support both column name formats
                let donorId = row["Donor ID"] || row["donorId"];
                const donorName = row["Donor Name"] || row["donorName"];
                const donorType = row["Donor Type"] || row["donorType"];
                const generalAmt = Number(row["General Amount"] || row["generalAmt"] || 0);
                const zakkathAmt = Number(row["Zakkath Amount"] || row["zakkathAmt"] || 0);
                
                // Validate required fields
                if (!donorName || !donorType) {
                    results.failed.push({
                        row,
                        reason: 'Donor Name and Donor Type are required'
                    });
                    continue;
                }
                
                let existingDonor = null;
                let isNewDonor = false;
                
                // If donorId is provided, check if donor exists
                if (donorId) {
                    donorId = String(donorId);
                    existingDonor = await DonorModel.findOne({ donorId });
                }
                
                if (existingDonor) {
                    // Update existing donor's fund for current year
                    let fund = await FundModel.findOne({ donorId, academicYear });
                    
                    if (!fund) {
                        // Create fund for existing donor in current year
                        fund = await FundModel.create({
                            academicYear,
                            donorId,
                            donorName: existingDonor.donorName,
                            donorType: existingDonor.donorType,
                            generalAmt: 0,
                            generalBal: 0,
                            zakkathAmt: 0,
                            zakkathBal: 0
                        });
                    }
                    
                    // Add amount if provided
                    if (generalAmt > 0 || zakkathAmt > 0) {
                        const updatedGeneralAmt = (fund.generalAmt || 0) + generalAmt;
                        const updatedGeneralBal = (fund.generalBal || 0) + generalAmt;
                        const updatedZakkathAmt = (fund.zakkathAmt || 0) + zakkathAmt;
                        const updatedZakkathBal = (fund.zakkathBal || 0) + zakkathAmt;
                        
                        await FundModel.updateOne(
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
                        
                        // Create transaction record
                        await TransactionModel.create({
                            donorId,
                            donorName: existingDonor.donorName,
                            donorType: existingDonor.donorType,
                            academicYear,
                            generalAmt,
                            zakkathAmt
                        });
                    }
                    
                    results.successful.push({
                        donorId,
                        donorName: existingDonor.donorName,
                        status: 'updated',
                        generalAmt,
                        zakkathAmt
                    });
                } else {
                    // Create new donor
                    if (!donorId) {
                        donorId = String(nextDonorId);
                        nextDonorId++;
                    }
                    
                    // Check if donorId already exists (in case user provided ID that exists)
                    const donorExists = await DonorModel.findOne({ donorId });
                    if (donorExists) {
                        results.failed.push({
                            row,
                            reason: `Donor ID ${donorId} already exists`
                        });
                        continue;
                    }
                    
                    // Create donor document with additional fields from Excel
                    const donorData = {
                        donorId,
                        donorName,
                        donorType,
                        mobileNo: row["Mobile No"] || row["mobileNo"] || row["Mobile"] || "",
                        emailId: row["Email ID"] || row["emailId"] || row["Email"] || "",
                        panOrAadhaar: row["PAN / Aadhaar"] || row["panOrAadhaar"] || row["PAN"] || "",
                        address: row["Address"] || row["address"] || "",
                        district: row["District"] || row["district"] || "",
                        state: row["State"] || row["state"] || "",
                        pinCode: row["Pin Code"] || row["pinCode"] || row["Pincode"] || ""
                    };
                    
                    await DonorModel.create(donorData);
                    
                    // Create fund document for current year
                    const fundData = {
                        academicYear,
                        donorId,
                        donorName,
                        donorType,
                        generalAmt: generalAmt,
                        generalBal: generalAmt,
                        zakkathAmt: zakkathAmt,
                        zakkathBal: zakkathAmt
                    };
                    
                    await FundModel.create(fundData);
                    
                    // Create transaction if amount > 0
                    if (generalAmt > 0 || zakkathAmt > 0) {
                        await TransactionModel.create({
                            donorId,
                            donorName,
                            donorType,
                            academicYear,
                            generalAmt,
                            zakkathAmt
                        });
                    }
                    
                    results.successful.push({
                        donorId,
                        donorName,
                        status: 'created',
                        generalAmt,
                        zakkathAmt
                    });
                }
            } catch (rowError) {
                results.failed.push({
                    row, reason: rowError.message
                });
            }
        }
        
        return sendSuccess(res, 200, 'Bulk upload completed.', {
            summary: {
                total: results.total,
                successful: results.successful.length,
                failed: results.failed.length
            },
            details: results
        });
        
    } catch (error) {
        console.error('Error in bulk upload : ', error);
        return sendError(res, 500, 'Server error while bulk uploading donors.', error);
    }
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
    fetchDonors,
    addDonor,
    updateDonor,
    deleteDonor,
    addTransaction,
    getTransaction,
    deleteTransaction,
    editTransaction,
    bulkUploadDonors
};