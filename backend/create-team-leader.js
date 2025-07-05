const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to create a team leader
async function createTeamLeader() {
  try {
    // Check if team leader already exists
    const existingUser = await User.findOne({ email: 'teamleader@example.com' });
    if (existingUser) {
      console.log('Team leader already exists with email: teamleader@example.com');
      return;
    }

    // Create team leader user
    const teamLeader = new User({
      name: 'Team Leader',
      email: 'teamleader@example.com',
      password: 'password123', // This will be hashed automatically
      role: 'team-leader',
      empid: 'TL001',
      status: 'Online'
    });

    await teamLeader.save();
    
    
  } catch (error) {
    console.error('Error creating team leader:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the function
createTeamLeader(); 