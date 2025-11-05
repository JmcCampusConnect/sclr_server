const express = require('express');
const router = express.Router();
const { fetchDistribution } = require('../../controller/admin/distributionController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDistribution', fetchDistribution);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;