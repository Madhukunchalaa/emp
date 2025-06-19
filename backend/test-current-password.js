const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB using the same connection string as server.js
mongoose.connect("mongodb+srv://madhkunchala:Madhu%40123@cluster0.clbjf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testPassword() {
  try {
    // Test with madhkunchala@gmail.com
    const email = 'madhkunchala@gmail.com';
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:');
    console.log('Email:', user.email);
    console.log('Password hash:', user.password);
    console.log('Role:', user.role);
    
    // Test password comparison with the provided password
    const testPassword = '999999';
    const isMatch = await user.comparePassword(testPassword);
    console.log(`Password "${testPassword}" match result:`, isMatch);
    
    // Also test with bcrypt directly
    const bcrypt = require('bcryptjs');
    const directMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`Direct bcrypt "${testPassword}" match result:`, directMatch);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testPassword(); 