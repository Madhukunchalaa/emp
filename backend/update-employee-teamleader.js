const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const TEAM_LEADER_ID = '686682b62f5bc9766bbe3791'; // The team leader's _id
const EMPLOYEE_EMAIL = 'new.employee@company.com'; // Change this to the employee you want to update or create
const EMPLOYEE_NAME = 'New Employee';
const EMPLOYEE_ROLE = 'developer'; // or 'designer'
const EMPLOYEE_PASSWORD = 'password123';
const EMPLOYEE_EMPID = 'DEV999';

async function updateOrCreateEmployeeTeamLeader() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    let employee = await User.findOne({ email: EMPLOYEE_EMAIL });
    if (employee) {
      employee.teamLeaderId = TEAM_LEADER_ID;
      await employee.save();
      console.log(`Updated employee ${employee.email} to teamLeaderId ${TEAM_LEADER_ID}`);
    } else {
      employee = new User({
        name: EMPLOYEE_NAME,
        email: EMPLOYEE_EMAIL,
        password: EMPLOYEE_PASSWORD,
        role: EMPLOYEE_ROLE,
        empid: EMPLOYEE_EMPID,
        status: 'Online',
        teamLeaderId: TEAM_LEADER_ID
      });
      await employee.save();
      console.log(`Created new employee ${employee.email} and assigned to teamLeaderId ${TEAM_LEADER_ID}`);
    }
  } catch (err) {
    console.error('Error updating or creating employee:', err);
  } finally {
    mongoose.connection.close();
  }
}

updateOrCreateEmployeeTeamLeader(); 