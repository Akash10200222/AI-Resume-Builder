import mongoose from "mongoose";

mongoose
  .connect("mongodb+srv://resume:resume1234@cluster0.srcfn5u.mongodb.net")
  .then(() => {
    console.log("CONNECTED ✅");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILED ❌", err.message);
    process.exit(1);
  });
