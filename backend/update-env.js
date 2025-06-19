const fs = require('fs');
const path = require('path');

// The app password provided by the user
const appPassword = 'nvgz qtgi szlt teyq';

// Updated .env content
const envContent = `# Database Configuration
MONGODB_URI=mongodb+srv://madhkunchala:Madhu%40123@cluster0.clbjf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=abcodb

# Email Configuration (Gmail)
EMAIL_USER=madhkunchala@gmail.com
EMAIL_PASSWORD=${appPassword}

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5000
NODE_ENV=development
`;

// Update .env file
const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated successfully!');
  console.log(`📧 Email: madhkunchala@gmail.com`);
  console.log(`🔑 App Password: ${appPassword}`);
  console.log('\n🚀 Now you can test the email functionality:');
  console.log('node test-email.js');
} catch (error) {
  console.error('❌ Error updating .env file:', error.message);
} 