const express = require('express');
const router = express.Router();
const {fetchTutors, fetchDepartments, addTutor, updateTutor, deleteTutor} = require('../../controller/admin/tutorController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchTutors', fetchTutors);
router.get('/departments', fetchDepartments);
router.post('/addTutor', addTutor);
router.post('/updateTutor', updateTutor);
router.post('/deleteTutor', deleteTutor);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router