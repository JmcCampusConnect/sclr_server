const express = require('express');
const router = express.Router();
const { fetchDonors, fetchCardsData } = require('../../controller/admin/reportController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDonors', fetchDonors);
router.get('/fetchCardsData', fetchCardsData);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router