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
  submitDailyUpdate,
  getDailyUpdates,
  getTodayUpdate
} = require('../controllers/employeeController');
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

// Attendance routes
router.post('/attendance/punch-in', auth, punchIn);
router.post('/attendance/punch-out', auth, punchOut);
router.get('/attendance', auth, getAttendance);

// Daily update routes
router.post('/daily-update', auth, upload.single('image'), submitDailyUpdate);

router.get('/daily-updates', auth, getDailyUpdates);
router.get('/today-update', auth, getTodayUpdate);





router.post('/updates',auth,upload.single('image'),dailyUpdates)

module.exports = router; 