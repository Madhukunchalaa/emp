const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/DesignTask');
const DailyUpdate = require('../models/DailyUpdate');
const Punch = require('../models/Punch');

// Get available employees for task assignment
const getAvailableEmployees = async (req, res) => {
  try {
    // Return all employees (excluding admin and manager)
    const availableEmployees = await User.find({
      role: { $in: ['developer', 'designer', 'digital-marketing', 'employee', 'team-leader'] }
    }).select('-password');
    console.log('Available employees found (all):', availableEmployees.length);
    res.json(availableEmployees);
  } catch (error) {
    console.error('Error fetching available employees:', error);
    res.status(500).json({ error: 'Failed to fetch available employees' });
  }
};

// Assign employee to team leader
const assignEmployeeToTeam = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const teamLeaderId = req.user._id;
    
    // Verify employee exists and is available
    const employee = await User.findOne({
      _id: employeeId,
      role: 'developer'
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Update employee to be assigned to this team leader
    const updatedEmployee = await User.findByIdAndUpdate(
      employeeId,
      { teamLeaderId },
      { new: true }
    ).select('-password');
    
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error assigning employee to team:', error);
    res.status(500).json({ error: 'Failed to assign employee to team' });
  }
};

// Get projects assigned to team leader by managers
const getAssignedProjects = async (req, res) => {
  try {
    const teamLeaderId = req.user._id;
    
    // Get projects assigned to this team leader (both directly and through manager assignment)
    const assignedProjects = await Project.find({ 
      assignedTo: teamLeaderId,
      status: { $in: ['assigned', 'active', 'in_progress', 'pending'] }
    }).populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
    
    res.json(assignedProjects);
  } catch (error) {
    console.error('Error fetching assigned projects:', error);
    res.status(500).json({ error: 'Failed to fetch assigned projects' });
  }
};

// Get team leader dashboard data
const getTeamLeaderDashboard = async (req, res) => {
  try {
    const teamLeaderId = req.user._id;
    
    // Get team members
    const teamMembers = await User.find({ teamLeaderId }).select('-password');
    
    // Get projects assigned to team leader (both directly and through manager assignment)
    const assignedProjects = await Project.find({ 
      assignedTo: teamLeaderId,
      status: { $in: ['assigned', 'active', 'in_progress', 'pending'] }
    }).populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
    
    // Get tasks assigned to team members
    const teamTasks = await Task.find({
      assignedTo: { $in: teamMembers.map(member => member._id) }
    }).populate('assignedTo', 'name email role');
    
    // Get daily updates from team members
    const teamUpdates = await DailyUpdate.find({
      userId: { $in: teamMembers.map(member => member._id) }
    }).populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Calculate stats
    const stats = {
      totalTeamMembers: teamMembers.length,
      activeProjects: assignedProjects.length,
      pendingTasks: teamTasks.filter(task => task.status === 'pending').length,
      completedTasks: teamTasks.filter(task => task.status === 'completed').length,
      inProgressTasks: teamTasks.filter(task => task.status === 'in_progress').length,
      totalTasks: teamTasks.length
    };
    
    const teamLeader = await User.findById(teamLeaderId).select('-password');
    let managers = [];
    if (teamLeader && teamLeader.managerIds && teamLeader.managerIds.length > 0) {
      managers = await User.find({ _id: { $in: teamLeader.managerIds } }).select('name email');
      managers = managers.map(mgr => ({ _id: mgr._id, name: mgr.name, email: mgr.email }));
    }
    
    res.json({
      stats,
      teamMembers,
      assignedProjects,
      teamTasks,
      teamUpdates,
      managers
    });
  } catch (error) {
    console.error('Error fetching team leader dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// Get team members
const getTeamMembers = async (req, res) => {
  try {
    const teamLeaderId = req.user._id;
    const teamMembers = await User.find({ teamLeaderId }).select('-password');
    
    res.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

// Assign task to team member
const assignTaskToTeamMember = async (req, res) => {
  try {
    const { taskId, teamMemberId, deadline, priority } = req.body;
    const teamLeaderId = req.user._id;
    
    // Verify team member belongs to team leader
    const teamMember = await User.findOne({ 
      _id: teamMemberId, 
      teamLeaderId 
    });
    
    if (!teamMember) {
      return res.status(403).json({ error: 'Team member not found or not authorized' });
    }
    
    // Update task assignment
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        assignedTo: teamMemberId,
        deadline: deadline,
        priority: priority || 'medium',
        status: 'assigned'
      },
      { new: true }
    ).populate('assignedTo', 'name email role');
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ error: 'Failed to assign task' });
  }
};

// Create new task for team member
const createTaskForTeamMember = async (req, res) => {
  try {
    const { title, description, teamMemberId, deadline, priority, projectId } = req.body;
    const teamLeaderId = req.user._id;
    
    console.log('Creating task with data:', { title, description, teamMemberId, deadline, priority, projectId });
    
    // Verify team member belongs to team leader
    const teamMember = await User.findOne({ 
      _id: teamMemberId, 
      teamLeaderId 
    });
    
    if (!teamMember) {
      console.log('Team member not found or not authorized:', { teamMemberId, teamLeaderId });
      return res.status(403).json({ error: 'Team member not found or not authorized' });
    }
    
    console.log('Team member found:', teamMember.name);
    
    // Create the new task with correct fields for DesignTask model
    const newTask = new Task({
      content: description ? `${title}: ${description}` : title, // Combine title and description for clarity
      assignedTo: teamMemberId,
      assignedBy: teamLeaderId,
      dueDate: deadline, // Use deadline as dueDate
      priority: priority || 'medium',
      status: 'pending', // Use allowed enum value
      // Remove projectId as it's not in the model schema
    });
    
    console.log('Task object to save:', newTask);
    
    await newTask.save();
    
    const populatedTask = await Task.findById(newTask._id)
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');
    
    console.log('Task created successfully:', populatedTask._id);
    
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task', details: error.message });
  }
};

// Get tasks for team members
const getTeamTasks = async (req, res) => {
  try {
    const teamLeaderId = req.user._id;
    const teamMembers = await User.find({ teamLeaderId }).select('_id');
    const teamMemberIds = teamMembers.map(member => member._id);
    
    const tasks = await Task.find({
      assignedTo: { $in: teamMemberIds }
    }).populate('assignedTo', 'name email role')
    .populate('assignedBy', 'name email role')
    .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching team tasks:', error);
    res.status(500).json({ error: 'Failed to fetch team tasks' });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, comment } = req.body;
    const teamLeaderId = req.user._id;
    
    // Verify task belongs to team member
    const task = await Task.findById(taskId).populate('assignedTo');
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const teamMember = await User.findOne({ 
      _id: task.assignedTo._id, 
      teamLeaderId 
    });
    
    if (!teamMember) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { 
        status,
        comment: comment || task.comment,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('assignedTo', 'name email role');
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

// Get team member performance report
const getTeamMemberReport = async (req, res) => {
  try {
    const { teamMemberId } = req.params;
    const teamLeaderId = req.user._id;
    
    // Verify team member belongs to team leader
    const teamMember = await User.findOne({ 
      _id: teamMemberId, 
      teamLeaderId 
    });
    
    if (!teamMember) {
      return res.status(403).json({ error: 'Team member not found or not authorized' });
    }
    
    // Get tasks for this team member
    const tasks = await Task.find({ assignedTo: teamMemberId })
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    
    // Get daily updates
    const updates = await DailyUpdate.find({ userId: teamMemberId })
      .sort({ createdAt: -1 })
      .limit(30);
    
    // Calculate performance metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
    
    const report = {
      teamMember: {
        _id: teamMember._id,
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role
      },
      performance: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        completionRate: parseFloat(completionRate)
      },
      tasks,
      updates
    };
    
    res.json(report);
  } catch (error) {
    console.error('Error generating team member report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Get team performance summary for manager
const getTeamPerformanceSummary = async (req, res) => {
  try {
    const teamLeaderId = req.user._id;
    
    // Get all team members
    const teamMembers = await User.find({ teamLeaderId }).select('-password');
    
    // Get all tasks for team members
    const teamMemberIds = teamMembers.map(member => member._id);
    const allTasks = await Task.find({
      assignedTo: { $in: teamMemberIds }
    });
    
    // Calculate team performance
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.status === 'completed').length;
    const pendingTasks = allTasks.filter(task => task.status === 'pending').length;
    const inProgressTasks = allTasks.filter(task => task.status === 'in_progress').length;
    const teamCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
    
    // Get recent updates
    const recentUpdates = await DailyUpdate.find({
      userId: { $in: teamMemberIds }
    }).populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(10);
    
    const summary = {
      teamInfo: {
        teamLeader: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email
        },
        totalMembers: teamMembers.length,
        teamMembers: teamMembers.map(member => ({
          _id: member._id,
          name: member.name,
          email: member.email,
          role: member.role
        }))
      },
      performance: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        completionRate: parseFloat(teamCompletionRate)
      },
      recentUpdates
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error generating team performance summary:', error);
    res.status(500).json({ error: 'Failed to generate team summary' });
  }
};

// Assign project to team member
const assignProjectToTeamMember = async (req, res) => {
  try {
    const { projectId, teamMemberId } = req.body;
    const teamLeaderId = req.user._id;
    
    // Verify team member belongs to team leader
    const teamMember = await User.findOne({ 
      _id: teamMemberId, 
      teamLeaderId 
    });
    
    if (!teamMember) {
      return res.status(403).json({ error: 'Team member not found or not authorized' });
    }
    
    // Update project assignment
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        assignedTo: teamMemberId,
        status: 'assigned'
      },
      { new: true }
    ).populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role');
    
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error assigning project:', error);
    res.status(500).json({ error: 'Failed to assign project' });
  }
};

// Punch in for team leader
const punchIn = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const existingPunch = await Punch.findOne({
      employee: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    if (existingPunch) {
      return res.status(400).json({ message: 'Already punched in today' });
    }
    const punch = new Punch({
      employee: req.user.id,
      punchIn: new Date(),
      date: startOfDay,
      status: new Date().getHours() >= 9 ? 'Late' : 'Present'
    });
    await punch.save();
    const user = await User.findById(req.user.id);
    if (user) {
      user.status = 'Online';
      await user.save();
    }
    return res.status(201).json(punch);
  } catch (err) {
    console.error('Error in punchIn:', err.stack);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Already punched in today' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Punch out for team leader
const punchOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const punch = await Punch.findOne({
      employee: req.user.id,
      date: today,
      punchOut: { $exists: false }
    });
    if (!punch) {
      return res.status(400).json({ message: 'No active punch in record found for today' });
    }
    const punchOutTime = new Date();
    punch.punchOut = punchOutTime;
    const diffMs = punchOutTime - punch.punchIn;
    punch.hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    await punch.save();
    const user = await User.findById(req.user.id);
    if (user) {
      user.status = 'Offline';
      await user.save();
    }
    res.json({ message: 'Punched out successfully', punch });
  } catch (err) {
    console.error('Error in punchOut:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get team for a project
const getProjectTeam = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate('team', 'name email role');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project.team);
  } catch (error) {
    console.error('Error fetching project team:', error);
    res.status(500).json({ error: 'Failed to fetch project team' });
  }
};

// Add a member to a project's team
const addMemberToProjectTeam = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { empId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    if (!project.team.includes(empId)) {
      project.team.push(empId);
      await project.save();
    }
    const updatedProject = await Project.findById(projectId).populate('team', 'name email role');
    res.json(updatedProject.team);
  } catch (error) {
    console.error('Error adding member to project team:', error);
    res.status(500).json({ error: 'Failed to add member to project team' });
  }
};

// Remove a member from a project's team
const removeMemberFromProjectTeam = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { empId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    project.team = project.team.filter(id => id.toString() !== empId);
    await project.save();
    const updatedProject = await Project.findById(projectId).populate('team', 'name email role');
    res.json(updatedProject.team);
  } catch (error) {
    console.error('Error removing member from project team:', error);
    res.status(500).json({ error: 'Failed to remove member from project team' });
  }
};

// Get activity log for team leader
const getActivityLog = async (req, res) => {
  try {
    const teamLeaderId = req.user._id;
    const teamMembers = await User.find({ teamLeaderId }).select('_id');
    const teamMemberIds = teamMembers.map(member => member._id);
    
    // Get recent activities from team members
    const activities = await DailyUpdate.find({
      userId: { $in: teamMemberIds }
    }).populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(20);
    
    // Format activities for display
    const activityLog = activities.map(activity => ({
      message: `${activity.userId.name} updated: ${activity.content}`,
      timestamp: activity.createdAt
    }));
    
    res.json(activityLog);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
};

// Get tasks for a specific team member
const getMemberTasks = async (req, res) => {
  try {
    const { memberId } = req.params;
    const teamLeaderId = req.user._id;
    
    // Verify team member belongs to team leader
    const teamMember = await User.findOne({ 
      _id: memberId, 
      teamLeaderId 
    });
    
    if (!teamMember) {
      return res.status(403).json({ error: 'Team member not found or not authorized' });
    }
    
    // Get tasks for this team member
    const tasks = await Task.find({ assignedTo: memberId })
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching member tasks:', error);
    res.status(500).json({ error: 'Failed to fetch member tasks' });
  }
};

module.exports = {
  getTeamLeaderDashboard,
  getTeamMembers,
  assignTaskToTeamMember,
  createTaskForTeamMember,
  getTeamTasks,
  updateTaskStatus,
  getTeamMemberReport,
  getTeamPerformanceSummary,
  assignProjectToTeamMember,
  getAvailableEmployees,
  assignEmployeeToTeam,
  getAssignedProjects,
  punchIn,
  punchOut,
  getProjectTeam,
  addMemberToProjectTeam,
  removeMemberFromProjectTeam,
  getActivityLog,
  getMemberTasks,
}; 