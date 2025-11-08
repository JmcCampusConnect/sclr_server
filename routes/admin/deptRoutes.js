const express = require('express');
const router = express.Router();
const { fetchDepts } = require('../../controller/admin/deptController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDepts', fetchDepts);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router