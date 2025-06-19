const { sendWelcomeEmail } = require('./utils/emailService');

async function testWelcomeEmail() {
  try {
    console.log('Testing welcome email function...');
    
    const testEmail = 'madhkunchala@gmail.com'; // Use your email to test
    const userName = 'Test User';
    const userRole = 'Developer';
    
    console.log('Sending welcome email to:', testEmail);
    console.log('User name:', userName);
    console.log('User role:', userRole);
    
    const result = await sendWelcomeEmail(testEmail, userName, userRole);
    
    if (result) {
      console.log('✅ Welcome email sent successfully!');
      console.log('📧 Check your email inbox for the beautiful welcome message!');
    } else {
      console.log('❌ Failed to send welcome email');
    }
    
  } catch (error) {
    console.error('Error testing welcome email:', error);
  }
}

testWelcomeEmail(); 