require('dotenv').config();
const express = require('express');
const { connectDB, setupMiddleware, errorHandler } = require('../../shared');

const app = express();

// Setup middleware
setupMiddleware(app, express);

// Connect to database
connectDB(process.env.MONGODB_URI);

// Routes
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});