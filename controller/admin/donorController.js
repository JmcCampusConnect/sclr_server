const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DonorModel = require('../../models/Donor');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Fetch donors

const fetchDonors = async (req, res) => {

    try {
        const donors = await DonorModel.find().sort({ createdAt: -1 });
        return res.json({ donors });
    } catch (error) {
        console.error('Error fetching donors : ', error);
        return res.status(500).json({ message: 'Server error while fetching donors.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Add Donor

const addDonor = async (req, res) => {

    try {

        const donorCount = await DonorModel.countDocuments();
        const newDonorId = donorCount + 1;

        const donorData = {
            donorId: newDonorId.toString(),
            donorName: req.body.donorName,
            mobileNo: req.body.mobileNo,
            emailId: req.body.emailId,
            academicYear: req.body.academicYear,
            panOrAadhaar: req.body.panOrAadhaar,
            address: req.body.address,
            district: req.body.district,
            state: req.body.state,
            pinCode: req.body.pinCode,
            donorType: req.body.donorType,
            donorDate: req.body.donorDate,
            generalAmt: req.body.generalAmt,
            generalBal: req.body.generalBal,
            zakkathAmt: req.body.zakkathAmt,
            zakkathBal: req.body.zakkathBal,
            panNo: req.body.panNo,
        };

        const newDonor = await DonorModel.create(donorData);
        res.json({ success: true, donor: newDonor });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};



// ----------------------------------------------------------------------------------------------------------------

// Update donor 

const updateDonor = async (req, res) => {

    const donor = req.body;

    try {
        const updated = await DonorModel.updateOne(
            { donorId: donor.donorId },
            { $set: { ...donor } }
        );
        res.status(200).json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

// ----------------------------------------------------------------------------------------------------------------

// Delete donor 

const deleteDonor = async (req, res) => {

    try {

        const donorId = req.params.donorId;
        const deleted = await DonorModel.deleteOne({ donorId: donorId });
        if (deleted.deletedCount === 0) {
            return res.status(404).json({ message: "Donor not found." });
        }
        res.status(200).json({ message: "Donor deleted successfully." });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchDonors, addDonor, updateDonor, deleteDonor };