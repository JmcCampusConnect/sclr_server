const express = require('express');
const router = express.Router();
const { getStudentCOE, saveStudentMark, submitAppliedScholarship, sclrStudents, staffPasswordChange, getStudentClassAttendance, saveClassAttendance, getStudentDM, saveDMattendance } = require('../controller/staffController')

// -----------------------------------------------------------------------------------------------------------------

router.put('/passwordChange', staffPasswordChange);
router.post('/coe/students', getStudentCOE);
router.post('/coe/saveStudentMark', saveStudentMark);
router.post('/class/students', getStudentClassAttendance);
router.post('/class/saveAttendance', saveClassAttendance);
router.post('/dm/studentsDM', getStudentDM);
router.post('/dm/saveStdutntDM', saveDMattendance);
router.post('/dm/saveStdutntDM', saveDMattendance);
router.get('/sclr/students', sclrStudents);
router.post('/sclr/submit', submitAppliedScholarship);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router