# Email Setup Guide for Forgot Password Functionality

## Prerequisites

1. **Gmail Account**: You need a Gmail account to send emails
2. **App Password**: You need to generate an app password for your Gmail account

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

## Step 2: Generate App Password

1. Go to your Google Account settings
2. Navigate to Security
3. Under "2-Step Verification", click on "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Click "Generate"
6. Copy the 16-character password that appears

## Step 3: Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/employee_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Step 4: Test Email Functionality

1. Start your backend server
2. Navigate to the forgot password page
3. Enter a valid email address
4. Check if the OTP email is received

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**: Make sure you're using the app password, not your regular Gmail password
2. **"Less secure app access" error**: This is expected - use app passwords instead
3. **Email not received**: Check spam folder and verify the email address is correct

### Security Notes:

- Never commit your `.env` file to version control
- Use app passwords instead of your main Gmail password
- Consider using environment-specific email services for production

## Alternative Email Services

If you prefer not to use Gmail, you can modify the email service in `utils/emailService.js` to use:

- **SendGrid**: Professional email service
- **Mailgun**: Transactional email service
- **AWS SES**: Amazon's email service
- **Nodemailer with SMTP**: Any SMTP server

## Production Considerations

For production deployment:

1. Use a professional email service (SendGrid, Mailgun, etc.)
2. Set up proper DNS records (SPF, DKIM, DMARC)
3. Monitor email delivery rates
4. Implement rate limiting for OTP requests
5. Use environment-specific configurations 