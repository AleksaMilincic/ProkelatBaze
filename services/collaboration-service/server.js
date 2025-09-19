require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB, setupMiddleware, errorHandler, verifyToken } = require('../../shared');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Setup middleware
setupMiddleware(app, express);

// Connect to database
connectDB(process.env.MONGODB_URI);

// Socket.IO middleware for authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (token) {
      const decoded = verifyToken(token, process.env.JWT_SECRET || 'fallback_secret');
      socket.userId = decoded.userId;
      socket.user = decoded;
    }
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId || 'anonymous'} connected`);

  // Join form-specific rooms
  socket.on('join_form', (formId) => {
    socket.join(`form_${formId}`);
    console.log(`User ${socket.userId} joined form ${formId}`);
  });

  // Leave form-specific rooms
  socket.on('leave_form', (formId) => {
    socket.leave(`form_${formId}`);
    console.log(`User ${socket.userId} left form ${formId}`);
  });

  // Handle real-time form editing
  socket.on('form_editing', (data) => {
    socket.to(`form_${data.formId}`).emit('user_editing', {
      userId: socket.userId,
      user: socket.user,
      field: data.field,
      timestamp: new Date()
    });
  });

  // Handle typing indicators for comments
  socket.on('typing_comment', (data) => {
    socket.to(`form_${data.formId}`).emit('user_typing_comment', {
      userId: socket.userId,
      user: socket.user,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId || 'anonymous'} disconnected`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/comments', require('./routes/comments'));
app.use('/api/activities', require('./routes/activities'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'collaboration-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3004;

server.listen(PORT, () => {
  console.log(`Collaboration service running on port ${PORT}`);
});