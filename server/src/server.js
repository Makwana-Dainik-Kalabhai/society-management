const path = require('path');
const dotenv = require('dotenv');

// Load environment variables reliably from server/.env or root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Socket.io for Real-time Notifications & Live Chat / Ticket Updates
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  }
});

// Attach io to Express app instance for controllers
app.set('io', io);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`⚡ Client connected via WebSocket: ${socket.id}`);

  // Resident or Admin joins their society room
  socket.on('join_society', (societyId) => {
    if (societyId) {
      socket.join(`society_${societyId}`);
      console.log(`Socket ${socket.id} joined room: society_${societyId}`);
    }
  });

  // Join a specific complaint discussion room
  socket.on('join_complaint', (complaintId) => {
    if (complaintId) {
      socket.join(`complaint_${complaintId}`);
      console.log(`Socket ${socket.id} joined room: complaint_${complaintId}`);
    }
  });

  // Complaint message / comment
  socket.on('send_complaint_message', (data) => {
    if (data.complaintId) {
      io.to(`complaint_${data.complaintId}`).emit('complaint_message_received', data);
      if (data.societyId) {
        socket.to(`society_${data.societyId}`).emit('complaint_updated', data);
      }
    }
  });

  // Complaint updates
  socket.on('new_complaint', (data) => {
    if (data.societyId) {
      socket.to(`society_${data.societyId}`).emit('complaint_created', data);
    }
  });

  socket.on('complaint_status_change', (data) => {
    if (data.societyId) {
      io.to(`society_${data.societyId}`).emit('complaint_updated', data);
    }
  });

  socket.on('new_broadcast', (data) => {
    if (data.societyId) {
      io.to(`society_${data.societyId}`).emit('notification_received', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Start Server after connecting to MongoDB
connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Society Management Server listening on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server ready for real-time events.`);
  });
}).catch(err => {
  console.error('Fatal Server Boot Error:', err);
});
