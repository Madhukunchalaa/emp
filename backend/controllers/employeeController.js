const Punch = require('../models/Punch');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const DailyUpdate = require('../models/DailyUpdate');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');

// Get employee profile
// const Punch = require('../models/punchModel'); // Make sure to import this

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already punched in today but not yet punched out
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day

    const existingPunch = await Punch.findOne({
      employee: req.user.id,
      date: today,
      punchOut: { $exists: false } // Means still working
    });

    const isWorking = !!existingPunch; // true if found

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      isWorking // Add this field
    });
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


//punchin
exports.punchIn = async (req, res) => {
  try {
    // Validate req.user
    if (!req.user || !req.user.id) {
      console.log('User validation failed:', { user: req.user });
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Check if already punched in today
    const existingPunch = await Punch.findOne({
      employee: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingPunch) {
      return res.status(400).json({ message: 'Already punched in today' });
    }

    // Create new punch record
    const punch = new Punch({
      employee: req.user.id,
      punchIn: new Date(),
      date: startOfDay,
      status: new Date().getHours() >= 9 ? 'Late' : 'Present'
    });

    console.log('About to save punch:', punch);
    await punch.save();

    // ✅ Update employee's status to 'Online'
    const employee = await User.findById(req.user.id);
    if (employee) {
      employee.status = 'Online';
      await employee.save();
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


// Punch out
exports.punchOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const punch = await Punch.findOne({
      employee: req.user.id,
      date: today,
      punchOut: { $exists: false } // Only find records that haven't been punched out
    });

    if (!punch) {
      return res.status(400).json({ message: 'No active punch in record found for today' });
    }

    const punchOutTime = new Date();
    punch.punchOut = punchOutTime;
    
    // Calculate hours worked
    const diffMs = punchOutTime - punch.punchIn;
    punch.hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    await punch.save();

    // Update employee's status to 'Offline'
    const employee = await User.findById(req.user.id);
    if (employee) {
      employee.status = 'Offline';
      await employee.save();
    }

    res.json({
      message: 'Punched out successfully',
      punch
    });
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

// Get assigned tasks (previously getProjects)
exports.getProjects = async (req, res) => {
  try {
    console.log('Fetching tasks for employee:', req.user.id);
    
    // Get tasks assigned to this employee
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('projectId', 'title description deadline')
      .populate('assignedBy', 'name email')
      .sort({ deadline: 1 });

    console.log(`Found ${tasks.length} tasks for employee`);

    // Transform tasks to match the expected format for the frontend
    const transformedTasks = tasks.map(task => ({
      _id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline,
      estimatedHours: task.estimatedHours,
      progress: task.progress,
      projectId: task.projectId,
      assignedBy: task.assignedBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));

    res.status(200).json(transformedTasks);
  } catch (err) {
    console.error('Error in getProjects (tasks):', err.message);
    res.status(500).json({ message: 'Server error', projects: [] });
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

// Update today's working on
exports.updateTodayWorkingOn = async (req, res) => {
  try {
    const { todayWorkingOn } = req.body;
    
    if (!todayWorkingOn || todayWorkingOn.trim() === '') {
      return res.status(400).json({ message: 'Please provide what you are working on today' });
    }

    const employee = await User.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.todayWorkingOn = todayWorkingOn.trim();
    await employee.save();

    res.json({ 
      message: 'Today\'s work updated successfully',
      todayWorkingOn: employee.todayWorkingOn
    });
  } catch (err) {
    console.error('Error updating today\'s work:', err);
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
    // Log what we received
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User ID:', req.user?.id);

    const { project, status, update, finishBy, project_title } = req.body;

    // Enhanced validation with detailed error messages
    const missingFields = [];
    if (!project_title) missingFields.push('project_title');
    if (!status) missingFields.push('status');  
    if (!update) missingFields.push('update');
    if (!finishBy) missingFields.push('finishBy');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        received: { project_title, status, update, finishBy, project }
      });
    }

    // Check for existing update today (optional)
    const existing = await DailyUpdate.findOne({
      employee: req.user.id,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      }
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'You have already submitted an update for today. Please edit your existing update instead.' 
      });
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/updates/${req.file.filename}`;
      console.log('Image uploaded:', imageUrl);
    }

    // Create the daily update
    const dailyUpdate = new DailyUpdate({
      employee: req.user.id,
      project: project || null,
      project_title,
      status,
      update,
      finishBy: new Date(finishBy),
      imageUrl
    });

    const savedUpdate = await dailyUpdate.save();
    console.log('✅ Daily update saved:', savedUpdate);
   
    res.status(201).json({ 
      message: 'Update submitted successfully', 
      dailyUpdate: savedUpdate 
    });

  } catch (error) {
    console.error('❌ Submit update error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Get employee's daily updates

exports.getDailyUpdates = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { employee: req.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const updates = await DailyUpdate.find(query)
      .sort({ date: -1 })
      .populate('employee', 'name email')
      .populate('approvedBy', 'name');

    res.json(updates);
  } catch (err) {
    console.error('Error fetching updates:', err);
    res.status(500).json({ message: 'Failed to fetch updates' });
  }
};

// Get employee's daily updates with approval status
exports.getMyDailyUpdates = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const updates = await DailyUpdate.find({ employee: req.user.id })
      .sort({ date: -1 })
      .populate('project', 'title description')
      .populate('approvedBy', 'name')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DailyUpdate.countDocuments({ employee: req.user.id });

    res.json({
      updates,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('Error fetching my daily updates:', err);
    res.status(500).json({ message: 'Failed to fetch updates' });
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

// Update daily update
exports.updateDailyUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    const { project, status, update, finishBy, project_title } = req.body;

    // Find the update and verify ownership
    const dailyUpdate = await DailyUpdate.findById(updateId);
    
    if (!dailyUpdate) {
      return res.status(404).json({ message: 'Daily update not found' });
    }

    // Check if the update belongs to the current user
    if (dailyUpdate.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this update' });
    }

    // Check if the update has already been approved/rejected
    if (dailyUpdate.approvalStatus && dailyUpdate.approvalStatus !== 'Pending') {
      return res.status(400).json({ 
        message: 'Cannot edit update that has already been approved or rejected' 
      });
    }

    // Handle project field - if it's not a valid ObjectId, set it to null
    let projectId = null;
    if (project && mongoose.Types.ObjectId.isValid(project)) {
      projectId = project;
    } else if (project_title) {
      // Try to find project by title if project ID is not valid
      const foundProject = await Project.findOne({ title: project_title });
      if (foundProject) {
        projectId = foundProject._id;
      }
    }

    // Handle image upload if provided
    let imageUrl = dailyUpdate.imageUrl; // Keep existing image if no new one
    if (req.file) {
      // Delete old image if it exists
      if (dailyUpdate.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', dailyUpdate.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageUrl = `/uploads/updates/${req.file.filename}`;
    }

    // Update the daily update
    const updatedUpdate = await DailyUpdate.findByIdAndUpdate(
      updateId,
      {
        project: projectId,
        status,
        update,
        finishBy: finishBy ? new Date(finishBy) : null,
        project_title,
        imageUrl,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('employee', 'name email')
     .populate('project', 'title description');

    res.json({
      message: 'Daily update updated successfully',
      update: updatedUpdate
    });

  } catch (error) {
    console.error('Error updating daily update:', error);
    res.status(500).json({ 
      message: 'Failed to update daily update',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
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