const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Academic years for dropdown values

const fetchAcademicYear = async (req, res) => {
    try {
        const academicDocs = await AcademicModel.find({}, { academicYear: 1, _id: 0 }).sort({ academicYear: -1 });
        const academicYears = academicDocs.map(doc => doc.academicYear);
        const currAcYear = await currentAcademicYear()
        return res.json({ academicYears, currAcYear });
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

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        await AcademicModel.updateMany(
            { academicYear: { $ne: currAcYear } },
            {
                active: 0,
                applnStartDate: yesterday,
                applnEndDate: yesterday
            }
        );

        const updatedYear = await AcademicModel.findOneAndUpdate(
            { academicYear: currAcYear },
            { active: 1 },
            { new: true }
        );

        if (!updatedYear) {
            return res.status(404).json({ error: 'Academic year not found.' });
        }
        await StudentModel.updateMany({}, { isSemBased: 0 });
        res.status(200).json({ message: 'Academic year set to active successfully.' });
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
    await AcademicModel.findOneAndUpdate({ academicYear: currAcYear },
        { applnStartDate, applnEndDate }, { upsert: true });
    res.send('Dates Saved');
}

// ----------------------------------------------------------------------------------------------------------------

// To fetch and display dates for application date settings

const fetchDates = async (req, res) => {
    const currAcYear = await currentAcademicYear();
    const dateRange = await AcademicModel.findOne({ academicYear: currAcYear });
    res.json(dateRange);
}

// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchAcademicYear, academicYearSet, fetchDates, updateDates }