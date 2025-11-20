const express = require('express');
const router = express.Router();
const { updateStaff,fetchStaffs } = require('../../controller/admin/staffManageController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchStaffs', fetchStaffs);
router.put('/updateStaff', updateStaff);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router 