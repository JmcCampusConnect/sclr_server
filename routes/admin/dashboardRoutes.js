const express = require('express');
const router = express.Router();
const { fetchCardData, fetchPieData, fetchBarData } = require('../../controller/admin/dashboardController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchCardData', fetchCardData);
router.get('/fetchPieData', fetchPieData);
router.get('/fetchBarData', fetchBarData);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router