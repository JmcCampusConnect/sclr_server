const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DonorModel = require('../../models/Donor');
const TransactionModel = require('../../models/Transaction');
const {currentAcademicYear} = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch donors

const fetchDonors = async (req, res) => {

    try {
        const donors = await DonorModel.find().sort({createdAt: -1});
        return res.json({donors});
    } catch (error) {
        console.error('Error fetching donors : ', error);
        return res.status(500).json({message: 'Server error while fetching donors.'});
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Add Donor

const addDonor = async (req, res) => {

    try {

        const lastDonor = await DonorModel
            .findOne()
            .sort({donorId: -1})
            .collation({locale: "en_US", numericOrdering: true})
            .select('donorId');

        const newDonorId = lastDonor ? parseInt(lastDonor.donorId) + 1 : 1;


        const academicYear = await currentAcademicYear()

        // console.log("aca", academicYear)
        const donorData = {
            academicYear: academicYear,
            donorId: newDonorId.toString(),
            donorName: req.body.donorName,
            mobileNo: req.body.mobileNo,
            emailId: req.body.emailId,
            // academicYear: req.body.academicYear,
            panOrAadhaar: req.body.panOrAadhaar,
            address: req.body.address,
            district: req.body.district,
            state: req.body.state,
            pinCode: req.body.pinCode,
            donorType: req.body.donorType,
            donorDate: req.body.donorDate,
            generalAmt: req.body.generalAmt,
            generalBal: req.body.generalAmt,
            zakkathAmt: req.body.zakkathAmt,
            zakkathBal: req.body.zakkathAmt,
            panNo: req.body.panNo,
        };
        // console.log('first', donorData)
        const newDonor = await DonorModel.create(donorData);

        const generalAmt = Number(req.body.generalAmt) || 0;
        const zakkathAmt = Number(req.body.zakkathAmt) || 0;
        let generalAmount = 0;
        let zakkathAmount = 0;

        if (generalAmt > 0) {
            generalAmount = generalAmt;
        }
        if (zakkathAmt > 0) {
            zakkathAmount = zakkathAmt;
        }

        const transactionData = {
            donorId: newDonorId.toString(),
            donorName: req.body.donorName,
            donorType: req.body.donorType,
            generalAmt: generalAmount,
            zakkathAmt: zakkathAmount
        }

        const addTransaction = await TransactionModel.create(transactionData)
        res.json({success: true, donor: newDonor, transaction: addTransaction});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};



// ----------------------------------------------------------------------------------------------------------------

// Update donor 

const updateDonor = async (req, res) => {

    const donor = req.body;

    try {
        const updated = await DonorModel.updateOne(
            {donorId: donor.donorId},
            {$set: {...donor}}
        );
        res.status(200).json(updated);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

// ----------------------------------------------------------------------------------------------------------------

// Delete donor 

const deleteDonor = async (req, res) => {

    try {

        const donorId = req.params.donorId;
        const deleted = await DonorModel.deleteOne({donorId: donorId});
        if (deleted.deletedCount === 0) {
            return res.status(404).json({message: "Donor not found."});
        }
        res.status(200).json({message: "Donor deleted successfully."});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

// ----------------------------------------------------------------------------------------------------------------

// ---------Add amt for Donor

const addAmount = async (req, res) => {
    try {
        const adAmt = await TransactionModel.create(req.body);
        // console.log("Transaction saved:", adAmt);

        const generalAmt = Number(req.body.generalAmt) || 0;
        const zakkathAmt = Number(req.body.zakkathAmt) || 0;

        const donor = await DonorModel.findOne({donorId: req.body.donorId});

        if (!donor) {
            return res.status(404).json({success: false, message: "Donor not found."});
        }

        const updatedGeneralAmt = (donor.generalAmt || 0) + generalAmt;
        const updatedGeneralBal = (donor.generalBal || 0) + generalAmt;
        const updatedZakkathAmt = (donor.zakkathAmt || 0) + zakkathAmt;
        const updatedZakkathBal = (donor.zakkathBal || 0) + zakkathAmt;

        await DonorModel.updateOne(
            {donorId: req.body.donorId},
            {
                $set: {
                    generalAmt: updatedGeneralAmt,
                    generalBal: updatedGeneralBal,
                    zakkathAmt: updatedZakkathAmt,
                    zakkathBal: updatedZakkathBal,
                },
            }
        );

        // console.log("Balance updated successfully");

        res.status(200).json({
            success: true,
            message: "Transaction saved and donor balance updated successfully.",
            transaction: adAmt,
        });
    } catch (e) {
        console.error("Error while saving transaction:", e);
        res.status(500).json({
            success: false,
            message: "Error while saving transaction.",
            error: e.message,
        });
    }
};

module.exports = {fetchDonors, addDonor, updateDonor, deleteDonor, addAmount};