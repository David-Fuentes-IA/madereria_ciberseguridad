const mongoose = require('mongoose');

mongoose.connection.on('connected', () => {
  console.log(`MongoDB conectado correctamente en ${mongoose.connection.host}`);
});

mongoose.connection.on('error', (error) => {
  console.error(`Error en la conexión de MongoDB: ${error.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB desconectado.');
});

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('La variable de entorno MONGODB_URI no está definida.');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    console.error(`No se pudo conectar a MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;

