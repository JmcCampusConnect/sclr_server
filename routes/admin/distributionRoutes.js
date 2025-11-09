const express = require('express');
const router = express.Router();
const { fetchDistribution, fetchCardsData } = require('../../controller/admin/distributionController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDistribution', fetchDistribution);
router.get('/fetchCardsData', fetchCardsData);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;