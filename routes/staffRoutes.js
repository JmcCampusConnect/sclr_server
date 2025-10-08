const express = require('express');
const router = express.Router();
const { getStudentCOE, saveStudentMark, staffPasswordChange, getStudentClassAttendance, saveClassAttendance } = require('../controller/staffController')

// -----------------------------------------------------------------------------------------------------------------

router.put('/passwordChange', staffPasswordChange);
router.post('/coe/students', getStudentCOE);
router.post('/coe/saveStudentMark', saveStudentMark);
router.post('/class/students', getStudentClassAttendance);
router.post('/class/saveAttendance', saveClassAttendance);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router