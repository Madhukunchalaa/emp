const axios = require('axios');

async function testRegistrationOTP() {
  try {
    const testEmail = 'test-welcome@example.com';
    const testUserData = {
      name: 'Welcome Test User',
      email: testEmail,
      password: 'testpassword123',
      role: 'designer'
    };
    
    console.log('Testing registration OTP flow with welcome email...');
    console.log('User data:', testUserData);
    
    // Step 1: Register (should send OTP)
    console.log('\n1. Sending registration request...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', testUserData);
    console.log('Register response:', registerResponse.data);
    
    // Step 2: Check if OTP was created in database
    console.log('\n2. Checking OTP in database...');
    const mongoose = require('mongoose');
    const OTP = require('./models/OTP');
    
    await mongoose.connect("mongodb+srv://madhkunchala:Madhu%40123@cluster0.clbjf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const otpRecord = await OTP.findOne({ 
      email: testEmail, 
      type: 'email_verification',
      isUsed: false 
    });
    
    if (otpRecord) {
      console.log('OTP found:', {
        email: otpRecord.email,
        otp: otpRecord.otp,
        registrationData: otpRecord.registrationData,
        expiresAt: otpRecord.expiresAt
      });
      
      // Step 3: Verify OTP (should create user and send welcome email)
      console.log('\n3. Verifying OTP (this should send welcome email)...');
      const verifyResponse = await axios.post('http://localhost:5000/api/auth/verify-registration-otp', {
        email: testEmail,
        otp: otpRecord.otp
      });
      console.log('Verify response:', verifyResponse.data);
      
      // Step 4: Check if user was created
      console.log('\n4. Checking if user was created...');
      const User = require('./models/User');
      const user = await User.findOne({ email: testEmail });
      
      if (user) {
        console.log('✅ User created successfully:', {
          name: user.name,
          email: user.email,
          role: user.role
        });
        console.log('\n🎉 Welcome email should have been sent to:', testEmail);
        console.log('📧 Check the email inbox for the beautiful welcome message!');
      } else {
        console.log('❌ User was not created');
      }
      
    } else {
      console.log('❌ No OTP record found');
    }
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error testing registration OTP:', error.response?.data || error.message);
  }
}

testRegistrationOTP(); 