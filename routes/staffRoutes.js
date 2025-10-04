const express = require('express');
const router = express.Router();
const { getStudentCoe, saveStuMark, staffPasswordChange } = require('../controller/staffController')

// -----------------------------------------------------------------------------------------------------------------

router.post('/studentsForCoe', getStudentCoe);
router.post('/saveStudentMark', saveStuMark);
router.put('/passwordChange', staffPasswordChange);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router