const express = require('express');
const router = express.Router();
const { getStudentCoe, saveStuMark } = require('../controller/staffController')

// -----------------------------------------------------------------------------------------------------------------

router.post('/studentsForCoe', getStudentCoe);
router.post('/saveStudentMark', saveStuMark);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router