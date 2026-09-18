const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Primary connection error: ${error.message}`);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`Primary connection failed, attempting memory server fallback...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        const conn = await mongoose.connect(mongoUri);
        console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      } catch (memError) {
        console.error(`Error: ${memError.message}`);
        process.exit(1);
      }
    } else {
      throw error;
    }
  }
};

module.exports = connectDB;