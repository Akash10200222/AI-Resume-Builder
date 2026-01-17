import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected successfully");
    });
    let mongodbURI = process.env.MONGODB_URI;
    const projectName = "resume-builder";
    if (!mongodbURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    if (mongodbURI.endsWith("/")) {
      mongodbURI = mongodbURI.slice(0, -1);
    }
    await mongoose.connect(`${mongodbURI}/${projectName}`);
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

export default connectDB;


// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     const projectName = "resume-builder";
//     const mongodbURI = process.env.MONGODB_URI;

//     if (!mongodbURI) {
//       throw new Error("MONGODB_URI is not defined");
//     }

//     await mongoose.connect(`${mongodbURI}/${projectName}`, {
//       family: 4, // fixes Windows DNS issues
//     });

//     console.log("Database connected successfully");
//   } catch (error) {
//     console.error("Error connecting to the database:", error.message);
//   }
// };

// export default connectDB;
