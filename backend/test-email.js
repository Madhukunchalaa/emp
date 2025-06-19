const { generateOTP, sendOTPEmail } = require('./utils/emailService');

// Test email functionality
async function testEmail() {
  try {
    console.log('Testing email functionality...');
    
    // Generate OTP
    const otp = generateOTP();
    console.log('Generated OTP:', otp);
    
    // Test email (user's email)
    const testEmail = 'madhkunchala@gmail.com';
    const testName = 'Madhkunchala';
    
    console.log(`Sending test email to: ${testEmail}`);
    
    // Send test email
    const result = await sendOTPEmail(testEmail, otp, testName);
    
    if (result) {
      console.log('✅ Email sent successfully!');
      console.log('Check your email inbox for the OTP code');
    } else {
      console.log('❌ Failed to send email');
    }
    
  } catch (error) {
    console.error('❌ Error testing email:', error.message);
  }
}

// Run test
testEmail(); 