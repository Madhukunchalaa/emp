const fs = require('fs');
const path = require('path');

// Template for .env file
const envTemplate = `# Database Configuration
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
`;

// Check if .env file already exists
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('Please update it manually with your Gmail app password.');
  console.log('\nCurrent .env content:');
  console.log(fs.readFileSync(envPath, 'utf8'));
} else {
  // Create .env file
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Enable 2-Factor Authentication on your Gmail account');
  console.log('2. Generate an App Password (16 characters)');
  console.log('3. Replace "your-16-character-app-password-here" in the .env file');
  console.log('4. Run: node test-email.js');
}

console.log('\n📧 Email: madhkunchala@gmail.com');
console.log('🔑 You need to generate an App Password from your Google Account');
console.log('📖 See SETUP_GUIDE.md for detailed instructions'); 