import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    
    // Mask the URI for logging (hide password)
    const maskedUri = uri.replace(/\/\/(.*):(.*)@/, '//***:***@');
    console.log(`Attempting to connect to MongoDB at ${maskedUri}...`);
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds for better reliability
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to avoid some DNS/SSL issues
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error instanceof Error ? error.message : error}`);
    
    if (error instanceof Error && error.message.includes('SSL routines')) {
      console.warn('--- SSL/TLS Connection Issue Detected ---');
      console.warn('This often happens if your MongoDB Atlas IP Whitelist is not configured correctly.');
      console.warn('Please ensure that the IP address of this environment is allowed in your MongoDB Atlas settings.');
      console.warn('Alternatively, you can try adding "?tls=true&tlsAllowInvalidCertificates=false" to your connection string.');
    }
    
    console.warn('The server will continue to run, but database features will be unavailable.');
  }
};

export default connectDB;
