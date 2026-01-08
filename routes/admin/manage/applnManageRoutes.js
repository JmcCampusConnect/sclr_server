const express = require('express');
const router = express.Router();
const { fetchApplicationData, deleteApplication, updateApplication } = require('../../../controller/admin/manage/applnManageController');
const multer = require('multer');

// -----------------------------------------------------------------------------------------------------------------

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './zamathfiles')
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`
        cb(null, uniqueName)
    }
})

const upload = multer({ storage });




router.get('/fetchApplicationData', fetchApplicationData);
router.post('/deleteApplication', deleteApplication);
router.post('/updateApplication', upload.single("jamathLetter"), updateApplication);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router;