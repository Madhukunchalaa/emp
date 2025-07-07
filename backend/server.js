const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*', // You can restrict this to your frontend URL
    methods: ['GET', 'POST']
  }
});

app.set('io', io); // Attach io to app for controller access

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const managerRoutes = require('./routes/managerRoutes');
const teamLeaderRoutes = require('./routes/teamLeaderRoutes');
const designRoutes = require('./routes/designRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const empIdRoutes = require('./controllers/empIdController');

app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/team-leader', teamLeaderRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/empid', empIdRoutes);

// Socket.IO chat logic
const ChatMessage = require('./models/ChatMessage');
io.on('connection', (socket) => {
  socket.on('join', ({ userId }) => {
    socket.join(userId);
  });

  socket.on('sendMessage', async (data) => {
    console.log('sendMessage:', data); // Debug log
    // Save to DB, then emit to recipient
    const msg = await ChatMessage.create(data);
    io.to(data.to).emit('receiveMessage', msg);
    io.to(data.from).emit('receiveMessage', msg); // echo to sender
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => console.error('MongoDB connection error:', err));
