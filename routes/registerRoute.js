const express = require('express');
const router = express.Router();
const multer = require('multer');
const { registerApplicationSave } = require('../controller/registerController');

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

// -----------------------------------------------------------------------------------------------------------------

router.post('/application', registerApplicationSave);

module.exports = router