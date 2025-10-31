const express = require('express');
const router = express.Router();
const { fetchTutors } = require('../../controller/admin/tutorController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchTutors', fetchTutors);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router