const Punch = require('../models/Punch');
const Project = require('../models/Project');
const User = require('../models/User');
const WorkUpdate = require('../models/WorkUpdate');
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

    // Check if user already punched in today but not yet punched out (IST)
    const now = new Date();
    const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const today = new Date(istNow);
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

    // Use IST timezone for date calculations
    const now = new Date();
    const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const today = new Date(istNow);
    today.setHours(0, 0, 0, 0);
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if already punched in today
    const existingPunch = await Punch.findOne({
      employee: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingPunch) {
      return res.status(400).json({ message: 'Already punched in today' });
    }

    // Create new punch record with IST timezone
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    
    const punch = new Punch({
      employee: req.user.id,
      punchIn: istTime,
      date: startOfDay,
      status: istTime.getHours() >= 9 ? 'Late' : 'Present'
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
    // Use IST timezone for date calculations
    const now = new Date();
    const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const today = new Date(istNow);
    today.setHours(0, 0, 0, 0);

    const punch = await Punch.findOne({
      employee: req.user.id,
      date: today,
      punchOut: { $exists: false } // Only find records that haven't been punched out
    });

    if (!punch) {
      return res.status(400).json({ message: 'No active punch in record found for today' });
    }

    // Use IST timezone for punch out
    const punchOutTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
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
    // Use IST timezone for date calculations
    const now = new Date();
    const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const today = new Date(istNow);
    today.setHours(0, 0, 0, 0);

    // Get today's punch record
    const todayPunch = await Punch.findOne({
      employee: req.user.id,
      date: today
    });

    // Get last 30 days of attendance (IST)
    const thirtyDaysAgo = new Date(istNow);
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

// Get projects assigned to this employee (with steps and tasks)
exports.getProjects = async (req, res) => {
  try {
    console.log('Employee getProjects called for user ID:', req.user.id);
    
    // Find all projects where this user is assigned to at least one task
    const projects = await Project.find({
      'steps.tasks.assignedTo': req.user.id
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate({
        path: 'steps.tasks.assignedTo',
        select: 'name email avatar'
      })
      .populate({
        path: 'steps.tasks.comments.author',
        select: 'name email avatar'
      });
    
    console.log('Found projects before filtering:', projects.length);
    console.log('Projects:', projects.map(p => ({ id: p._id, title: p.title, steps: p.steps?.length || 0 })));
    
    // Filter steps/tasks to only include those assigned to this user
    const filteredProjects = projects.map(project => {
      console.log('Processing project:', project.title);
      console.log('Project steps:', project.steps);
      
      const filteredSteps = (project.steps || []).map(step => {
        console.log('Processing step:', step.name, 'Tasks:', step.tasks?.length || 0);
        const stepTasks = (step.tasks || []).filter(task => {
          let assignedId = task.assignedTo;
          if (assignedId && typeof assignedId === 'object' && assignedId._id) {
            assignedId = assignedId._id;
          }
          const isAssigned = String(assignedId) === String(req.user.id);
          console.log('Task:', task.title, 'AssignedTo:', task.assignedTo, 'UserID:', req.user.id, 'IsAssigned:', isAssigned);
          return isAssigned;
        });
        console.log('Filtered tasks for step:', step.name, 'Count:', stepTasks.length);
        return {
          name: step.name,
          tasks: stepTasks
        };
      }).filter(step => step.tasks.length > 0);
      
      console.log('Filtered steps for project:', project.title, 'Count:', filteredSteps.length);
      const progress = calculateProjectProgress(project);
      return { ...project.toObject(), steps: filteredSteps, progress };
    });
    
    console.log('Final filtered projects:', filteredProjects.length);
    console.log('Response data:', filteredProjects);
    
    res.status(200).json(filteredProjects);
  } catch (err) {
    console.error('Error in getProjects:', err.message);
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
// Submit work update
exports.submitWorkUpdate = async (req, res) => {
  try {
    // Log what we received
    console.log('=== WORK UPDATE SUBMISSION ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User ID:', req.user?.id);
    console.log('Request headers:', req.headers);

    const { 
      project, 
      status, 
      update, 
      finishBy, 
      project_title,
      taskDescription,
      priority,
      plannedTime,
      actualTime,
      linkReference,
      notes,
      plansForNextDay
    } = req.body;

    // Enhanced validation with detailed error messages
    const missingFields = [];
    if (!project_title) missingFields.push('project_title');
    if (!status) missingFields.push('status');  
    if (!update) missingFields.push('update');
    if (!finishBy) missingFields.push('finishBy');
    if (!taskDescription) missingFields.push('taskDescription');
    if (!plannedTime) missingFields.push('plannedTime');
    if (!actualTime) missingFields.push('actualTime');

    if (missingFields.length > 0) {
      console.log('❌ VALIDATION FAILED - Missing fields:', missingFields);
      console.log('Received data:', { project_title, status, update, finishBy, project, taskDescription, plannedTime, actualTime });
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        received: { project_title, status, update, finishBy, project, taskDescription, plannedTime, actualTime }
      });
    }
    
    console.log('✅ VALIDATION PASSED - All required fields present');

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/updates/${req.file.filename}`;
      console.log('Image uploaded:', imageUrl);
    }

    // Create the work update
    const workUpdate = new WorkUpdate({
      employee: req.user.id,
      project: project || null,
      project_title,
      status,
      update,
      finishBy: new Date(finishBy),
      imageUrl,
      taskDescription,
      priority: priority || 'Medium',
      plannedTime: parseFloat(plannedTime),
      actualTime: parseFloat(actualTime),
      linkReference: linkReference || '',
      notes: notes || '',
      plansForNextDay: plansForNextDay || ''
    });

    console.log('💾 Attempting to save work update to database...');
    const savedUpdate = await workUpdate.save();
    console.log('✅ Work update saved successfully:', savedUpdate);
   
    res.status(201).json({ 
      message: 'Work update submitted successfully', 
      workUpdate: savedUpdate 
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

// Get employee's work updates

exports.getWorkUpdates = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { employee: req.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const updates = await WorkUpdate.find(query)
      .sort({ date: -1 })
      .populate('employee', 'name email')
      .populate('approvedBy', 'name');

    res.json(updates);
  } catch (err) {
    console.error('Error fetching updates:', err);
    res.status(500).json({ message: 'Failed to fetch updates' });
  }
};

// Get employee's work updates with approval status
exports.getMyWorkUpdates = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const updates = await WorkUpdate.find({ employee: req.user.id })
      .sort({ date: -1 })
      .populate('project', 'title description')
      .populate('approvedBy', 'name')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WorkUpdate.countDocuments({ employee: req.user.id });

    res.json({
      updates,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('Error fetching my work updates:', err);
    res.status(500).json({ message: 'Failed to fetch updates' });
  }
};

// Get today's work update

exports.getTodayWorkUpdate = async (req, res) => {

  try {

    const employeeId = req.user.id;

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);



    const update = await WorkUpdate.findOne({

      employee: employeeId,

      date: {

        $gte: today,

        $lt: tomorrow

      }

    })

    .populate('employee', 'name email')

    .populate('tasks.project', 'title description');



    res.json(update || { message: 'No work update submitted for today' });

  } catch (error) {

    console.error('Error fetching today\'s work update:', error);

    res.status(500).json({ message: 'Error fetching today\'s work update' });

  }

};

// Update work update
exports.updateWorkUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    const { project, status, update, finishBy, project_title } = req.body;

    // Find the update and verify ownership
    const workUpdate = await WorkUpdate.findById(updateId);
    
    if (!workUpdate) {
      return res.status(404).json({ message: 'Work update not found' });
    }

    // Check if the update belongs to the current user
    if (workUpdate.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this update' });
    }

    // Check if the update has already been approved/rejected
    if (workUpdate.approvalStatus && workUpdate.approvalStatus !== 'Pending') {
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
    let imageUrl = workUpdate.imageUrl; // Keep existing image if no new one
    if (req.file) {
      // Delete old image if it exists
      if (workUpdate.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', workUpdate.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageUrl = `/uploads/updates/${req.file.filename}`;
    }

    // Update the work update
    const updatedUpdate = await WorkUpdate.findByIdAndUpdate(
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
      message: 'Work update updated successfully',
      update: updatedUpdate
    });

  } catch (error) {
    console.error('Error updating work update:', error);
    res.status(500).json({ 
      message: 'Failed to update work update',
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

// Update task status for employee
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const employeeId = req.user.id;

    if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (pending, in-progress, completed)' });
    }

    // Find the project containing this task
    const project = await Project.findOne({ "steps.tasks._id": taskId });
    if (!project) {
      return res.status(404).json({ message: 'Task not found in any project' });
    }

    // Find the specific task and verify it's assigned to the current employee
    let taskFound = false;
    let taskAssignedToEmployee = false;

    for (const step of project.steps) {
      const task = step.tasks.id(taskId);
      if (task) {
        taskFound = true;
        if (task.assignedTo && task.assignedTo.toString() === employeeId) {
          taskAssignedToEmployee = true;
          task.status = status;
          break;
        }
      }
    }

    if (!taskFound) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!taskAssignedToEmployee) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
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

    res.json({
      message: `Task status updated to ${status}`,
      project: { ...project.toObject(), progress },
      updatedTaskId: taskId,
      newStatus: status
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Error updating task status' });
  }
};

// Test endpoint to check database state
exports.testDatabaseState = async (req, res) => {
  try {
    console.log('Testing database state...');

    const allProjects = await Project.find().populate('createdBy', 'name email');
    console.log('Total projects in database:', allProjects.length);

    const projectsWithTasks = allProjects.filter(p => p.steps && p.steps.length > 0);
    console.log('Projects with steps:', projectsWithTasks.length);

    let totalTasks = 0;
    let assignedTasks = 0;

    projectsWithTasks.forEach(project => {
      project.steps.forEach(step => {
        if (step.tasks && step.tasks.length > 0) {
          totalTasks += step.tasks.length;
          step.tasks.forEach(task => {
            if (task.assignedTo) {
              assignedTasks++;
              console.log('Assigned task found:', {
                project: project.title,
                step: step.name,
                task: task.title,
                assignedTo: task.assignedTo
              });
            }
          });
        }
      });
    });

    console.log('Total tasks:', totalTasks);
    console.log('Assigned tasks:', assignedTasks);

    res.json({
      totalProjects: allProjects.length,
      projectsWithSteps: projectsWithTasks.length,
      totalTasks,
      assignedTasks,
      projects: projectsWithTasks.map(p => ({
        id: p._id,
        title: p.title,
        steps: p.steps?.length || 0,
        tasks: p.steps?.reduce((sum, step) => sum + (step.tasks?.length || 0), 0) || 0
      }))
    });
  } catch (err) {
    console.error('Error in testDatabaseState:', err);
    res.status(500).json({ message: 'Error testing database state', error: err.message });
  }
};

// Get tasks assigned to employee by team leaders
exports.getMyTasks = async (req, res) => {
  try {
    const employeeId = req.user.id;
    console.log('Getting tasks for employee:', employeeId);

    // Import the Task model (DesignTask)
    const Task = require('../models/DesignTask');
    
    // Get tasks assigned to this employee
    const tasks = await Task.find({ assignedTo: employeeId })
      .populate('assignedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    console.log('Found tasks for employee:', tasks.length);
    
    res.json(tasks);
  } catch (error) {
    console.error('Error getting employee tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

// Update task status for employee
exports.updateMyTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const employeeId = req.user.id;

    if (!status || !['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (pending, in_progress, completed)' });
    }

    // Import the Task model (DesignTask)
    const Task = require('../models/DesignTask');
    
    // Find and update the task
    const task = await Task.findOneAndUpdate(
      { _id: taskId, assignedTo: employeeId },
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('assignedBy', 'name email role')
     .populate('assignedTo', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not assigned to you' });
    }

    res.json({
      message: `Task status updated to ${status}`,
      task
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Error updating task status' });
  }
};

// Update project status (when projects are treated as tasks)
exports.updateProjectAsTaskStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;
    const employeeId = req.user.id;

    if (!status || !['assigned', 'pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (assigned, pending, in-progress, completed)' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.assignedTo && project.assignedTo.toString() !== employeeId) {
      return res.status(403).json({ message: 'You can only update projects assigned to you' });
    }

    project.status = status;
    project.updatedAt = new Date();
    await project.save();

    await project.populate('createdBy', 'name email');
    await project.populate('assignedTo', 'name email');

    res.json({
      message: `Project status updated to ${status}`,
      project: project.toObject(),
      updatedProjectId: projectId,
      newStatus: status
    });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ message: 'Error updating project status' });
  }

  exports.workUpdate = async (req, res) => {
    try {
      const { userId, update } = req.body;
  
      if (!userId || !update) {
        return res.status(400).json({ message: "Missing userId or update" });
      }
  
      const user = await User.findByIdAndUpdate(
        userId,
        { todayWorkingOn: update },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({
        message: "Work status updated successfully",
        user,
      });
  
    } catch (error) {
      console.error("Error updating work:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }




};