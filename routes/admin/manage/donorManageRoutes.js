const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { 
    fetchDonors, addDonor, updateDonor, deleteDonor, addTransaction, getTransaction, 
    deleteTransaction, editTransaction, bulkUploadDonors 
} = require('../../../controller/admin/manage/donorController');

// -----------------------------------------------------------------------------------------------------------------

router.get('/fetchDonors', fetchDonors);
router.post('/addDonor', addDonor);
router.put('/updateDonor/:donorId', updateDonor);
router.delete('/deleteDonor/:donorId', deleteDonor);
router.post('/addTransaction', addTransaction);
router.get('/getTransactions/:donorId', getTransaction);
router.post('/deleteTransaction', deleteTransaction);
router.post('/editTransaction', editTransaction);
router.post('/bulk-upload', upload.single('excelFile'), bulkUploadDonors);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router