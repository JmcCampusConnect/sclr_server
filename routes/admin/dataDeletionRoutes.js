const express = require('express');
const router = express.Router();
const { fetchUniqueValues, deleteData } = require('../../controller/admin/dataDeletionController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchUniqueValues', fetchUniqueValues);
router.post('/delete', deleteData);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;