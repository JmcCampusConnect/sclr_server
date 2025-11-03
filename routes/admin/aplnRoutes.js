const express = require('express');
const router = express.Router();
const { fetchStudents, fetchDonors } = require('../../controller/admin/aplnController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchStudents', fetchStudents);
router.get('/fetchDonars', fetchDonors);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;