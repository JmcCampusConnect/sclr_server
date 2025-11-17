const express = require('express');
const router = express.Router();
const {changePassword} = require('../../controller/admin/changePasswordController');

// -----------------------------------------------------------------------------------------------------------------

router.post('/admin/passwordChange', changePassword);

// ------------------------------------------j-----------------------------------------------------------------------

module.exports = router;