const axios = require('axios');

async function testResetPassword() {
  try {
    const email = 'madhkunchala@gmail.com';
    const newPassword = 'testpassword123';
    
    console.log('Testing reset password for:', email);
    console.log('New password:', newPassword);
    
    const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
      email: email,
      newPassword: newPassword
    });
    
    console.log('Reset password response:', response.data);
    
    // Now test if the password was actually updated
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://madhkunchala:Madhu%40123@cluster0.clbjf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await user.comparePassword(newPassword);
      console.log('Password match after reset:', isMatch);
      console.log('New password hash:', user.password);
    }
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error testing reset password:', error.response?.data || error.message);
  }
}

testResetPassword(); 