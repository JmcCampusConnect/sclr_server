const express = require('express');
const router = express.Router();
const { fetchApplicationData, deleteApplication } = require('../../controller/admin/applnManageController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchApplicationData', fetchApplicationData);
router.post('/deleteApplication', deleteApplication); 

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;