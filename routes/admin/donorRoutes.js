const express = require('express');
const router = express.Router();
const { fetchDonors } = require('../../controller/admin/donorController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDonors', fetchDonors);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router