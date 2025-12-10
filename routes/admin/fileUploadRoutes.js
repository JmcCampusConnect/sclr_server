const express = require('express');
const router = express.Router();
const { uploadMarkExcel } = require('../../controller/admin/fileUploadController');

// -----------------------------------------------------------------------------------------------------------------

router.post('/uploadMarkExcel', uploadMarkExcel);

// ------------------------------------------------------------------------------------------------- ----------------

module.exports = router;