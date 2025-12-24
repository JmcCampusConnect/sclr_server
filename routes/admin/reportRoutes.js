const express = require('express');
const router = express.Router();
const { fetchDonors, fetchCardsData, fetchDonorTransactions, deleteTransaction,editTransaction } = require('../../controller/admin/reportController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDonors', fetchDonors);
router.get('/fetchCardsData', fetchCardsData);
router.get('/fetchDonorTransactions', fetchDonorTransactions);
router.post('/deleteTransaction', deleteTransaction);
router.post('/editTransaction',editTransaction)

// -----------------------------------------------------------------------------------------------------------------

module.exports = router