const express = require('express');
const router = express.Router();
const { fetchAcademicYear, academicYearSet, fetchDates, updateDates, addAcademic, updateAcademicYear, deleteAcademicYear } = require('../../controller/admin/aplnSettingsController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchAcademicYear', fetchAcademicYear);
router.post('/academicYearSet', academicYearSet);
router.post('/updateDates', updateDates);
router.get('/fetchDates', fetchDates);
router.post('/addAcademicYear', addAcademic)
router.put('/updateAcademicYear', updateAcademicYear)
router.delete("/deleteAcademicYear/:academicId", deleteAcademicYear);

// ------------------------------------------------------------------------------------------------- ----------------

module.exports = router