# Website Health Monitor

A comprehensive website monitoring system that tracks uptime, SSL certificate expiry, and domain expiry for multiple websites.

## Features

### 🔍 Health Monitoring
- **Uptime Check**: Monitors website availability with HTTP/HTTPS requests
- **Response Time**: Tracks response time in milliseconds
- **SSL Certificate**: Monitors SSL certificate expiry dates
- **Domain Expiry**: Tracks domain registration expiry dates

### 📊 Dashboard
- **Real-time Status**: Live updates every minute
- **Color-coded Indicators**: 
  - 🟢 Green: Up and running
  - 🔴 Red: Down or expired
  - 🟡 Yellow: Expiring soon (≤30 days)
- **Summary Statistics**: Total sites, up/down counts
- **Manual Refresh**: Force health checks on demand

### ⚙️ Automated Monitoring
- **Cron Job**: Automatic health checks every 5 minutes
- **Background Processing**: Non-blocking health checks
- **Error Handling**: Graceful handling of failed checks

## Backend Implementation

### MongoDB Schema
```javascript
{
  domain: String (required, unique),
  lastChecked: Date,
  status: "up" | "down",
  responseTime: Number (milliseconds),
  sslValidTill: Date,
  domainExpiry: Date,
  createdAt: Date
}
```

### API Endpoints
- `POST /api/websites` - Add new website
- `GET /api/websites` - Get all websites with summary
- `DELETE /api/websites/:id` - Remove website
- `POST /api/websites/:id/check` - Manual health check

### Dependencies
- `node-cron`: Scheduled health checks
- `ssl-checker`: SSL certificate validation
- `whois-json`: Domain expiry lookup
- `axios`: HTTP requests for uptime checks

## Frontend Implementation

### Components
- **WebsiteHealthMonitor**: Main dashboard component
- **Add Website Form**: Simple domain input
- **Websites Table**: Comprehensive status display
- **Auto-refresh**: Updates every minute

### Features
- **Responsive Design**: Works on desktop and mobile
- **Tailwind CSS**: Consistent styling with existing dashboard
- **Real-time Updates**: Automatic data refresh
- **Error Handling**: User-friendly error messages

## Usage

### Adding a Website
1. Navigate to "Website Monitor" in the dashboard
2. Enter domain name (e.g., "example.com")
3. Click "Add Website"
4. Initial health check runs immediately

### Monitoring
- Websites are automatically checked every 5 minutes
- Dashboard refreshes every minute
- Manual checks available via "Check" button
- Remove websites with "Remove" button

### Status Indicators
- **Status**: Up (green) or Down (red)
- **SSL Expiry**: Days remaining with color coding
- **Domain Expiry**: Days remaining with color coding
- **Response Time**: Milliseconds for performance tracking

## Security Considerations

### Rate Limiting
- Health checks are spaced to avoid overwhelming target servers
- 5-second timeout on HTTP requests
- Graceful fallback from HTTPS to HTTP

### Error Handling
- Failed checks don't break the monitoring system
- Detailed logging for debugging
- User-friendly error messages

## Future Enhancements

### Email Alerts (Placeholder)
The system is designed to easily add email notifications for:
- Website going down
- SSL certificate expiring in <7 days
- Domain expiring in <7 days

### Additional Features
- Historical data tracking
- Performance metrics over time
- Custom monitoring intervals
- Multiple monitoring locations
- Integration with external monitoring services

## Installation

### Backend Dependencies
```bash
cd backend
npm install node-cron ssl-checker whois-json
```

### Database
The MongoDB schema will be automatically created when the first website is added.

### Cron Job
The health monitoring cron job starts automatically when the server starts.

## Configuration

### Environment Variables
No additional environment variables are required. The system uses existing MongoDB connection and server configuration.

### Customization
- Monitoring interval: Change cron schedule in `server.js`
- Request timeout: Modify timeout in `websiteController.js`
- Refresh rate: Update interval in `WebsiteHealthMonitor.js`

## Troubleshooting

### Common Issues
1. **SSL Check Fails**: Some domains may not support SSL checks
2. **Domain Expiry Unknown**: WHOIS data may not be available for all domains
3. **Slow Response Times**: Network conditions affect response time measurements

### Debugging
- Check server logs for health check results
- Verify MongoDB connection
- Ensure all dependencies are installed

## Support

For issues or questions about the Website Health Monitor:
1. Check server logs for error messages
2. Verify domain accessibility from your server
3. Ensure MongoDB is running and accessible
4. Check that all npm dependencies are installed

The system is designed to be robust and handle various edge cases gracefully while providing comprehensive website monitoring capabilities.