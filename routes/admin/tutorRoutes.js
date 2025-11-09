const express = require('express');
const router = express.Router();
const { fetchTutors ,fetchDepartments,addTutor,updateTutor} = require('../../controller/admin/tutorController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchTutors', fetchTutors);
router.get('/departments', fetchDepartments);
router.post('/addTutor', addTutor);
router.post('/updateTutor', updateTutor);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router