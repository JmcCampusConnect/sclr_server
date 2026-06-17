const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DonorModel = require('../../models/Donor'); 
const FundModel = require('../../models/Fund');   
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Academic years for dropdown values

const fetchAcademicYear = async (req, res) => {
    try {
        const getAllAcademicYears = await AcademicModel.find({});
        const academicDocs = await AcademicModel.find({}, { academicYear: 1, _id: 0 }).sort({ academicYear: -1 });
        const academicYears = academicDocs.map(doc => doc.academicYear);
        const currAcYear = await currentAcademicYear()
        return res.json({ academicYears, currAcYear, getAllAcademicYears });
    } catch (error) {
        console.error('Error fetching academic years : ', error);
        return res.status(500).json({ message: 'Server error while fetching academic years.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Academic year value set

const academicYearSet = async (req, res) => {

    const { currAcYear } = req.body;

    try {

        // Validate input
        if (!currAcYear) {
            return res.status(400).json({ error: 'Academic year is required.' });
        }

        // First, check if the academic year exists
        const targetYear = await AcademicModel.findOne({ academicYear: currAcYear });
        if (!targetYear) {
            return res.status(404).json({ error: 'Academic year not found.' });
        }

        // Check if the target year is already active
        if (targetYear.active === 1) {
            return res.status(400).json({ 
                error: 'This academic year is already active.' 
            });
        }

        // Get the currently active academic year
        const currentActiveYear = await AcademicModel.findOne({ active: 1 });
        
        // If there's an active year, get all donors and their balances
        if (currentActiveYear) {
            // Get all funds from the current active academic year
            const currentFunds = await FundModel.find({ 
                academicYear: currentActiveYear.academicYear 
            });
            
            // Get all donors
            const allDonors = await DonorModel.find({});
            
            // Create a map of donor balances from current funds
            const donorBalanceMap = new Map();
            currentFunds.forEach(fund => {
                donorBalanceMap.set(fund.donorId, {
                    generalBal: fund.generalBal || 0,
                    zakkathBal: fund.zakkathBal || 0
                });
            });
            
            // Prepare new fund records for the target academic year
            const newFundRecords = [];
            
            for (const donor of allDonors) {
                // Check if fund record already exists for this donor in the target academic year
                const existingFund = await FundModel.findOne({ 
                    academicYear: currAcYear,
                    donorId: donor.donorId 
                });
                
                // Only create if no existing record for this donor in target year
                if (!existingFund) {
                    // Get balances from current year or default to 0
                    const balances = donorBalanceMap.get(donor.donorId) || { 
                        generalBal: 0, 
                        zakkathBal: 0 
                    };
                    
                    newFundRecords.push({
                        academicYear: currAcYear,
                        donorId: donor.donorId,
                        donorName: donor.donorName,
                        donorType: donor.donorType,
                        generalAmt: balances.generalBal,
                        zakkathAmt: balances.zakkathBal,
                        generalBal: balances.generalBal,
                        zakkathBal: balances.zakkathBal
                    });
                }
            }
            
            // Bulk insert all new fund records
            if (newFundRecords.length > 0) {
                await FundModel.insertMany(newFundRecords);
                console.log(`Created ${newFundRecords.length} fund records for academic year ${currAcYear}`);
            }
        }

        // Deactivate all other academic years 
        await AcademicModel.updateMany(
            { academicYear: { $ne: currAcYear } }, 
            { active: 0 } 
        );

        // Activate the selected academic year
        const updatedYear = await AcademicModel.findOneAndUpdate(
            { academicYear: currAcYear },
            { active: 1 },
            { new: true }
        );

        // Optionally: Update students if needed
        await StudentModel.updateMany({}, { isSemBased: 0 });

        res.status(200).json({ 
            message: 'Academic year set to active successfully. Fund records created for all donors.',
            activeYear: updatedYear
        });

    } catch (error) {
        console.error('Error in updating academic year : ', error);
        res.status(500).json({ error: 'Failed to set academic year to active.' });
    }
}

// ----------------------------------------------------------------------------------------------------------------

// To Upsert date for application

const updateDates = async (req, res) => {

    const { applnStartDate, applnEndDate } = req.body;

    const currAcYear = await currentAcademicYear();

    await AcademicModel.findOneAndUpdate(
        { academicYear: currAcYear },
        {
            applnStartDate: new Date(applnStartDate),
            applnEndDate: new Date(applnEndDate)
        },
        { upsert: true }
    );

    res.json({ status: 200, message: 'Dates updated successfully' });

};

// ----------------------------------------------------------------------------------------------------------------

// To fetch and display dates for application date settings

const fetchDates = async (req, res) => {
    const currAcYear = await currentAcademicYear();
    const academicYears = await AcademicModel.find({})
    const dateRange = await AcademicModel.findOne({ academicYear: currAcYear });
    res.json({ dateRange: dateRange, academicYears: academicYears });
}

// ----------------------------------------------------------------------------------------------------------------

// Academic Year Add

const addAcademic = async (req, res) => {

    const { academicYear, startDate, endDate, isActive } = req.body;

    try {
        const checkExist = await AcademicModel.find({ academicYear: academicYear });
        if (checkExist.length > 0) { 
            return res.status(409).json({ message: "Academic Year Already Exists" }) 
        }
        
        const lastAcademic = await AcademicModel.findOne().sort({ academicId: -1 });
        const nextId = lastAcademic ? lastAcademic.academicId + 1 : 1;
        
        if (isActive) { 
            await AcademicModel.updateMany(
                { active: 1 }, 
                { $set: { active: 0 } }  
            );
        }

        const responseAdd = await AcademicModel.create({
            academicId: nextId,
            academicYear,
            applnStartDate: startDate,
            applnEndDate: endDate,
            active: isActive ? 1 : 0
        });
        
        return res.status(200).json({ 
            message: "Academic year added", 
            addedData: responseAdd 
        })
    } catch (error) {
        console.error('Error in Adding Academic Year : ', error);
        return res.status(500).json({ message: "Something wrong with server" })
    }
}

// ----------------------------------------------------------------------------------------------------------------

// Update the Academic Year 

const updateAcademicYear = async (req, res) => {

    const { formData } = req.body;

    try {

        const { academicId, academicYear, applnStartDate, applnEndDate, active } = formData;

        // Check if another academic year with same name exists 
        const checkExist = await AcademicModel.findOne({
            academicYear,
            academicId: { $ne: academicId }
        });

        if (checkExist) {
            return res.status(409).json({ message: "Academic Year already exists" });
        }

        // If setting this one as active, deactivate ALL other active ones
        if (active) { 
            await AcademicModel.updateMany(
                { 
                    active: 1, 
                    academicId: { $ne: academicId } 
                }, 
                { $set: { active: 0 } }
            );
        }

        const update = await AcademicModel.updateOne(
            { academicId },
            {
                $set: {
                    academicYear,
                    applnStartDate,
                    applnEndDate,
                    active: active ? 1 : 0
                }
            }
        );

        if (update.matchedCount === 0) {
            return res.status(404).json({ message: "Academic year not found" });
        }

        return res.status(200).json({ 
            message: "Academic year data updated successfully", 
            update 
        });

    } catch (error) {
        console.error('Error in updating Academic Year : ', error);
        res.status(500).json({ message: "Something went wrong on server" });
    }
}

// ----------------------------------------------------------------------------------------------------------------

// Delete the Academic Year From the Academic Model

const deleteAcademicYear = async (req, res) => {

    try {

        const { academicId } = req.params;

        // Validate academicId exists first
        if (!academicId) { 
            return res.status(400).json({ message: "academicId is required" }) 
        }

        // Find the academic year
        const academicToDelete = await AcademicModel.findOne({ academicId });
        
        // Check if academic year exists
        if (!academicToDelete) { 
            return res.status(404).json({ message: "Academic year not found" }) 
        }

        // Check if it's the active academic year
        if (academicToDelete.active === 1) { 
            return res.status(403).json({ 
                message: "Cannot delete the active academic year. Please set another year as active first." 
            }) 
        }

        // Delete the academic year
        const deleted = await AcademicModel.deleteOne({ academicId });

        const activeCount = await AcademicModel.countDocuments({ active: 1 });
        if (activeCount === 0) {
            const newestAcademic = await AcademicModel.findOne().sort({ academicId: -1 });
            if (newestAcademic) {
                await AcademicModel.updateOne(
                    { academicId: newestAcademic.academicId },
                    { $set: { active: 1 } }
                );
            }
        }

        return res.status(200).json({ 
            message: "Academic year deleted successfully", 
            deleted 
        });

    } catch (err) {
        console.error('Error in deleting Academic Year : ', err);
        return res.status(500).json({ message: "Server error while deleting" });
    }
}

// ----------------------------------------------------------------------------------------------------------------

// Function to manually create fund records for a specific academic year

const createFundRecordsForYear = async (req, res) => {

    const { academicYear } = req.body;
    
    try {

        // Check if academic year exists
        const academic = await AcademicModel.findOne({ academicYear });
        if (!academic) {
            return res.status(404).json({ message: "Academic year not found" });
        }
        
        // Check if funds already exist for this year
        const existingFunds = await FundModel.findOne({ academicYear });
        if (existingFunds) {
            return res.status(400).json({ 
                message: "Fund records already exist for this academic year" 
            });
        }
        
        // Get previous academic year
        const previousYear = await AcademicModel.findOne({ 
            academicId: academic.academicId - 1 
        });
        
        let previousFunds = [];
        if (previousYear) {
            previousFunds = await FundModel.find({ 
                academicYear: previousYear.academicYear 
            });
        }
        
        // Get all donors
        const allDonors = await DonorModel.find({});
        
        // Create fund records
        const newFundRecords = allDonors.map(donor => {
            const prevFund = previousFunds.find(f => f.donorId === donor.donorId);
            const generalBal = prevFund ? prevFund.generalBal : 0;
            const zakkathBal = prevFund ? prevFund.zakkathBal : 0;
            
            return {
                academicYear: academicYear,
                donorId: donor.donorId,
                donorName: donor.donorName,
                donorType: donor.donorType,
                generalAmt: generalBal,
                zakkathAmt: zakkathBal,
                generalBal: generalBal,
                zakkathBal: zakkathBal
            };
        });
        
        await FundModel.insertMany(newFundRecords);
        
        res.status(200).json({ 
            message: `Created ${newFundRecords.length} fund records for academic year ${academicYear}`,
            recordsCreated: newFundRecords.length
        });
        
    } catch (error) {
        console.error('Error creating fund records:', error);
        res.status(500).json({ message: "Failed to create fund records" });
    }
};

// ----------------------------------------------------------------------------------------------------------------

module.exports = { 
    fetchAcademicYear, 
    academicYearSet, 
    fetchDates, 
    updateDates, 
    addAcademic, 
    updateAcademicYear, 
    deleteAcademicYear,
    createFundRecordsForYear 
}