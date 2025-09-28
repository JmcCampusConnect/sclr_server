const express = require('express');
const router = express.Router();
const multer = require('multer');
const { registerApplicationSave, checkRegisterNo } = require('../controller/registerController');

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

// -----------------------------------------------------------------------------------------------------------------

router.post('/application', upload.single('jamathLetter'), registerApplicationSave);
router.get('/checkRegisterNo', checkRegisterNo);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router