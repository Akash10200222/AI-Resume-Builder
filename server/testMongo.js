import mongoose from 'mongoose';
import 'dotenv/config';

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('CONNECTED ✅');
  process.exit(0);
} catch (err) {
  console.error('FAILED ❌', err.message);
  process.exit(1);
}
