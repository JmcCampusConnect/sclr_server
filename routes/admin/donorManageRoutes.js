const express = require('express');
const router = express.Router();
const {fetchDonors, addDonor, updateDonor, deleteDonor, addAmount, getTransaction} = require('../../controller/admin/donorController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDonors', fetchDonors);
router.post('/addDonor', addDonor);
router.put('/updateDonor/:donorId', updateDonor);
router.delete('/deleteDonor/:donorId', deleteDonor);
router.post('/addAmount', addAmount);
router.get('/getTransactions/:donorId', getTransaction)

// -----------------------------------------------------------------------------------------------------------------

module.exports = router