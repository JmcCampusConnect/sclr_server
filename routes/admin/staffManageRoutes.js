const express = require('express');
const router = express.Router();
const { fetchStaffs } = require('../../controller/admin/staffController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchStaffs', fetchStaffs);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router