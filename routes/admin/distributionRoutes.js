const express = require('express');
const router = express.Router();
const { fetchDistribution, fetchCardsData, deleteStatement, updateStatement } = require('../../controller/admin/distributionController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDistribution', fetchDistribution);
router.get('/fetchCardsData', fetchCardsData);
router.delete('/stmtDelete/:_id', deleteStatement);
router.put('/update/:_id', updateStatement);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;