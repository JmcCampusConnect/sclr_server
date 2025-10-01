const express = require('express');
const router = express.Router();
const { registerUser, studentStatus } = require('../controller/studentController');

// -----------------------------------------------------------------------------------------------------------------

router.post('/register', registerUser);
router.get('/status', studentStatus);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router