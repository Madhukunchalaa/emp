const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb+srv://madhkunchala:Madhu%40123@cluster0.clbjf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected for testing');
  testPasswordReset();
})
.catch((err) => console.error('MongoDB connection error:', err));

async function testPasswordReset() {
  try {
    const email = 'madhkunchala@gmail.com';
    
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return;
    }
    
    console.log('✅ User found:', {
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash: user.password.substring(0, 20) + '...' // Show first 20 chars of hash
    });
    
    // Test with a sample password
    const testPassword = 'test123';
    const isMatch = await user.comparePassword(testPassword);
    
    console.log('🔍 Password test results:');
    console.log('- Test password:', testPassword);
    console.log('- Password match:', isMatch);
    
    // Test with another password
    const testPassword2 = 'newpassword123';
    const isMatch2 = await user.comparePassword(testPassword2);
    
    console.log('- Test password 2:', testPassword2);
    console.log('- Password match 2:', isMatch2);
    
    console.log('\n💡 If both tests return false, the password was successfully reset.');
    console.log('💡 Try logging in with the NEW password you created during the reset process.');
    
  } catch (error) {
    console.error('❌ Error testing password reset:', error);
  } finally {
    mongoose.connection.close();
  }
} 