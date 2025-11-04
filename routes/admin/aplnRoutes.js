const express = require('express');
const router = express.Router();
const { fetchStudents, fetchDonors, sclrDistributions } = require('../../controller/admin/aplnController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchStudents', fetchStudents);
router.get('/fetchDonars', fetchDonors);
router.post('/sclrDistributions', sclrDistributions);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;