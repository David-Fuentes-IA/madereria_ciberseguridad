require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const contratoRoutes = require('./src/routes/contratoRoutes');
const pagoRoutes = require('./src/routes/pagoRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const Producto = require('./src/models/Producto');

const app = express();
const PORT = process.env.PORT || 3000;

// Cabeceras de seguridad HTTP básicas.
app.use(helmet());
app.use(express.json());
app.use('/api/auth', authRoutes);
// Rutas de contratos bajo el prefijo plural de la API.
app.use('/api/contratos', contratoRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/productos', productoRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

const startServer = async () => {
  try {
    await connectDB();

    const cantidadProductos = await Producto.countDocuments();

    if (cantidadProductos === 0) {
      await Producto.create({
        tipo_madera: 'Roble',
        precio: 500,
        existencia: 20,
        estado: 'activo',
      });
      console.log('Producto de prueba insertado correctamente.');
    }

    app.listen(PORT, () => {
      console.log(`Madereria Secure API escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`El servidor no pudo iniciar: ${error.message}`);
    process.exit(1);
  }
};

startServer();
