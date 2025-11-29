import mongoose from 'mongoose'

// MongoDB URI - puede ser local o remoto (MongoDB Atlas, etc.)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/econoky'

if (!MONGODB_URI) {
  throw new Error('Por favor define la variable de entorno MONGODB_URI')
}

/**
 * Global es usado aquí para mantener una instancia en caché de la conexión
 * entre recargas de hot-reload en desarrollo.
 * Esto previene que las conexiones crezcan exponencialmente
 * durante las recargas de API.
 */
let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => {
      return mongoose.connection
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
