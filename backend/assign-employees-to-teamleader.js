const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/emp_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function assignEmployeesToTeamLeader() {
  try {
    console.log('=== Assigning Employees to Team Leader ===\n');
    
    // Get all team leaders
    const teamLeaders = await User.find({ role: 'team-leader' }).select('_id name email');
    console.log('Team Leaders found:', teamLeaders.length);
    teamLeaders.forEach(tl => {
      console.log(`- ${tl.name} (${tl.email}) - ID: ${tl._id}`);
    });
    
    if (teamLeaders.length === 0) {
      console.log('No team leaders found. Please create a team leader first.');
      return;
    }
    
    // Get all developers and designers
    const employees = await User.find({ 
      role: { $in: ['developer', 'designer'] } 
    }).select('_id name email role teamLeaderId');
    
    console.log('\nEmployees found:', employees.length);
    employees.forEach(emp => {
      console.log(`- ${emp.name} (${emp.email}) - Role: ${emp.role} - TeamLeaderId: ${emp.teamLeaderId || 'NOT ASSIGNED'}`);
    });
    
    if (employees.length === 0) {
      console.log('No employees found. Please create some developers/designers first.');
      return;
    }
    
    // Assign employees to the first team leader
    const teamLeader = teamLeaders[0];
    console.log(`\nAssigning employees to: ${teamLeader.name}`);
    
    const unassignedEmployees = employees.filter(emp => !emp.teamLeaderId);
    console.log(`Unassigned employees: ${unassignedEmployees.length}`);
    
    if (unassignedEmployees.length === 0) {
      console.log('All employees are already assigned to team leaders.');
      return;
    }
    
    // Assign first 3 unassigned employees to the team leader
    const employeesToAssign = unassignedEmployees.slice(0, 3);
    
    for (const employee of employeesToAssign) {
      await User.findByIdAndUpdate(employee._id, { teamLeaderId: teamLeader._id });
      console.log(`✓ Assigned ${employee.name} to ${teamLeader.name}`);
    }
    
    console.log(`\n✅ Successfully assigned ${employeesToAssign.length} employees to ${teamLeader.name}`);
    
    // Show final status
    const updatedEmployees = await User.find({ 
      role: { $in: ['developer', 'designer'] } 
    }).select('_id name email role teamLeaderId');
    
    console.log('\n=== Final Employee Status ===');
    updatedEmployees.forEach(emp => {
      const assignedTo = emp.teamLeaderId ? 
        teamLeaders.find(tl => tl._id.toString() === emp.teamLeaderId.toString())?.name : 
        'NOT ASSIGNED';
      console.log(`- ${emp.name} (${emp.role}) → ${assignedTo}`);
    });
    
  } catch (error) {
    console.error('Error assigning employees:', error);
  } finally {
    mongoose.connection.close();
  }
}

assignEmployeesToTeamLeader(); 