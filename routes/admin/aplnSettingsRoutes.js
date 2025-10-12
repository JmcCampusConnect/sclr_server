const express = require('express');
const router = express.Router();
const { fetchAcademicYear, academicYearSet, fetchDates, updateDates } = require('../../controller/admin/aplnSettingsController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchAcademicYear', fetchAcademicYear);
router.post('/academicYearSet', academicYearSet);
router.post('/updateDates', updateDates);
router.get('/fetchDates', fetchDates);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router