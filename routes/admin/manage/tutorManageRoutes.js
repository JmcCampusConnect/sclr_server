const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { 
    fetchTutors, 
    fetchDepartments, 
    addTutor, 
    updateTutor, 
    deleteTutor,
    bulkUploadTutors 
} = require('../../../controller/admin/manage/tutorController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchTutors', fetchTutors);
router.get('/departments', fetchDepartments);
router.post('/addTutor', addTutor);
router.put('/updateTutor/:staffId', updateTutor);
router.delete('/deleteTutor/:staffId', deleteTutor);
router.post('/bulk-upload', upload.single('excelFile'), bulkUploadTutors);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;