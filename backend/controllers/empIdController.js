const express = require('express');
const router = express.Router();
const EmpId = require('../models/empId');
const { auth } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const User = require('../models/User');
const Project = require('../models/Project');
const Report = require('../models/Report');
const crypto = require('crypto');

// POST /api/empid — Add new employee ID (protected)
router.post('/', auth, checkRole(['admin', 'manager']), async (req, res) => {
    try {
        const { employeeId, role } = req.body;

        if (!employeeId || !role) {
            return res.status(400).json({ msg: 'employeeId and role are required' });
        }
        const validRoles = ['developer','designer', 'team-leader', 'manager', 'Business'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ msg: 'Invalid role specified' });
        }

        const existingId = await EmpId.findOne({ employeeId });
        if (existingId) {
            return res.status(400).json({ msg: 'ID already registered' });
        }

        const newEmpId = new EmpId({ employeeId, role });
        await newEmpId.save();

        res.status(201).json({ msg: 'Employee ID added successfully', data: newEmpId });
    } catch (error) {
        console.error('Error adding employee ID:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// GET /api/empid — Fetch all employee IDs (public)
router.get('/', async (req, res) => {
    try {
        const empIds = await EmpId.find().sort({ createdAt: -1 });
        res.status(200).json(empIds);
    } catch (error) {
        console.error('Error fetching employee IDs:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// GET /api/empid/:employeeId — Fetch role for a specific Employee ID (public)
router.get('/:employeeId', async (req, res) => {
    try {
        const empIdDoc = await EmpId.findOne({ employeeId: req.params.employeeId });
        if (!empIdDoc) {
            return res.status(404).json({ message: 'Employee ID not found.' });
        }
        res.json({ role: empIdDoc.role });
    } catch (error) {
        console.error('Error fetching employee ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Batch create EmpIDs (admin only)
router.post('/batch', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { count = 1, role, prefix = 'EMP', random = true } = req.body;
    if (!role) return res.status(400).json({ msg: 'Role is required' });
    const validRoles = ['developer','designer', 'team-leader', 'manager', 'Business', 'employee'];
    if (!validRoles.includes(role)) return res.status(400).json({ msg: 'Invalid role specified' });
    let empIds = [];
    for (let i = 0; i < count; i++) {
      let employeeId;
      if (random) {
        employeeId = `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      } else {
        employeeId = `${prefix}-${Date.now()}-${i}`;
      }
      // Ensure uniqueness
      const exists = await EmpId.findOne({ employeeId });
      if (exists) { i--; continue; }
      const newEmpId = new EmpId({ employeeId, role });
      await newEmpId.save();
      empIds.push(newEmpId);
    }
    res.status(201).json({ msg: 'Batch EmpIDs created', data: empIds });
  } catch (error) {
    console.error('Batch EmpID error:', error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// Assign EmpID to user and set role (admin only)
router.put('/:id/assign', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { userId, role } = req.body;
    const empIdDoc = await EmpId.findById(req.params.id);
    if (!empIdDoc) return res.status(404).json({ msg: 'EmpID not found' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    empIdDoc.assignedTo = user._id;
    empIdDoc.isUsed = true;
    if (role) empIdDoc.role = role;
    await empIdDoc.save();
    user.empid = empIdDoc.employeeId;
    if (role) user.role = role;
    await user.save();
    res.json({ msg: 'EmpID assigned to user', empId: empIdDoc, user });
  } catch (error) {
    console.error('Assign EmpID error:', error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// Mark EmpID as used (public, e.g. after registration)
router.put('/:employeeId/mark-used', async (req, res) => {
  try {
    const empIdDoc = await EmpId.findOne({ employeeId: req.params.employeeId });
    if (!empIdDoc) return res.status(404).json({ msg: 'EmpID not found' });
    empIdDoc.isUsed = true;
    await empIdDoc.save();
    res.json({ msg: 'EmpID marked as used', empId: empIdDoc });
  } catch (error) {
    console.error('Mark EmpID used error:', error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// Admin: List all users
router.get('/admin/users', auth, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// Admin: List all projects
router.get('/admin/projects', auth, checkRole(['admin']), async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// Admin: List all reports
router.get('/admin/reports', auth, checkRole(['admin']), async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// Promote a user to admin (admin only)
router.put('/admin/promote/:userId', auth, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.role = 'admin';
    await user.save();
    res.json({ msg: 'User promoted to admin', user });
  } catch (error) {
    res.status(500).json({ msg: 'Internal server error' });
  }
});

module.exports = router;
