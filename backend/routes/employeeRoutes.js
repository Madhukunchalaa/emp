const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getProjects,
  updateProjectStatus,
  updateProjectComment,
  punchIn,
  punchOut,
  getAttendance,
  submitWorkUpdate,
  getWorkUpdates,
  getTodayWorkUpdate,
  updateTodayWorkingOn,
  getMyWorkUpdates,
  updateWorkUpdate,
  updateTaskStatus,
  updateProjectAsTaskStatus,
  testDatabaseState,
  getMyTasks,
  updateMyTaskStatus,
 
} = require('../controllers/employeeController');
const { workUpdate } = require('../controllers/updateController'); // ✅

const dailyUpdates=require('../controllers/updateControoler')
const multer = require('multer');
const path = require('path');
const upload=require('../utils/uploadConfig')

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
// const upload = multer({ storage });


// Profile routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// Project routes
router.get('/projects', auth, getProjects);
router.patch('/projects/:projectId/status', auth, updateProjectStatus);
router.patch('/projects/:projectId/comment', auth, updateProjectComment);
router.put('/tasks/:taskId/status', auth, updateTaskStatus);
router.put('/projects/:projectId/task-status', auth, updateProjectAsTaskStatus);
router.get('/test-db', auth, testDatabaseState);

// Task routes (for team leader assigned tasks)
router.get('/my-tasks', auth, getMyTasks);
router.put('/my-tasks/:taskId/status', auth, updateMyTaskStatus);

// Attendance routes
router.post('/attendance/punch-in', auth, punchIn);
router.post('/attendance/punch-out', auth, punchOut);
router.get('/attendance', auth, getAttendance);

// Daily update routes
router.post('/work-update', auth, upload.single('image'), submitWorkUpdate);
router.put('/work-updates/:updateId', auth, upload.single('image'), updateWorkUpdate);

router.get('/work-updates', auth, getWorkUpdates);
router.get('/my-work-updates', auth, getMyWorkUpdates);
router.get('/today-work-update', auth, getTodayWorkUpdate);


// Today's working on route
router.put('/today-working-on', auth, updateTodayWorkingOn);

router.post('/updates',auth,upload.single('image'),dailyUpdates)

// Chat file upload endpoint
router.post('/chat/upload', upload.single('file'), (req, res) => {
  res.json({ fileUrl: `/uploads/chat/${req.file.filename}`, fileName: req.file.originalname });
});

// Chat history endpoint
const ChatMessage = require('../models/ChatMessage');
router.get('/chat/history', async (req, res) => {
  const { user1, user2 } = req.query;
  const messages = await ChatMessage.find({
    $or: [
      { from: user1, to: user2 },
      { from: user2, to: user1 }
    ]
  }).sort({ createdAt: 1 });
  res.json(messages);
});

// Task progress update route
// router.patch('/tasks/:taskId/progress', auth, updateTaskProgress);

module.exports = router; 