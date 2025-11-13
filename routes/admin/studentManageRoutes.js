const express = require('express');
const router = express.Router();
const { fetchStudentData } = require('../../controller/admin/studentManageController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchStudentData', fetchStudentData);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router