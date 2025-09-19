require('dotenv').config();
const express = require('express');
const { connectDB, setupMiddleware, errorHandler } = require('../../shared');

const app = express();

// Setup middleware
setupMiddleware(app, express);

// Connect to database
connectDB(process.env.MONGODB_URI);

// Routes
app.use('/api/responses', require('./routes/responses'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'responses-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Responses service running on port ${PORT}`);
});