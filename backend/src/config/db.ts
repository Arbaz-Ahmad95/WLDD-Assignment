import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/memed_payouts';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err: any) {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Don't kill process immediately in dev so app can log status
  }
}
