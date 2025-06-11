const Design = require('../models/Design');
const DesignTask = require('../models/DesignTask');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/designs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image and PDF files are allowed!'));
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('designFile');

// Submit a new design
exports.submitDesign = (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
      }

      const design = new Design({
        title: req.body.title,
        description: req.body.description,
        fileURL: req.file.path,
        designerId: req.user.id,
      });
      console.log(req.body)

      await design.save();
      res.status(201).json(design);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

// Get all designs for a designer
exports.getDesignerSubmissions = async (req, res) => {
  try {
    const designs = await Design.find({ designerId: req.user._id })
      .sort({ submittedDate: -1 });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all designs for manager review
exports.getAllDesigns = async (req, res) => {
  try {
    const { status, designerId, startDate, endDate } = req.query;
    let query = {};

    if (status) query.status = status;
    if (designerId) query.designerId = designerId;
    if (startDate && endDate) {
      query.submittedDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const designs = await Design.find(query)
      .populate('designerId', 'name email')
      .sort({ submittedDate: -1 });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Review a design (approve/reject)
exports.reviewDesign = async (req, res) => {
  try {
    const { status, managerComment } = req.body;
    const design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    design.status = status;
    design.managerComment = managerComment;
    await design.save();

    res.json(design);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign a new design task
exports.assignDesignTask = async (req, res) => {
  try {
    const { content, assignedTo, dueDate, priority } = req.body;

    const designer = await User.findOne({ _id: assignedTo, role: 'designer' });
    if (!designer) {
      return res.status(404).json({ message: 'Designer not found' });
    }

    const task = new DesignTask({
      content,
      assignedTo,
      assignedBy: req.user._id,
      dueDate,
      priority
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assigned tasks for a designer
exports.getDesignerTasks = async (req, res) => {
  try {
    const tasks = await DesignTask.find({ assignedTo: req.user._id })
      .populate('assignedBy', 'name email')
      .sort({ assignedDate: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await DesignTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 