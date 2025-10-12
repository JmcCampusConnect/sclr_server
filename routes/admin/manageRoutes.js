const express = require('express');
const router = express.Router();
const { fetchAcademicYear, academicYearSet } = require('../../controller/admin/manageController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchAcademicYear', fetchAcademicYear);
router.post('/academicYearSet', academicYearSet);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router