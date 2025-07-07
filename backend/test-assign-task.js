const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/DesignTask');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/emp_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testAssignTask() {
  try {
    console.log('=== Testing Assign Task Functionality ===\n');
    
    // Check if we have team leaders
    const teamLeaders = await User.find({ role: 'team-leader' }).select('_id name email');
    console.log(`✅ Found ${teamLeaders.length} team leaders`);
    
    if (teamLeaders.length === 0) {
      console.log('❌ No team leaders found. Please create a team leader first.');
      return;
    }
    
    // Check if we have employees assigned to team leaders
    const employees = await User.find({ 
      role: { $in: ['developer', 'designer'] },
      teamLeaderId: { $exists: true, $ne: null }
    }).select('_id name email role teamLeaderId');
    
    console.log(`✅ Found ${employees.length} employees assigned to team leaders`);
    
    if (employees.length === 0) {
      console.log('❌ No employees assigned to team leaders. Please run: node assign-employees-to-teamleader.js');
      return;
    }
    
    // Show team assignments
    console.log('\n📋 Team Assignments:');
    employees.forEach(emp => {
      const tl = teamLeaders.find(tl => tl._id.toString() === emp.teamLeaderId.toString());
      console.log(`  - ${emp.name} (${emp.role}) → ${tl ? tl.name : 'Unknown TL'}`);
    });
    
    // Check existing tasks
    const existingTasks = await Task.find().populate('assignedTo', 'name email').populate('assignedBy', 'name email');
    console.log(`\n📋 Found ${existingTasks.length} existing tasks`);
    
    if (existingTasks.length > 0) {
      console.log('Recent tasks:');
      existingTasks.slice(0, 3).forEach(task => {
        console.log(`  - ${task.content} (Assigned to: ${task.assignedTo?.name || 'Unknown'})`);
      });
    }
    
    console.log('\n🎯 To test assign task functionality:');
    console.log('1. Make sure your .env file has the correct MONGO_URI');
    console.log('2. Start your backend server: npm start');
    console.log('3. Start your frontend: npm start (in frontend directory)');
    console.log('4. Login as a team leader');
    console.log('5. Try assigning a task to a team member');
    console.log('6. Check the backend console for debugging logs');
    
  } catch (error) {
    console.error('❌ Error testing assign task:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAssignTask(); 