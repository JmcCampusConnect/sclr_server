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
        await AcademicModel.updateMany({}, { active: '0' });
        await AcademicModel.findOneAndUpdate({ academicYear: currAcYear }, { active: 1 });
        res.status(200).json({ message: 'Academic year set to active successfully.' });
    } catch (error) {
        console.error('Error in updating academic year : ', error);
        res.status(500).json({ error: 'Failed to set academic year to active.' });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { fetchAcademicYear, academicYearSet }