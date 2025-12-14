const express = require('express');
const router = express.Router();
const { fetchApplicationData, deleteApplication, updateApplication } = require('../../controller/admin/applnManageController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchApplicationData', fetchApplicationData);
router.post('/deleteApplication', deleteApplication); 
router.post('/updateApplication', updateApplication); 

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;