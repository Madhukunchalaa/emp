const { MongoClient } = require('mongodb');

// Replace with your actual Atlas connection string
const uri = "mongodb+srv://madhkunchala:Madhu%40123@cluster0.clbjf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function deleteNonAdmins() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("test"); // Replace with your DB name
    const users = db.collection("users");

    const result = await users.deleteMany({ role: { $ne: "admin" } });
    console.log(`${result.deletedCount} non-admin users deleted.`);
  } catch (err) {
    console.error("Error deleting users:", err);
  } finally {
    await client.close();
  }
}

deleteNonAdmins();
