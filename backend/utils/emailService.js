const nodemailer = require('nodemailer');

// Create transporter with working configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'madhkunchala@gmail.com',
      pass: 'slqkzjsofeygepgq',
    },
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email (context: 'registration' or 'password_reset')
const sendOTPEmail = async (email, otp, userName = 'User', context = 'password_reset') => {
  try {
    const transporter = createTransporter();

    let subject, intro, purpose;
    if (context === 'registration') {
      subject = 'Registration OTP - Smart Solutions';
      intro = 'Complete Your Registration';
      purpose = 'We received a request to register your account. Use the OTP below to complete your registration process.';
    } else {
      subject = 'Password Reset OTP - Smart Solutions';
      intro = 'Password Reset';
      purpose = 'We received a request to reset your password. Use the OTP below to complete the password reset process.';
    }

    const mailOptions = {
      from: `"Smart Solutions" <madhkunchala@gmail.com>`,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #3a0ca3, #4361ee); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔐 ${intro}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Employee Management System</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              ${purpose}
            </p>
            <div style="background: linear-gradient(135deg, #3a0ca3, #4361ee); color: white; padding: 25px; border-radius: 10px; text-align: center; margin: 25px 0;">
              <h1 style="margin: 0; font-size: 36px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">Your OTP Code</p>
            </div>
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 25px 0;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Important:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li>This OTP is valid for 10 minutes only</li>
                <li>Do not share this OTP with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
              If you have any questions, please contact your system administrator.
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 Employee Management System. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send password reset success email
const sendPasswordResetSuccessEmail = async (email, userName = 'User') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Smart Solutions" <madhkunchala@gmail.com>`,
      to: email,
      subject: 'Password Reset Successful - Employee Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">✅ Password Reset Successful</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Employee Management System</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Your password has been successfully reset. You can now log in to your account using your new password.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 25px 0;">
              <h4 style="margin: 0 0 10px 0; color: #155724;">🔒 Security Notice:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #155724;">
                <li>Your password has been changed successfully</li>
                <li>If you didn't perform this action, contact your administrator immediately</li>
                <li>For security, consider changing your password regularly</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Login to Your Account
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
              Thank you for using our Employee Management System.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 Employee Management System. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Success email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending success email:', error);
    return false;
  }
};

// Send welcome email after successful registration
const sendWelcomeEmail = async (email, userName, userRole) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Smart Solutions" <madhkunchala@gmail.com>`,
      to: email,
      subject: 'Welcome to Smart Solutions 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #3a0ca3, #4361ee); color: white; padding: 40px; text-align: center; border-radius: 15px 15px 0 0;">
            <h1 style="margin: 0; font-size: 32px;">🎉 Welcome Aboard!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Employee Management System</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 15px 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 25px; text-align: center;">Hello ${userName}! 👋</h2>
            
            <p style="color: #666; line-height: 1.8; margin-bottom: 25px; font-size: 16px; text-align: center;">
              Welcome to our Smart solutions We're excited to have you on board as a <strong>${userRole}</strong>.
            </p>
            
            <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-left: 4px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1976d2;">🚀 What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #1976d2; line-height: 1.6;">
                <li>Complete your profile setup</li>
                <li>Explore your dashboard features</li>
                <li>Connect with your team members</li>
                <li>Start managing your projects and tasks</li>
              </ul>
            </div>
            
            <div style="background: #f3e5f5; border: 1px solid #e1bee7; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="margin: 0 0 15px 0; color: #7b1fa2;">💡 Quick Tips:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #7b1fa2; line-height: 1.6;">
                <li>Keep your profile information up to date</li>
                <li>Regularly check for new assignments and updates</li>
                <li>Use the attendance system to track your work hours</li>
                <li>Submit daily updates to keep your progress visible</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="background: linear-gradient(135deg, #3a0ca3, #4361ee); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(58, 12, 163, 0.3);">
                🚀 Get Started - Login Now
              </a>
            </div>
            
            <div style="background: #fff8e1; border: 1px solid #ffecb3; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="margin: 0 0 10px 0; color: #f57c00;">🔐 Security Reminder:</h4>
              <p style="margin: 0; color: #f57c00; line-height: 1.6;">
                For your security, please change your password after your first login and enable two-factor authentication if available.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 0; text-align: center; font-style: italic;">
              We're here to support your success! If you have any questions, don't hesitate to reach out to your team lead or system administrator.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 14px;">
            <p style="margin: 5px 0;">Best regards,</p>
            <p style="margin: 5px 0; font-weight: bold; color: #666;">The Smart Solutions Team</p>
            <p style="margin: 15px 0 5px 0;">This is an automated welcome email. Please do not reply to this message.</p>
            <p style="margin: 5px 0;">&copy; 2024 Employee Management System. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetSuccessEmail,
  sendWelcomeEmail
}; 