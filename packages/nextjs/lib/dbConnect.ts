import mongoose from "mongoose";

const MDB_URI: any = process.env.MONGODB_URI;

if (!MDB_URI) throw new Error("Add mongodb uri to .env");

async function dbConnect() {
  try {
    const conn = await mongoose.connect(MDB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.log(err);
  }
}

export default dbConnect;
