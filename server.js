require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const contratoRoutes = require('./src/routes/contratoRoutes');
const pagoRoutes = require('./src/routes/pagoRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const { inicializarCatalogo } = require('./src/config/seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Cabeceras de seguridad HTTP básicas.
app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', authRoutes);
// Rutas de contratos bajo el prefijo plural de la API.
app.use('/api/contratos', contratoRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/productos', productoRoutes);

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

const startServer = async () => {
  try {
    await connectDB();
    await inicializarCatalogo();

    app.listen(PORT, () => {
      console.log(`Madereria Secure API escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`El servidor no pudo iniciar: ${error.message}`);
    process.exit(1);
  }
};

startServer();
