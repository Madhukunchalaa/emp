const Punch = require('../models/Punch');
const Project = require('../models/Project');
const User = require('../models/User');
const DailyUpdate = require('../models/DailyUpdate');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get employee profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//punchin
exports.punchIn = async (req, res) => {
  try {
    console.log('=== PUNCH IN DEBUG ===');
    console.log('req.user:', req.user);
    console.log('req.headers:', req.headers.authorization);
    console.log('======================');

    // Validate req.user
    if (!req.user || !req.user.id) {
      console.log('User validation failed:', { user: req.user });
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    console.log('Punch In API hit, user:', req.user.id);
    console.log('Date range:', startOfDay, endOfDay);

    // Check if already punched in today
    const existingPunch = await Punch.findOne({
      employee: req.user.id,  // ← Make sure this is req.user.id
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingPunch) {
      return res.status(400).json({ message: 'Already punched in today' });
    }

    // Create new punch record
    const punch = new Punch({
      employee: req.user.id,  // ← Make sure this is req.user.id, not req.userId
      punchIn: new Date(),
      date: startOfDay,
      status: new Date().getHours() >= 9 ? 'Late' : 'Present'
    });

    console.log('About to save punch:', punch); // Add this debug log

    await punch.save();
    return res.status(201).json(punch);
  } catch (err) {
    console.error('Error in punchIn:', err.stack);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Already punched in today' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Punch out
exports.punchOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const punch = await Punch.findOne({
      employee: req.user.user.id,
      date: today
    });

    if (!punch) {
      return res.status(400).json({ message: 'No punch in record found for today' });
    }

    if (punch.punchOut) {
      return res.status(400).json({ message: 'Already punched out today' });
    }

    punch.punchOut = new Date();
    await punch.save();
    res.json(punch);
  } catch (err) {
    console.error('Error in punchOut:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get attendance
exports.getAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's punch record
    const todayPunch = await Punch.findOne({
      employee: req.user.id,
      date: today
    });

    // Get last 30 days of attendance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await Punch.find({
      employee: req.user.id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    res.json({
      today: todayPunch,
      history: history
    });
  } catch (err) {
    console.error('Error in getAttendance:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get assigned projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ assignedTo: req.user.id })
      .sort({ deadline: 1 })
      .lean(); // Use lean() for better performance
    
    // Ensure we always return an array with all necessary fields
    const formattedProjects = projects.map(project => ({
      _id: project._id,
      title: project.title || 'Untitled Project',
      description: project.description || '',
      status: project.status || 'Not Started',
      deadline: project.deadline,
      comment: project.comment || '',
      assignedTo: project.assignedTo,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));
    
    console.log('Found projects:', formattedProjects);
    res.json(formattedProjects);
  } catch (err) {
    console.error('Error in getProjects:', err);
    res.status(500).json({ message: 'Server error', projects: [] }); // Return empty array on error
  }
};

// Update project status
exports.updateProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    console.log('Updating project status:', { projectId, status });

    // Validate status
    const validStatuses = ['Not Started', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: Not Started, In Progress, Completed' 
      });
    }

    // Find and update the project
    const project = await Project.findOneAndUpdate(
      {
        _id: projectId,
        assignedTo: req.user.id
      },
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found or you are not assigned to it' });
    }

    console.log('Project updated successfully:', project);
    res.json(project);
  } catch (err) {
    console.error('Error in updateProjectStatus:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Update project comment
exports.updateProjectComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const project = await Project.findOne({
      _id: id,
      assignedTo: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.comment = comment;
    await project.save();

    res.json(project);
  } catch (err) {
    console.error('Error in updateProjectComment:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Assign project to employee
exports.assignProject = async (req, res) => {
  try {
    const { title, description, deadline, assignedTo } = req.body;

    // Validate required fields
    if (!title || !description || !deadline || !assignedTo) {
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: {
          title: !title,
          description: !description,
          deadline: !deadline,
          assignedTo: !assignedTo
        }
      });
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(deadline);
    if (deadlineDate < new Date()) {
      return res.status(400).json({ 
        message: 'Deadline must be in the future' 
      });
    }

    // Check if assigned employee exists and is an employee
    const employee = await User.findOne({ 
      _id: assignedTo, 
      role: 'employee' 
    });
    
    if (!employee) {
      return res.status(404).json({ 
        message: 'Employee not found or is not an employee' 
      });
    }

    // Create new project
    const project = new Project({
      title,
      description,
      deadline: deadlineDate,
      assignedTo,
      createdBy: req.user.id,
      status: 'Not Started'
    });

    await project.save();

    // Populate the assignedTo and createdBy fields
    await project.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      message: 'Project assigned successfully',
      project
    });
  } catch (err) {
    console.error('Error in assignProject:', err);
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

// Get punch records (optionally filter by employee or date)
exports.getPunchRecords = async (req, res) => {
  try {
    const { userId, date } = req.query;
    let filter = {};
    if (userId) filter.userId = userId;
    if (date) {
      const d = new Date(date);
      d.setHours(0,0,0,0);
      filter.date = d;
    }
    const punches = await Punch.find(filter).populate('userId', 'name email employeeID');
    res.json(punches);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all projects (for tracking)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('assignedTo', 'name email employeeID')
      .populate('assignedBy', 'name email employeeID');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Submit daily update
exports.submitDailyUpdate = async (req, res) => {
  try {
    const { tasks, totalHours, comments } = req.body;

    // Validate required fields
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ message: 'Tasks are required' });
    }

    if (typeof totalHours !== 'number' || totalHours < 0 || totalHours > 24) {
      return res.status(400).json({ message: 'Total hours must be between 0 and 24' });
    }

    // Validate each task
    for (const task of tasks) {
      if (!task.project || !task.status || !task.hoursSpent || !task.description) {
        return res.status(400).json({ 
          message: 'Each task must have project, status, hoursSpent, and description' 
        });
      }
    }

    // Create new daily update
    const dailyUpdate = new DailyUpdate({
      employee: req.user.id,
      date: new Date(),
      tasks,
      totalHours,
      comments: comments || ''
    });

    await dailyUpdate.save();
    console.log('Daily update saved:', dailyUpdate);

    res.status(201).json({
      message: 'Daily update submitted successfully',
      dailyUpdate
    });
  } catch (err) {
    console.error('Error in submitDailyUpdate:', err);
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

// Get employee's daily updates
exports.getDailyUpdates = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { startDate, endDate } = req.query;

    let query = { employee: employeeId };

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

    res.json(updates);
  } catch (error) {
    console.error('Error fetching daily updates:', error);
    res.status(500).json({ message: 'Error fetching daily updates' });
  }
};

// Get today's update
exports.getTodayUpdate = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const update = await DailyUpdate.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    })
    .populate('employee', 'name email')
    .populate('tasks.project', 'title description');

    res.json(update || { message: 'No update submitted for today' });
  } catch (error) {
    console.error('Error fetching today\'s update:', error);
    res.status(500).json({ message: 'Error fetching today\'s update' });
  }
};

// Update employee profile (placeholder)
exports.updateProfile = async (req, res) => {
  res.status(200).json({ message: 'Profile updated (placeholder)' });
};

// Get employee updates for manager
exports.getEmployeeUpdates = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate dates
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    const end = endDate ? new Date(endDate) : new Date();

    // Get updates
    const updates = await DailyUpdate.find({
      employee: employeeId,
      date: { $gte: start, $lte: end }
    })
    .sort({ date: -1 })
    .populate('employee', 'name email')
    .lean();

    // Calculate summary
    const summary = {
      totalHours: updates.reduce((sum, update) => sum + update.totalHours, 0),
      completedTasks: updates.reduce((sum, update) => 
        sum + update.tasks.filter(task => task.status === 'Completed').length, 0
      ),
      lastUpdate: updates[0]?.date || null
    };

    console.log('Found updates:', { updates, summary });
    res.json({ updates, summary });
  } catch (err) {
    console.error('Error in getEmployeeUpdates:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
}; 