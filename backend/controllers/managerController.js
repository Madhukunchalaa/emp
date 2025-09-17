const User = require('../models/User');
const Project = require('../models/Project');
const Punch = require('../models/Punch');
const DailyUpdate = require('../models/DailyUpdate');  
const Update = require('../models/EveryUpdate');

// Get manager profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ 
      role: { $in: ['developer', 'designer', 'digital-marketing', 'employee', 'team-leader'] } 
    }).select('-password');

    const employeesWithAttendanceAndUpdate = await Promise.all(
      employees.map(async (employee) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Punch.findOne({
          employee: employee._id,
          date: today
        });

        // 🔥 Fetch the latest update for the employee
       const latestUpdate = await Update.findOne({ employee: employee._id })
  .sort({ createdAt: -1 })
  .select('update'); // Fix here

        return {
          ...employee.toObject(),
          attendance: {
            today: attendance ? {
              status: attendance.status,
              punchIn: attendance.punchIn,
              punchOut: attendance.punchOut,
              hours: attendance.hours
            } : null
          },
          latestUpdateTitle: latestUpdate ? latestUpdate.update : null,
          // Add punch data at root level for easier frontend access
          todayPunchIn: attendance ? attendance.punchIn : null,
          todayPunchOut: attendance ? attendance.punchOut : null,
          isPunchedIn: attendance && attendance.punchIn && !attendance.punchOut
        };
      })
    );

    res.json(employeesWithAttendanceAndUpdate);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
};

// Utility to calculate project progress and auto-complete
function calculateProjectProgress(project) {
  let totalTasks = 0;
  let completedTasks = 0;
  if (project.steps && project.steps.length > 0) {
    for (const step of project.steps) {
      if (step.tasks && step.tasks.length > 0) {
        totalTasks += step.tasks.length;
        completedTasks += step.tasks.filter(t => t.status === 'completed').length;
      }
    }
  }
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  // Auto-complete project if all tasks are completed
  if (totalTasks > 0 && completedTasks === totalTasks && project.status !== 'completed') {
    project.status = 'completed';
  }
  return progress;
}

// Get all projects (with steps and tasks)
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'name email')
      .populate({
        path: 'steps.tasks.assignedTo',
        select: 'name email avatar'
      })
      .sort({ deadline: 1 });
    // Calculate progress for each project
    const projectsWithProgress = projects.map(project => {
      const progress = calculateProjectProgress(project);
      return { ...project.toObject(), progress };
    });
    res.json(projectsWithProgress);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

// Get project by ID (with steps and tasks)
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate('createdBy', 'name email')
      .populate({
        path: 'steps.tasks.assignedTo',
        select: 'name email avatar'
      });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const progress = calculateProjectProgress(project);
    res.json({ ...project.toObject(), progress });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
};

// Get all tasks for a specific project (grouped by steps)
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const progress = calculateProjectProgress(project);
    res.json({ steps: project.steps, progress });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ message: 'Error fetching project tasks' });
  }
};

// Create project (with custom steps and tasks)
const createProject = async (req, res) => {
  try {
    const { title, description, deadline, priority, category, estimatedHours, steps } = req.body;
    if (!title || !description || !deadline) {
      return res.status(400).json({ message: 'Title, description, and deadline are required' });
    }
    
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ message: 'Invalid deadline date format' });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    
    if (deadlineDate < today) {
      return res.status(400).json({ message: 'Deadline must be today or a future date' });
    }
    
    const project = new Project({
      title,
      description,
      deadline: new Date(deadline),
      priority: priority || 'medium',
      category,
      estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
      createdBy: req.user.id,
      status: 'pending',
      steps: steps || []
    });
    
    calculateProjectProgress(project); // Set status if all tasks are completed
    await project.save();
    await project.populate('createdBy', 'name email');
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (err) {
    console.error('Error in createProject:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Assign a task to a step in a project
const assignTaskToEmployee = async (req, res) => {
  try {
    const { projectId, stepName, title, assignedTo } = req.body;
    if (!projectId || !stepName || !title || !assignedTo) {
      return res.status(400).json({ message: 'Project ID, step name, title, and assignedTo are required' });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // Find the step
    const step = project.steps.find(s => s.name === stepName);
    if (!step) {
      return res.status(404).json({ message: 'Step not found in project' });
    }
    // Add the task
    step.tasks.push({ title, assignedTo });
    calculateProjectProgress(project); // Update status if needed
    await project.save();

    // Emit notification to assigned employee
    const io = req.app.get('io');
    if (io && assignedTo) {
      io.to(assignedTo.toString()).emit('notification', {
        message: `A new task has been assigned to you: ${title}`
      });
    }

    res.status(201).json({ message: 'Task assigned successfully', project });
  } catch (err) {
    console.error('Error in assignTask:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Assign a project to an employee
const assignProjectToEmployee = async (req, res) => {
  try {
    const { projectId, employeeId } = req.body;
    if (!projectId || !employeeId) {
      return res.status(400).json({ message: 'Project ID and Employee ID are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Add employee to the project's team if not already there
    if (!project.team.includes(employeeId)) {
      project.team.push(employeeId);
    }
    
    await project.save();
    res.status(200).json({ message: 'Project assigned successfully', project });
  } catch (err) {
    console.error('Error in assignProjectToEmployee:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get punch records
const getPunchRecords = async (req, res) => {
  try {
    const records = await Punch.find()
      .populate('employee', 'name email')
      .sort({ date: -1, punchIn: -1 });
    res.json(records);
  } catch (error) {
    console.error('Error fetching punch records:', error);
    res.status(500).json({ message: 'Error fetching punch records' });
  }
};

// Get employee attendance
const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Verify employee exists
    const employee = await User.findOne({  role: { $in: ['developer', 'designer', 'digital-marketing', 'employee', 'team-leader'] } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Get last 30 days of attendance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendance = await Punch.find({
      employee: employeeId,
      date: { $gte: thirtyDaysAgo }
    })
    .sort({ date: -1, punchIn: -1 });

    // Calculate total hours for each record
    const attendanceWithHours = attendance.map(record => ({
      _id: record._id,
      date: record.date,
      status: record.status,
      punchIn: record.punchIn,
      punchOut: record.punchOut,
      totalHours: record.hours || 0
    }));

    res.json(attendanceWithHours);
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    res.status(500).json({ message: 'Error fetching employee attendance' });
  }
};

// Update project status
const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['Approve', 'Under Review', 'Reject'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = status;
    await project.save();
    
    // Populate assignedTo field before sending response
    await project.populate('assignedTo', 'name email');
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ message: 'Error updating project status' });
  }
};

// Get attendance history
// controllers/managerController.js
const getAttendanceHistory = async (req, res) => {
  try {
    // 1. Get all employees (excluding admin and manager)
    const employees = await User.find(
      { role: { $in: ['developer', 'designer', 'digital-marketing', 'employee', 'team-leader'] } },
      '_id name email'
    );
    const employeeIds = employees.map(emp => emp._id);

    // 2. Last 30 days (IST)
    const now = new Date();
    const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const thirtyDaysAgo = new Date(istNow);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 3. Attendance
    const attendance = await Punch.find({
      employee: { $in: employeeIds },
      date: { $gte: thirtyDaysAgo }
    })
      .populate('employee', 'name email')
      .sort({ date: -1, punchIn: -1 });

    // 4. Group by employee and format times
    const grouped = attendance.reduce((acc, record) => {
      const id = record.employee._id.toString();
      if (!acc[id]) {
        acc[id] = {
          employee: record.employee,
          totalHours: 0,
          records: []
        };
      }

      const punchInTime = record.punchIn
        ? new Date(record.punchIn).toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Kolkata',
            hour12: false
          })
        : null;

      const punchOutTime = record.punchOut
        ? new Date(record.punchOut).toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Kolkata',
            hour12: false
          })
        : null;

      const hours = record.hours || 0;
      acc[id].totalHours += hours;

      acc[id].records.push({
        _id: record._id,
        date: record.date.toISOString().split('T')[0], // YYYY-MM-DD
        status: record.status,
        punchIn: punchInTime,
        punchOut: punchOutTime,
        totalHours: hours
      });

      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ message: 'Error fetching attendance history' });
  }
};



// Get all employee daily updates
const getEmployeeDailyUpdates = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    let query = {};

    if (employeeId) {
      query.employee = employeeId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

  const updates = await DailyUpdate.find(query)
  .populate('employee', 'name email')
  .populate('project', 'title description') // ✅ populate correct path
  .sort({ date: -1 });

res.json(updates);

  } catch (error) {
    console.error('Error fetching employee daily updates:', error);
    res.status(500).json({ message: 'Error fetching employee daily updates' });
  }
};

// Get employee daily update summary
const getEmployeeUpdateSummary = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    let query = {};

    if (employeeId) {
      query.employee = employeeId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const updates = await DailyUpdate.find(query)
      .populate('employee', 'name email')
      .populate('tasks.project', 'title description')
      .sort({ date: -1 });

    // Calculate summary statistics
    const summary = {
      totalDays: updates.length,
      totalHours: updates.reduce((sum, update) => sum + update.totalHours, 0),
      averageHoursPerDay: updates.length > 0 
        ? updates.reduce((sum, update) => sum + update.totalHours, 0) / updates.length 
        : 0,
      projectStats: {},
      statusDistribution: {
        'Not Started': 0,
        'In Progress': 0,
        'Completed': 0
      }
    };

    // Calculate project-specific statistics
    updates.forEach(update => {
      update.tasks.forEach(task => {
        const projectId = task.project._id.toString();
        if (!summary.projectStats[projectId]) {
          summary.projectStats[projectId] = {
            title: task.project.title,
            totalHours: 0,
            statusCounts: {
              'Not Started': 0,
              'In Progress': 0,
              'Completed': 0
            }
          };
        }
        summary.projectStats[projectId].totalHours += task.hoursSpent;
        summary.projectStats[projectId].statusCounts[task.status]++;
        summary.statusDistribution[task.status]++;
      });
    });

    res.json({
      updates,
      summary
    });
  } catch (error) {
    console.error('Error fetching employee update summary:', error);
    res.status(500).json({ message: 'Error fetching employee update summary' });
  }
};

// Update manager profile (placeholder)
const updateProfile = async (req, res) => {
  res.status(200).json({ message: 'Manager profile updated (placeholder)' });
};

// Get employee profile (placeholder)
const getEmployeeProfile = async (req, res) => {
  res.status(200).json({ message: 'Employee profile (placeholder)' });
};

// Get project-based updates
const getProjectUpdates = async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.query;
    let query = {};

    if (projectId) {
      query['tasks.project'] = projectId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const updates = await DailyUpdate.find(query)
      .populate('employee', 'name email')
      .populate('tasks.project', 'title description')
      .sort({ date: -1 });

    // Calculate project summary
    const projectSummary = {
      totalUpdates: updates.length,
      totalHours: updates.reduce((sum, update) => sum + update.totalHours, 0),
      averageHoursPerDay: updates.length > 0 
        ? updates.reduce((sum, update) => sum + update.totalHours, 0) / updates.length 
        : 0,
      employeeStats: {},
      statusDistribution: {
        'Not Started': 0,
        'In Progress': 0,
        'Completed': 0
      }
    };

    // Calculate employee-specific statistics
    updates.forEach(update => {
      const employeeId = update.employee._id.toString();
      if (!projectSummary.employeeStats[employeeId]) {
        projectSummary.employeeStats[employeeId] = {
          name: update.employee.name,
          email: update.employee.email,
          totalHours: 0,
          totalUpdates: 0
        };
      }
      projectSummary.employeeStats[employeeId].totalHours += update.totalHours;
      projectSummary.employeeStats[employeeId].totalUpdates++;

      update.tasks.forEach(task => {
        if (task.project && task.project._id.toString() === projectId) {
          projectSummary.statusDistribution[task.status]++;
        }
      });
    });

    res.json({
      updates,
      projectSummary
    });
  } catch (error) {
    console.error('Error fetching project updates:', error);
    res.status(500).json({ message: 'Error fetching project updates' });
  }
};
const getAllEmployeeUpdates = async (req, res) => {
  try {
    const { startDate, endDate, status, employeeId } = req.query;
    
    let query = {};
    
    // Add date filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Add status filter if provided
    if (status) {
      query.approvalStatus = status;
    }
    
    // Add employee filter if provided
    if (employeeId) {
      query.employee = employeeId;
    }

    const updates = await DailyUpdate.find(query)
      .populate('employee', 'name email role')
      .populate('project', 'title description')
      .populate('approvedBy', 'name')
      .sort({ date: -1, createdAt: -1 });

    res.json({ updates });
  } catch (error) {
    console.error('Error fetching all employee updates:', error);
    res.status(500).json({ message: 'Error fetching updates' });
  }
};

// Approve or reject daily update
const approveRejectUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be either "approve" or "reject"' });
    }

    const approvalStatus = action === 'approve' ? 'Approved' : 'Rejected';
    const updateData = {
      approvalStatus,
      managerFeedback: reason || `Status updated to ${approvalStatus}`,
      approvedBy: req.user.id,
      approvedAt: new Date()
    };

    const updatedDocument = await DailyUpdate.findByIdAndUpdate(
      updateId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate([
      { path: 'employee', select: 'name email' },
      { path: 'project', select: 'title description' },
      { path: 'approvedBy', select: 'name' }
    ]);

    if (!updatedDocument) {
      return res.status(404).json({ message: 'Update not found' });
    }

    res.json({
      message: `Update ${action}d successfully`,
      update: updatedDocument
    });
  } catch (error) {
    console.error('Error approving/rejecting update:', error);
    // Provide a more specific error if it's a validation issue
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: `Validation failed: ${error.message}` });
    }
    res.status(500).json({ message: 'Error processing update' });
  }
};

const approveRejectTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected".' });
    }

    const project = await Project.findOne({ "steps.tasks._id": taskId });

    if (!project) {
      return res.status(404).json({ message: 'Task not found in any project.' });
    }

    let task, step;
    for (const s of project.steps) {
      task = s.tasks.id(taskId);
      if (task) {
        step = s;
        break;
      }
    }

    if (task) {
      task.status = status;
      await project.save();

      // Emit notification to assigned employee
      const io = req.app.get('io');
      if (io && task.assignedTo) {
        io.to(task.assignedTo.toString()).emit('notification', {
          message: `Your task "${task.title}" has been ${status}.`
        });
      }

      res.json({ message: `Task ${status} successfully.`, task });
    } else {
      res.status(404).json({ message: 'Task not found.' });
    }
  } catch (error) {
    console.error('Error updating task approval status:', error);
    res.status(500).json({ message: 'Error updating task approval status' });
  }
};

// Update task status within a project
const updateProjectTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (pending, in-progress, completed)' });
    }

    // Find the project containing this task
    const project = await Project.findOne({ "steps.tasks._id": taskId });
    if (!project) {
      return res.status(404).json({ message: 'Task not found in any project' });
    }

    // Find and update the specific task
    let taskFound = false;
    let assignedTo = null;
    let taskTitle = '';
    for (const step of project.steps) {
      const task = step.tasks.id(taskId);
      if (task) {
        task.status = status;
        assignedTo = task.assignedTo;
        taskTitle = task.title;
        taskFound = true;
        break;
      }
    }

    if (!taskFound) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Recalculate project progress
    const progress = calculateProjectProgress(project);
    
    // Save the project
    await project.save();
    
    // Populate the project data for response
    await project.populate('createdBy', 'name email');
    await project.populate({
      path: 'steps.tasks.assignedTo',
      select: 'name email avatar'
    });

    // Emit notification to assigned employee
    const io = req.app.get('io');
    if (io && assignedTo) {
      io.to(assignedTo.toString()).emit('notification', {
        message: `Your task "${taskTitle}" status has been updated to ${status}.`
      });
    }

    res.json({ 
      message: `Task status updated to ${status}`, 
      project: { ...project.toObject(), progress },
      updatedTaskId: taskId,
      newStatus: status
    });
  } catch (error) {
    console.error('Error updating project task status:', error);
    res.status(500).json({ message: 'Error updating task status' });
  }
};

// Get all employee updates (for /api/manager/updates)
const getEmployeeUpdates = async (req, res) => {
  try {
    const updates = await DailyUpdate.find()
      .populate('employee', 'name email')
      .populate('project', 'title description')
      .sort({ date: -1 });
    res.json(updates);
  } catch (error) {
    console.error('Error fetching employee updates:', error);
    res.status(500).json({ message: 'Error fetching employee updates' });
  }
};

const getManagerDashboard = async (req, res) => {
  try {
    const projectStats = await Project.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const totalProjects = await Project.countDocuments();
    const totalEmployees = await User.countDocuments({ role: { $in: ['developer', 'designer', 'digital-marketing', 'employee', 'team-leader'] } });

    const recentProjects = await Project.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalProjects,
      totalEmployees,
      projectStats,
      recentProjects
    });
  } catch (error) {
    console.error('Error fetching manager dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

// Get team leaders for project assignment
const getTeamLeaders = async (req, res) => {
  try {
    const teamLeaders = await User.find({ role: 'team-leader' }).select('-password');
    
    // Get additional info for each team leader
    const teamLeadersWithInfo = await Promise.all(
      teamLeaders.map(async (teamLeader) => {
        // Count team members
        const teamMemberCount = await User.countDocuments({ teamLeaderId: teamLeader._id });
        
        // Count active projects
        const activeProjectCount = await Project.countDocuments({ 
          assignedTo: teamLeader._id,
          status: { $in: ['active', 'in-progress', 'assigned'] }
        });
        
        return {
          ...teamLeader.toObject(),
          teamMemberCount,
          activeProjectCount
        };
      })
    );
    
    res.json(teamLeadersWithInfo);
  } catch (error) {
    console.error('Error fetching team leaders:', error);
    res.status(500).json({ message: 'Error fetching team leaders' });
  }
};

// Assign project to team leader (new hierarchy: Manager → Team Leader → Employee)
const assignProjectToTeamLeader = async (req, res) => {
  try {
    const { projectId, teamLeaderId } = req.body;
    
    if (!projectId || !teamLeaderId) {
      return res.status(400).json({ message: 'Project ID and Team Leader ID are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const teamLeader = await User.findById(teamLeaderId);
    if (!teamLeader || teamLeader.role !== 'team-leader') {
      return res.status(404).json({ message: 'Team Leader not found' });
    }

    // Assign project to team leader
    project.assignedTo = teamLeaderId;
    project.status = 'assigned';
    project.assignedBy = req.user.id; // Manager who assigned the project
    project.assignedAt = new Date();
    
    await project.save();
    
    // Populate the response
    await project.populate('assignedTo', 'name email');
    await project.populate('createdBy', 'name email');
    await project.populate('assignedBy', 'name email');

    // Emit notification to team leader
    const io = req.app.get('io');
    if (io && teamLeaderId) {
      io.to(teamLeaderId.toString()).emit('notification', {
        message: `A new project "${project.title}" has been assigned to you by your manager.`
      });
    }

    res.status(200).json({ 
      message: 'Project assigned to team leader successfully', 
      project 
    });
  } catch (err) {
    console.error('Error in assignProjectToTeamLeader:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get projects assigned to team leaders by this manager
const getTeamLeaderProjects = async (req, res) => {
  try {
    const managerId = req.user.id;
    
    // Get projects assigned by this manager to team leaders
    const projects = await Project.find({
      assignedBy: managerId,
      assignedTo: { $exists: true, $ne: null }
    })
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email')
    .populate('assignedBy', 'name email')
    .sort({ assignedAt: -1 });

    // Add team member count and progress for each project
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const progress = calculateProjectProgress(project);
        
        // Count team members under the team leader
        const teamMemberCount = await User.countDocuments({ 
          teamLeaderId: project.assignedTo._id 
        });
        
        // Get team leader's team members
        const teamMembers = await User.find({ 
          teamLeaderId: project.assignedTo._id 
        }).select('name email role');
        
        return {
          ...project.toObject(),
          progress,
          teamMemberCount,
          teamMembers
        };
      })
    );

    res.json(projectsWithDetails);
  } catch (error) {
    console.error('Error fetching team leader projects:', error);
    res.status(500).json({ message: 'Error fetching team leader projects' });
  }
};

module.exports = {
  getAllEmployeeUpdates,
  getProfile,
  getEmployees,
  getProjects,
  createProject,
  assignProjectToEmployee,
  assignTaskToEmployee,
  updateProjectStatus,
  getProjectTasks,
  getProjectById,
  getPunchRecords,
  getEmployeeAttendance,
  getAttendanceHistory,
  getEmployeeDailyUpdates,
  getEmployeeUpdateSummary,
  updateProfile,
  getEmployeeProfile,
  getProjectUpdates,
  approveRejectUpdate,
  approveRejectTask,
  updateProjectTaskStatus,
  getEmployeeUpdates,
  getManagerDashboard,
  getTeamLeaders,
  assignProjectToTeamLeader,
  getTeamLeaderProjects
};