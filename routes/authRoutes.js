const express = require('express');
const router = express.Router();
const { loginUser, tokenRefresh, logoutUser } = require('../controller/authController');

// -----------------------------------------------------------------------------------------------------------------

router.post('/login', loginUser);
router.post('/refresh', tokenRefresh);
router.post('/logout', logoutUser);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router