const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'madhu@smartsolutionsdigi.com',
      pass: 'xlwn bien njds iliu',
    },
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getEmailHeader = () => {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.02)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>'); opacity: 0.3;"></div>
        <div style="position: relative; z-index: 2;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: -1px;">SS</div>
          </div>
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">Smart Solutions</h1>
          <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0; font-weight: 400;">Excellence in Digital Innovation</p>
        </div>
      </div>
  `;
};

const getEmailFooter = () => {
  return `
      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
        <div style="margin-bottom: 20px;">
          <div style="display: inline-flex; gap: 15px; margin-bottom: 15px;">
            <a href="#" style="color: #64748b; text-decoration: none; font-size: 12px; padding: 8px 12px; background: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0;">Privacy Policy</a>
            <a href="#" style="color: #64748b; text-decoration: none; font-size: 12px; padding: 8px 12px; background: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0;">Support</a>
          </div>
        </div>
        <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
          This is an automated message from Smart Solutions.<br>
          Please do not reply to this email.
        </p>
        <p style="color: #94a3b8; font-size: 11px; margin: 15px 0 0; font-weight: 500;">
          © 2025 Smart Solutions. All rights reserved.
        </p>
      </div>
    </div>
  `;
};

const sendOTPEmail = async (email, otp, userName = 'User', context = 'password_reset') => {
  try {
    const transporter = createTransporter();

    const isRegistration = context === 'registration';
    const title = isRegistration ? 'Verify Your Account' : 'Password Reset Request';
    const subtitle = isRegistration 
      ? 'Complete your registration to get started' 
      : 'Secure your account with verification';
    const subject = isRegistration
      ? 'Account Verification - Smart Solutions'
      : 'Password Reset Verification - Smart Solutions';

    const mailOptions = {
      from: `"Smart Solutions" <madhkunchala@gmail.com>`,
      to: email,
      subject,
      html: `
        ${getEmailHeader()}
        
        <!-- Main Content -->
        <div style="padding: 40px 30px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="color: #1a202c; font-size: 28px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.5px;">${title}</h2>
            <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.5;">${subtitle}</p>
          </div>
          
          <div style="text-align: left; margin-bottom: 35px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hello <strong style="color: #1a202c;">${userName}</strong>,</p>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0;">
              ${isRegistration 
                ? 'Thank you for joining Smart Solutions. Please use the verification code below to complete your account setup and start your journey with us.'
                : 'We received a request to reset your password. Please use the verification code below to proceed with your password reset.'}
            </p>
          </div>

          <!-- OTP Container -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border: 2px solid #e2e8f0; border-radius: 16px; padding: 30px; text-align: center; margin: 35px 0; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%); pointer-events: none;"></div>
            <div style="position: relative; z-index: 2;">
              <p style="color: #64748b; font-size: 14px; font-weight: 500; margin: 0 0 15px; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
              <div style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #1a202c; letter-spacing: 8px; margin: 0; padding: 15px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; display: inline-block; min-width: 280px;">${otp}</div>
              <p style="color: #64748b; font-size: 13px; margin: 15px 0 0; font-weight: 400;">Valid for 10 minutes</p>
            </div>
          </div>

          <!-- Security Notice -->
          <div style="background: #fefce8; border: 1px solid #fde047; border-left: 4px solid #eab308; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="width: 20px; height: 20px; background: #eab308; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: 700;">!</span>
            </div>
              <div>
                <h4 style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px;">Security Notice</h4>
                <ul style="color: #92400e; font-size: 13px; line-height: 1.5; margin: 0; padding-left: 16px;">
                  <li style="margin-bottom: 4px;">Never share this code with anyone</li>
                  <li style="margin-bottom: 4px;">This code expires in 10 minutes</li>
                  <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
          </div>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
              Need help? Contact our support team at 
              <a href="mailto:support@smartsolutionsdigi.com" style="color: #3b82f6; text-decoration: none; font-weight: 500;">support@smartsolutionsdigi.com</a>
            </p>
          </div>
        </div>

        ${getEmailFooter()}
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
        ${getEmailHeader()}
        
        <!-- Main Content -->
        <div style="padding: 40px 30px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: #ffffff; font-size: 28px;">✓</span>
            </div>
            <h2 style="color: #1a202c; font-size: 28px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.5px;">Password Reset Successful</h2>
            <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.5;">Your account is now secure</p>
          </div>
          
          <div style="text-align: left; margin-bottom: 35px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hello <strong style="color: #1a202c;">${userName}</strong>,</p>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0;">
              Your password has been successfully reset. You can now log in to your Smart Solutions account using your new password.
            </p>
          </div>

          <!-- Success Message -->
          <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 1px solid #bbf7d0; border-left: 4px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
            <h3 style="color: #065f46; font-size: 18px; font-weight: 600; margin: 0 0 15px;">Account Secured</h3>
            <p style="color: #047857; font-size: 14px; line-height: 1.5; margin: 0;">
              Your password change was completed successfully. You're all set to continue using Smart Solutions.
            </p>
          </div>

          <!-- Security Recommendations -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h4 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 15px; display: flex; align-items: center; gap: 8px;">
              <span style="width: 20px; height: 20px; background: #3b82f6; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #ffffff; font-size: 12px;">🔒</span>
              </span>
              Security Recommendations
            </h4>
            <ul style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 0; list-style: none;">
              <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                <span style="color: #10b981; font-weight: 700; margin-top: 2px;">•</span>
                Use a strong, unique password for your account
              </li>
              <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                <span style="color: #10b981; font-weight: 700; margin-top: 2px;">•</span>
                Enable two-factor authentication when available
              </li>
              <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                <span style="color: #10b981; font-weight: 700; margin-top: 2px;">•</span>
                Keep your login credentials confidential
              </li>
              <li style="display: flex; align-items: flex-start; gap: 8px;">
                <span style="color: #ef4444; font-weight: 700; margin-top: 2px;">•</span>
                <span>If you didn't make this change, <a href="mailto:security@smartsolutionsdigi.com" style="color: #ef4444; text-decoration: none; font-weight: 600;">contact us immediately</a></span>
              </li>
              </ul>
            </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="#" style="background: linear-gradient(135deg, #1a1a1a 0%, #374151 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; font-size: 14px; display: inline-block; transition: all 0.3s ease;">
              Access Your Account
            </a>
          </div>
        </div>

        ${getEmailFooter()}
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
      subject: 'Welcome to Smart Solutions',
      html: `
        ${getEmailHeader()}
        
        <!-- Main Content -->
        <div style="padding: 40px 30px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);"></div>
              <span style="color: #ffffff; font-size: 32px; position: relative; z-index: 2;">👋</span>
          </div>
            <h2 style="color: #1a202c; font-size: 32px; font-weight: 700; margin: 0 0 8px; letter-spacing: -1px;">Welcome Aboard!</h2>
            <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.5;">You're now part of something extraordinary</p>
            </div>
          
          <div style="text-align: left; margin-bottom: 40px;">
            <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">Hello <strong style="color: #1a202c;">${userName}</strong>,</p>
            <p style="color: #64748b; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
              We're thrilled to welcome you as a <strong style="color: #3b82f6; background: #eff6ff; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${userRole}</strong> to the Smart Solutions family.
            </p>
            <p style="color: #64748b; font-size: 16px; line-height: 1.7; margin: 0;">
              Your journey toward innovation, collaboration, and excellence begins now. We're here to support you every step of the way.
            </p>
          </div>

          <!-- Welcome Features -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: 16px; padding: 30px; margin: 35px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #1a202c; font-size: 20px; font-weight: 600; margin: 0 0 25px; text-align: center;">Ready to Get Started?</h3>
            
            <div style="display: grid; gap: 20px;">
              <div style="display: flex; align-items: flex-start; gap: 15px; padding: 15px; background: #ffffff; border-radius: 12px; border: 1px solid #f1f5f9;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="color: #ffffff; font-size: 18px;">👤</span>
                </div>
                <div>
                  <h4 style="color: #1a202c; font-size: 16px; font-weight: 600; margin: 0 0 5px;">Complete Your Profile</h4>
                  <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">Add your information and customize your account settings</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: flex-start; gap: 15px; padding: 15px; background: #ffffff; border-radius: 12px; border: 1px solid #f1f5f9;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="color: #ffffff; font-size: 18px;">🚀</span>
                </div>
                <div>
                  <h4 style="color: #1a202c; font-size: 16px; font-weight: 600; margin: 0 0 5px;">Explore Your Dashboard</h4>
                  <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">Discover tools and resources designed for your success</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: flex-start; gap: 15px; padding: 15px; background: #ffffff; border-radius: 12px; border: 1px solid #f1f5f9;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="color: #ffffff; font-size: 18px;">🤝</span>
                </div>
                <div>
                  <h4 style="color: #1a202c; font-size: 16px; font-weight: 600; margin: 0 0 5px;">Connect & Collaborate</h4>
                  <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">Join your team and start working on meaningful projects</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Inspirational Quote -->
          <div style="text-align: center; margin: 40px 0; padding: 30px; background: linear-gradient(135deg, #1a1a1a 0%, #374151 100%); border-radius: 16px; color: #ffffff; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>'); opacity: 0.3;"></div>
            <div style="position: relative; z-index: 2;">
              <h3 style="font-size: 22px; font-weight: 600; margin: 0 0 15px; color: #ffffff;">"Innovation is the Outcome of a Habit, Not a Random Act"</h3>
              <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0; font-style: italic;">Let's build something extraordinary together.</p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="#" style="background: linear-gradient(135deg, #1a1a1a 0%, #374151 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              Get Started Now
            </a>
          </div>
        </div>

        ${getEmailFooter()}
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
