const AcademicModel = require('../models/Academic');

const currentAcademicYear = async () => {
    const currAcademic = await AcademicModel.findOne({ active: 1 });
    return currAcademic.academicYear;
};

module.exports = { currentAcademicYear };