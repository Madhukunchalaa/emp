const Website = require('../models/Website');
const axios = require('axios');
const sslChecker = require('ssl-checker');
const whois = require('whois-json');

// Helper function to check website uptime
const checkUptime = async (domain) => {
  try {
    const startTime = Date.now();
    const response = await axios.get(`https://${domain}`, {
      timeout: 5000,
      validateStatus: (status) => status < 500 // Accept redirects and client errors as "up"
    });
    const responseTime = Date.now() - startTime;
    
    return {
      status: response.status >= 200 && response.status < 400 ? 'up' : 'down',
      responseTime: responseTime
    };
  } catch (error) {
    // Try HTTP if HTTPS fails
    try {
      const startTime = Date.now();
      const response = await axios.get(`http://${domain}`, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.status >= 200 && response.status < 400 ? 'up' : 'down',
        responseTime: responseTime
      };
    } catch (httpError) {
      return {
        status: 'down',
        responseTime: null
      };
    }
  }
};

// Helper function to check SSL certificate
const checkSSL = async (domain) => {
  try {
    const sslInfo = await sslChecker(domain, {
      method: 'GET',
      port: 443,
      rejectUnauthorized: false
    });
    
    if (sslInfo && sslInfo.valid) {
      return new Date(sslInfo.validTo);
    }
    return null;
  } catch (error) {
    console.log(`SSL check failed for ${domain}:`, error.message);
    return null;
  }
};

// Helper function to check domain expiry
const checkDomainExpiry = async (domain) => {
  try {
    const whoisInfo = await whois(domain);
    
    // Look for common expiry date fields
    const expiryFields = ['registryExpiryDate', 'expiryDate', 'expires', 'expire'];
    
    for (const field of expiryFields) {
      if (whoisInfo[field]) {
        const expiryDate = new Date(whoisInfo[field]);
        if (!isNaN(expiryDate.getTime())) {
          return expiryDate;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.log(`Domain expiry check failed for ${domain}:`, error.message);
    return null;
  }
};

// Add a new website to monitor
const addWebsite = async (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ message: 'Domain is required' });
    }
    
    // Clean domain (remove protocol if present)
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Check if website already exists
    const existingWebsite = await Website.findOne({ domain: cleanDomain });
    if (existingWebsite) {
      return res.status(400).json({ message: 'Website is already being monitored' });
    }
    
    // Perform initial health check
    const uptimeResult = await checkUptime(cleanDomain);
    const sslExpiry = await checkSSL(cleanDomain);
    const domainExpiry = await checkDomainExpiry(cleanDomain);
    
    const website = new Website({
      domain: cleanDomain,
      lastChecked: new Date(),
      status: uptimeResult.status,
      responseTime: uptimeResult.responseTime,
      sslValidTill: sslExpiry,
      domainExpiry: domainExpiry
    });
    
    await website.save();
    
    res.status(201).json({
      message: 'Website added successfully',
      website: website
    });
  } catch (error) {
    console.error('Error adding website:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all monitored websites
const getWebsites = async (req, res) => {
  try {
    const websites = await Website.find().sort({ createdAt: -1 });
    
    // Calculate summary stats
    const total = websites.length;
    const up = websites.filter(w => w.status === 'up').length;
    const down = total - up;
    
    res.json({
      websites: websites,
      summary: {
        total,
        up,
        down
      }
    });
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a website
const deleteWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    
    const website = await Website.findByIdAndDelete(id);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }
    
    res.json({ message: 'Website removed successfully' });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Manual health check for a specific website
const checkWebsiteHealth = async (req, res) => {
  try {
    const { id } = req.params;
    
    const website = await Website.findById(id);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }
    
    // Perform health checks
    const uptimeResult = await checkUptime(website.domain);
    const sslExpiry = await checkSSL(website.domain);
    const domainExpiry = await checkDomainExpiry(website.domain);
    
    // Update website
    website.lastChecked = new Date();
    website.status = uptimeResult.status;
    website.responseTime = uptimeResult.responseTime;
    website.sslValidTill = sslExpiry;
    website.domainExpiry = domainExpiry;
    
    await website.save();
    
    res.json({
      message: 'Health check completed',
      website: website
    });
  } catch (error) {
    console.error('Error checking website health:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Bulk health check for all websites (used by cron job)
const bulkHealthCheck = async () => {
  try {
    console.log('Starting bulk health check...');
    const websites = await Website.find();
    
    for (const website of websites) {
      try {
        console.log(`Checking ${website.domain}...`);
        
        // Perform health checks
        const uptimeResult = await checkUptime(website.domain);
        const sslExpiry = await checkSSL(website.domain);
        const domainExpiry = await checkDomainExpiry(website.domain);
        
        // Update website
        website.lastChecked = new Date();
        website.status = uptimeResult.status;
        website.responseTime = uptimeResult.responseTime;
        website.sslValidTill = sslExpiry;
        website.domainExpiry = domainExpiry;
        
        await website.save();
        
        console.log(`Updated ${website.domain}: ${website.status}`);
      } catch (error) {
        console.error(`Error checking ${website.domain}:`, error.message);
      }
    }
    
    console.log('Bulk health check completed');
  } catch (error) {
    console.error('Error in bulk health check:', error);
  }
};

module.exports = {
  addWebsite,
  getWebsites,
  deleteWebsite,
  checkWebsiteHealth,
  bulkHealthCheck
};