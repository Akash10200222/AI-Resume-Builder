import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongodbURI = process.env.MONGODB_URI;

    if (!mongodbURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    mongoose.connection.on('connected', () => {
      console.log('Database connected successfully');
    });

    await mongoose.connect(mongodbURI);
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    process.exit(1);
  }
};

export default connectDB;
