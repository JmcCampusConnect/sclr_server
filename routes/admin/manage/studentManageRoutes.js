const express = require('express');
const router = express.Router();
const { fetchStudentData,  updateStudent,   quickSaveStudent  } = require('../../../controller/admin/manage/studentManageController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchStudentData', fetchStudentData);
router.put('/updateStudent/:registerNo', updateStudent);
router.put('/quickSaveStudent/:registerNo', quickSaveStudent);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router