const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB using the same connection string as server.js
mongoose.connect("mongodb+srv://madhkunchala:Madhu%40123@cluster0.clbjf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function listUsers() {
  try {
    const users = await User.find({});
    
    console.log(`Found ${users.length} users:`);
    console.log('----------------------------------------');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
      console.log('----------------------------------------');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

listUsers(); 