const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// -----------------------------------------------------------------------------------------------------------------

// Imported Functions

const connectDB = require('./config/db');

// -----------------------------------------------------------------------------------------------------------------

// Imported Model

const AcademicModel = require('./models/Academic');

// -----------------------------------------------------------------------------------------------------------------

// Routes Path

const registerRoutes = require('./routes/registerRoute');
const userRoutes = require('./routes/userRoute');

// -----------------------------------------------------------------------------------------------------------------

// To load environment variables from .env to application

dotenv.config({ quiet: true });

const app = express();
app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}))

connectDB();

app.use('/zamathfiles', express.static(path.join(__dirname, 'zamathfiles')));

// -----------------------------------------------------------------------------------------------------------------

// To verify in which port has taken the backend

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

// -----------------------------------------------------------------------------------------------------------------

// Routes Link

app.use('/api/register', registerRoutes);
app.use('/api/user', userRoutes);

// -----------------------------------------------------------------------------------------------------------------