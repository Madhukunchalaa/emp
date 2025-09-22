const express = require('express');
const router = express.Router();
const {
  addWebsite,
  getWebsites,
  deleteWebsite,
  checkWebsiteHealth
} = require('../controllers/websiteController');

// Add a new website to monitor
router.post('/', addWebsite);

// Get all monitored websites
router.get('/', getWebsites);

// Delete a website
router.delete('/:id', deleteWebsite);

// Manual health check for a specific website
router.post('/:id/check', checkWebsiteHealth);

module.exports = router;