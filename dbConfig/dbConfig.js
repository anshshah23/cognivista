import mongoose from "mongoose"

const connect = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection.asPromise()
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

export default connect

