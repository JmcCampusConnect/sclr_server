const express = require('express');
const router = express.Router();
const { fetchStudentData, passwordSemBasedChange } = require('../../../controller/admin/manage/studentManageController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchStudentData', fetchStudentData);
router.put('/passwordSemBasedChange/:registerNo', passwordSemBasedChange);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router