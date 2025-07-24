const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
<<<<<<< HEAD
      user: 'madhkunchala@gmail.com',
      pass: 'slqkzjsofeygepgq',
=======
      user: 'madhu@smartsolutionsdigi.com',
      pass: 'pesw gfjm hnem wsex',
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
    },
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, userName = 'User', context = 'password_reset') => {
  try {
    const transporter = createTransporter();

    const intro = context === 'registration' ? 'Complete Your Registration' : 'Password Reset';
    const purpose = context === 'registration'
      ? 'Every step you take with us secures a smarter future. Use the OTP below to complete your registration and start your journey with Smart Solutions.'
      : 'You are taking a secure step forward. Use the OTP below to reset your password and continue your progress with Smart Solutions.';
    const subject = context === 'registration'
      ? 'Registration OTP - Smart Solutions'
      : 'Password Reset OTP - Smart Solutions';

    const mailOptions = {
      from: `"Smart Solutions" <madhkunchala@gmail.com>`,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #3a0ca3, #4361ee); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔐 ${intro}</h1>
            <p style="opacity: 0.9;">Empowering Your Journey with Smart Solutions</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Hello ${userName} 👋</h2>
            <p style="color: #666;">${purpose}</p>
            <div style="background: linear-gradient(135deg, #3a0ca3, #4361ee); color: white; padding: 20px; text-align: center; border-radius: 10px;">
              <h1 style="font-size: 36px; letter-spacing: 8px;">${otp}</h1>
              <p>Your One-Time Password (OTP)</p>
            </div>
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin-top: 20px; border-radius: 8px;">
              <h4 style="color: #856404;">⚠️ Please Note:</h4>
              <ul style="color: #856404;">
                <li>This OTP is valid for 10 minutes</li>
                <li>Do not share it with anyone</li>
                <li>If you didn’t request this, you can safely ignore this email</li>
              </ul>
            </div>
          </div>
          <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; 2025 Smart Solutions. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP Email:', error);
    return false;
  }
};

const sendPasswordResetSuccessEmail = async (email, userName = 'User') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Smart Solutions" <madhkunchala@gmail.com>`,
      to: email,
      subject: 'Password Reset Successful - Smart Solutions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>✅ Password Reset Successful</h1>
            <p>You've taken a secure step forward</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Hello ${userName},</h2>
            <p>Your password has been reset successfully. You're now ready to continue your journey with confidence.</p>
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <h4 style="color: #155724;">🔐 Stay Secure:</h4>
              <ul style="color: #155724;">
                <li>Change your password regularly</li>
                <li>If you didn’t perform this action, report immediately</li>
              </ul>
            </div>
          </div>
          <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; 2025 Smart Solutions. All rights reserved.</p>
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

const sendWelcomeEmail = async (email, userName, userRole) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Smart Solutions" <madhkunchala@gmail.com>`,
      to: email,
      subject: 'Welcome to Smart Solutions 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #3a0ca3, #4361ee); color: white; padding: 40px; text-align: center; border-radius: 15px 15px 0 0;">
            <h1>🎉 Welcome Aboard!</h1>
            <p>You're now part of something great</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 15px 15px;">
            <h2>Hello ${userName}!</h2>
            <p>We're thrilled to have you as a <strong>${userRole}</strong> at Smart Solutions. Your journey toward innovation and excellence starts now.</p>
            <div style="background: #e8f5e9; border-left: 5px solid #43a047; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #2e7d32;">🚀 Your Journey Starts Here</h3>
              <p style="color: #2e7d32;">Every day is an opportunity to grow, collaborate, and make a difference.</p>
            </div>
            <ul style="color: #444; padding-left: 20px;">
              <li>🌱 Set up your profile</li>
              <li>🤝 Explore your dashboard</li>
              <li>📊 Start contributing to impactful projects</li>
            </ul>
            <p style="text-align: center; color: #666; margin-top: 25px;">
              Let's build something meaningful together.
            </p>
          </div>
          <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
            <p>This is an automated welcome email. Please do not reply.</p>
            <p>&copy; 2025 Smart Solutions. All rights reserved.</p>
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
