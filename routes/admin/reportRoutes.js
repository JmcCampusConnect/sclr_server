const express = require('express');
const router = express.Router();
const { fetchDonors, fetchCardsData, fetchDonorTransactions } = require('../../controller/admin/reportController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDonors', fetchDonors);
router.get('/fetchCardsData', fetchCardsData);
router.get('/fetchDonorTransactions', fetchDonorTransactions);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router