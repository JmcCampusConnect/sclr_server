const express = require('express');
const router = express.Router();
const {fetchCounts } = require('../../controller/admin/progressReportController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchCounts', fetchCounts);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;