const express = require('express');
const router = express.Router();
const { fetchStudents } = require('../../controller/admin/aplnController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchStudents', fetchStudents);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;