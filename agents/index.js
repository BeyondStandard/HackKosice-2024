require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const connectDB = require('./config/db'); // Import the MongoDB connection function
const app = express();
const PORT = process.env.PORT || 3000;

connectDB(); // Connect to MongoDB

app.get('/', (req, res) => {
  res.send('Welcome to televate app!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Server is running and ready to accept requests on port', PORT); // Log that the server is ready to accept requests on port
});