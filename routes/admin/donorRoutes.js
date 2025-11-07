const express = require('express');
const router = express.Router();
const { fetchDonors, updateDonor, deleteDonor } = require('../../controller/admin/donorController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDonors', fetchDonors);
router.post('/updateDonor', updateDonor);
router.delete('/deleteDonor/:donorId', deleteDonor);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;