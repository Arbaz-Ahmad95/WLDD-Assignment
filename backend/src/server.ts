import app from './app';
import { connectDB } from './config/db';
import { seedInitialData } from './utils/seedData';

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  // Seed demo data if needed
  try {
    await seedInitialData();
  } catch (err: any) {
    console.warn('⚠️ Seeding note:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`
🚀 ========================================================
   Meme'd Campaign Payout Tracker Backend API
   Running at: http://localhost:${PORT}
   Health:     http://localhost:${PORT}/api/health
   Docs / API: Express + TypeScript + Mongoose + Redis Cache
========================================================
    `);
  });
}

startServer();
