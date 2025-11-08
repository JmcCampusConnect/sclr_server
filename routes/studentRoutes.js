const express = require('express');
const router = express.Router();
const multer = require('multer');
const { registerUser, studentStatus, registerApplication, checkRegisterNo, fetchStudentData,
    loginApplication } = require('../controller/studentController');

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

router.post('/register', registerUser);
router.get('/status', studentStatus);
router.post('/registerApplication', upload.single('jamathLetter'), registerApplication);
router.post('/loginApplication', upload.single('jamathLetter'), loginApplication);
router.get('/checkRegisterNo', checkRegisterNo);
router.get('/fetchStudentData', fetchStudentData);

// -----------------------------------------------------------------------------------------------------------------

module.exports = router