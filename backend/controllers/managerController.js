const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
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
    const employees = await User.find({ role: { $in: ['developer', 'designer'] } }).select('-password');

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
  latestUpdateTitle: latestUpdate ? latestUpdate.update : null // Fix here
};
      })
    );

    res.json(employeesWithAttendanceAndUpdate);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
};


// Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('assignedTo', 'name email')
      .sort({ deadline: 1 });

    // Get tasks for each project
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ projectId: project._id })
          .populate('assignedTo', 'name email')
          .populate('assignedBy', 'name email');
        
        return {
          ...project.toObject(),
          tasks: tasks
        };
      })
    );

    res.json(projectsWithTasks);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
};

// Get tasks for a specific project
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get tasks for the project
    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      project,
      tasks
    });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ message: 'Error fetching project tasks' });
  }
};

// Create project (without assignment)
const createProject = async (req, res) => {
  try {
    const { title, description, deadline, priority, category, estimatedHours } = req.body;

    // Validate required fields
    if (!title || !description || !deadline) {
      return res.status(400).json({ 
        message: 'Title, description, and deadline are required'
      });
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(deadline);
    if (deadlineDate < new Date()) {
      return res.status(400).json({ 
        message: 'Deadline must be in the future' 
      });
    }

    // Create new project without assignment
    const project = new Project({
      title,
      description,
      deadline: deadlineDate,
      priority: priority || 'medium',
      category,
      estimatedHours,
      createdBy: req.user.id,
      status: 'pending'
    });

    await project.save();

    // Populate the createdBy field
    await project.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (err) {
    console.error('Error in createProject:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Assign project to employee
const assignProject = async (req, res) => {
  try {
    const { projectId, assignedTo } = req.body;

    // Validate required fields
    if (!projectId || !assignedTo) {
      return res.status(400).json({ 
        message: 'Project ID and assigned employee are required'
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        message: 'Project not found' 
      });
    }

    // Check if assigned employee exists and is an employee
    const validRoles = ['employee', 'developer', 'designer'];
    const employee = await User.findOne({ 
      _id: assignedTo, 
      role: { $in: validRoles }
    });
    
    if (!employee) {
      return res.status(404).json({ 
        message: 'Employee not found or is not an employee' 
      });
    }

    // Update project with assignment
    project.assignedTo = assignedTo;
    project.status = 'active';
    await project.save();

    // Populate the assignedTo field
    await project.populate('assignedTo', 'name email');

    res.json({
      message: 'Project assigned successfully',
      project
    });
  } catch (err) {
    console.error('Error in assignProject:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Assign task to employee
const assignTask = async (req, res) => {
  try {
    console.log('assignTask called with body:', req.body); // Debug log
    
    const { title, description, projectId, assignedTo, priority, estimatedHours, assignmentType, scheduledDate, scheduledTime } = req.body;

    // Validate required fields
    if (!title || !description || !projectId || !assignedTo) {
      console.log('Validation failed - missing fields:', { title: !!title, description: !!description, projectId: !!projectId, assignedTo: !!assignedTo }); // Debug log
      return res.status(400).json({ 
        message: 'Title, description, project ID, and assigned employee are required'
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    console.log('Project found:', project ? 'Yes' : 'No'); // Debug log
    
    if (!project) {
      return res.status(404).json({ 
        message: 'Project not found' 
      });
    }

    // Check if assigned employee exists and is an employee
    const validRoles = ['employee', 'developer', 'designer'];
    const employee = await User.findOne({ 
      _id: assignedTo, 
      role: { $in: validRoles }
    });
    
    console.log('Employee found:', employee ? 'Yes' : 'No', employee ? `Role: ${employee.role}` : ''); // Debug log
    
    if (!employee) {
      return res.status(404).json({ 
        message: 'Employee not found or is not an employee' 
      });
    }

    // Calculate deadline based on assignment type
    let deadline;
    if (assignmentType === 'schedule' && scheduledDate && scheduledTime) {
      deadline = new Date(`${scheduledDate}T${scheduledTime}`);
    } else {
      // Use project deadline or set to 7 days from now
      deadline = project.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    // Create task using the Task model
    const task = new Task({
      title,
      description,
      projectId,
      assignedTo,
      assignedBy: req.user.id,
      priority: priority || 'medium',
      estimatedHours: estimatedHours || 0,
      deadline,
      status: assignmentType === 'now' ? 'assigned' : 'pending'
    });

    console.log('Task object created:', task); // Debug log

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('projectId', 'title');

    console.log('Task saved successfully'); // Debug log

    res.status(201).json({
      message: 'Task assigned successfully',
      task
    });
  } catch (err) {
    console.error('Error in assignTask:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
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
    const employee = await User.findOne({  role: { $in: ['developer', 'designer'] } });
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
const getAttendanceHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Verify employee exists
    const employee = await User.findOne({ 
    _id: employeeId, 
    role: { $in: [ 'developer', 'designer'] } 
 });
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

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    await task.save();

    res.json({ message: `Task status updated to ${status}`, task });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Error updating task status' });
  }
};

module.exports = {
  getAllEmployeeUpdates,
  getProfile,
  getEmployees,
  getProjects,
  createProject,
  assignProject,
  assignTask,
  getPunchRecords,
  getEmployeeAttendance,
  updateProjectStatus,
  getAttendanceHistory,
  getEmployeeDailyUpdates,
  getEmployeeUpdateSummary,
  updateProfile,
  getEmployeeProfile,
  getProjectUpdates,
  approveRejectUpdate,
  getProjectTasks,
  getProjectById,
  updateTaskStatus
};