const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const {currentAcademicYear} = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Academic years for dropdown values

const fetchAcademicYear = async (req, res) => {
    try {
        const getAllAcademicYears = await AcademicModel.find({});
        const academicDocs = await AcademicModel.find({}, {academicYear: 1, _id: 0}).sort({academicYear: -1});
        const academicYears = academicDocs.map(doc => doc.academicYear);
        const currAcYear = await currentAcademicYear()
        return res.json({academicYears, currAcYear, getAllAcademicYears});
    } catch (error) {
        console.error('Error fetching academic years : ', error);
        return res.status(500).json({message: 'Server error while fetching academic years.'});
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Academic year value set

const academicYearSet = async (req, res) => {

    const {currAcYear} = req.body;

    try {

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        await AcademicModel.updateMany(
            {academicYear: {$ne: currAcYear}},
            {
                active: 0,
                applnStartDate: yesterday,
                applnEndDate: yesterday
            }
        );

        const updatedYear = await AcademicModel.findOneAndUpdate(
            {academicYear: currAcYear},
            {active: 1},
            {new: true}
        );

        if (!updatedYear) {
            return res.status(404).json({error: 'Academic year not found.'});
        }
        await StudentModel.updateMany({}, {isSemBased: 0});
        res.status(200).json({message: 'Academic year set to active successfully.'});
    } catch (error) {
        console.error('Error in updating academic year : ', error);
        res.status(500).json({error: 'Failed to set academic year to active.'});
    }
}

// ----------------------------------------------------------------------------------------------------------------

// To Upsert date for application

const updateDates = async (req, res) => {
    const {applnStartDate, applnEndDate} = req.body;
    const currAcYear = await currentAcademicYear();
    await AcademicModel.findOneAndUpdate({academicYear: currAcYear},
        {applnStartDate, applnEndDate}, {upsert: true});
    res.send('Dates Saved');
}

// ----------------------------------------------------------------------------------------------------------------

// To fetch and display dates for application date settings

const fetchDates = async (req, res) => {
    const currAcYear = await currentAcademicYear();
    const academicYears = await AcademicModel.find({})
    const dateRange = await AcademicModel.findOne({academicYear: currAcYear});
    res.json({dateRange: dateRange, academicYears: academicYears});
}

// ----------------------------------------------------------------------------------------------------------------
// Academic Year Add
const addAcademic = async (req, res) => {
    // console.log(req.body);
    const {academicYear, startDate, endDate, isActive} = req.body;
    // console.log(academicYear)
    try {
        const checkExist = await AcademicModel.find({academicYear: academicYear});
        // console.log(checkExist)
        if (checkExist.length > 0) {
            return res.status(409).json({message: "Academic Year Already Exits"})
        }
        const lastAcademic = await AcademicModel.findOne().sort({academicId: -1});
        const nextId = lastAcademic ? lastAcademic.academicId + 1 : 1;
        if (isActive) {
            const update = await AcademicModel.updateOne({active: 1}, {$set: {active: 0}})
        }
        const responseAdd = await AcademicModel.create({
            academicId: nextId,
            academicYear,
            applnStartDate: startDate,
            applnEndDate: endDate,
            active: isActive ? 1 : 0
        });
        // console.log(responseAdd)
        return res.status(200).json({message: "Academic Year Added", addedData: responseAdd})
    } catch (e) {
        return res.status(500).json({message: "Something wrong with server"})
        // console.log("Error", e)
    }
}

// ----------------------------------------------------------------------------------------------------------------
// Update the Academic  Year 
const updateAcademicYear = async (req, res) => {
    const {formData} = req.body;
    // console.log(formData)
    try {
        const {
            academicId,
            academicYear,
            applnStartDate,
            applnEndDate,
            active
        } = formData;

        if (active) {
            const update = await AcademicModel.updateOne({active: 1}, {$set: {active: 0}})
        }

        const update = await AcademicModel.updateOne(
            {academicId},
            {
                $set: {
                    academicYear,
                    applnStartDate,
                    applnEndDate,
                    active: active ? 1 : 0
                }
            }
        );


        return res.status(200).json({
            message: "Academic year Data Updated successfully",
            update
        });

    } catch (err) {
        // console.error(err);
        res.status(500).json({message: "Something went wrong on server"});
    }
};


// ----------------------------------------------------------------------------------------------------------------
//Delete the Academic Year From the AcademicMOdel

const deleteAcademicYear = async (req, res) => {
    try {
        const {academicId} = req.params;

        const isActive = await AcademicModel.findOne({academicId})
        if (isActive.active == 1) {
            return res.status(403).json({message: "Cannot delete the Active Academic Year"})
        }


        if (!academicId) {
            return res.status(400).json({message: "academicId is required"});
        }

        const deleted = await AcademicModel.deleteOne({academicId});

        if (deleted.deletedCount === 0) {
            return res.status(404).json({message: "Academic year not found"});
        }

        return res.status(200).json({
            message: "Academic year deleted successfully",
            deleted
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Server error while deleting"});
    }
};
module.exports = {fetchAcademicYear, academicYearSet, fetchDates, updateDates, addAcademic, updateAcademicYear, deleteAcademicYear}