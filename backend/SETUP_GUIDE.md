# Email Setup Guide for madhkunchala@gmail.com

## Quick Setup Steps

### 1. Enable 2-Factor Authentication on Gmail
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the steps to enable it

### 2. Generate App Password
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "2-Step Verification", click on "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Click "Generate"
6. Copy the 16-character password (it will look like: xxxx xxxx xxxx xxxx)

### 3. Create .env File
Create a file named `.env` in the backend directory with this content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/employee_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail)
EMAIL_USER=madhkunchala@gmail.com
EMAIL_PASSWORD=your-16-character-app-password-here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Important**: Replace `your-16-character-app-password-here` with the actual 16-character app password you generated.

### 4. Test Email Functionality
Run this command to test if emails are working:

```bash
node test-email.js
```

### 5. Start the Backend Server
```bash
npm start
```

### 6. Test Forgot Password Flow
1. Start your frontend application
2. Go to the login page
3. Click "Forgot Password?"
4. Enter your email: madhkunchala@gmail.com
5. Check your email for the OTP code
6. Enter the OTP and reset your password

## Troubleshooting

### If you get "Invalid login" error:
- Make sure you're using the app password, not your regular Gmail password
- The app password should be exactly 16 characters

### If you get "Less secure app access" error:
- This is expected - you should use app passwords instead of your main password

### If email is not received:
- Check your spam folder
- Make sure the email address is correct
- Verify that 2-factor authentication is enabled

## Security Notes
- Never share your app password
- Never commit the .env file to version control
- The app password is different from your regular Gmail password 