const express = require('express');
const router = express.Router();
const { fetchStudents, fetchDonors, sclrDistributions, rejectApplications } = require('../../controller/admin/sclrAdministrationController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchStudents', fetchStudents);
router.get('/fetchDonors', fetchDonors);
router.post('/sclrDistributions', sclrDistributions);
router.post('/rejectApplications', rejectApplications);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;