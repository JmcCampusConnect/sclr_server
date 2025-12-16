const express = require('express');
const router = express.Router();
const { fetchDistribution, fetchCardsData, deleteStatement } = require('../../controller/admin/distributionController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDistribution', fetchDistribution);
router.get('/fetchCardsData', fetchCardsData);
router.delete('/stmtDelete/:_id', deleteStatement);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;