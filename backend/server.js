const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Import Auth Routes
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');

// Test Route
app.get('/', (req, res) => {
    res.send('AaharSetu Backend API is running successfully!');
});

// Use Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});