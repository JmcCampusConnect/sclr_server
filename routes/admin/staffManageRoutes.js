const express = require('express');
const router = express.Router();
const { updateStaff, fetchStaffs } = require('../../controller/admin/manage/staffManageController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchStaffs', fetchStaffs);
router.put('/updateStaff', updateStaff);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router 