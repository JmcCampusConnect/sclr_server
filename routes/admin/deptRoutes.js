const express = require('express');
const router = express.Router();
const { fetchDepts,addDepartment ,updateDepartment,deleteDepartment} = require('../../controller/admin/deptController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDepts', fetchDepts);
router.post('/addDepartment', addDepartment);
router.post('/updateDepartment', updateDepartment);
router.post('/deleteDepartment', deleteDepartment);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router