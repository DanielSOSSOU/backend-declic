require('dotenv').config();
const createApp = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
