const mongoose = require('mongoose');
const DailyUpdate = require('./models/DailyUpdate');

async function testImageUrls() {
  try {
    console.log('Testing daily updates and image URL storage...');
    
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://madhkunchala:Madhu%40123@cluster0.clbjf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Get all daily updates
    const allUpdates = await DailyUpdate.find({})
      .populate('employee', 'name email')
      .limit(10);
    
    console.log(`Found ${allUpdates.length} total daily updates:`);
    
    allUpdates.forEach((update, index) => {
      console.log(`\n${index + 1}. Update ID: ${update._id}`);
      console.log(`   Employee: ${update.employee?.name || 'Unknown'}`);
      console.log(`   Project: ${update.project_title || 'Untitled'}`);
      console.log(`   Status: ${update.status || 'N/A'}`);
      console.log(`   Has imageUrl: ${!!update.imageUrl}`);
      console.log(`   Image URL: ${update.imageUrl || 'No image'}`);
      console.log(`   Created: ${update.createdAt}`);
      console.log(`   Update text: ${update.update ? update.update.substring(0, 50) + '...' : 'No update text'}`);
    });
    
    // Check for updates with images specifically
    const updatesWithImages = await DailyUpdate.find({ imageUrl: { $exists: true, $ne: null } })
      .populate('employee', 'name email');
    
    console.log(`\nUpdates with images: ${updatesWithImages.length}`);
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error testing image URLs:', error);
  }
}

testImageUrls(); 