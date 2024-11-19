// test-db.js
require('dotenv').config();
const mongoose = require('mongoose');

async function testDatabase() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // List all databases
    const adminDb = conn.connection.db.admin();
    const dbList = await adminDb.listDatabases();
    console.log('\nAvailable databases:');
    dbList.databases.forEach(db => console.log(`- ${db.name}`));

    // List all collections in the current database
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\nCollections in current database:');
    collections.forEach(collection => console.log(`- ${collection.name}`));

    // Try to find the collection with your movies
    for (const collection of collections) {
      const Movie = mongoose.model(collection.name, new mongoose.Schema({}, { strict: false }), collection.name);
      const count = await Movie.countDocuments();
      console.log(`\nDocuments in ${collection.name}: ${count}`);
      
      if (count > 0) {
        const sampleDocs = await Movie.find().limit(2);
        console.log(`Sample documents from ${collection.name}:`);
        console.log(JSON.stringify(sampleDocs, null, 2));
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

testDatabase();