require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const { seedData } = require('./utils/seed');

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedData();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
