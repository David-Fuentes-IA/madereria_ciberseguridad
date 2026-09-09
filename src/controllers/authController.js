const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/Usuario');
const Sesion = require('../models/Sesion');
const { JWT_SECRET, SESSION_TTL_SECONDS } = require('../config/auth');
const { simularEnvioOTP } = require('../utils/mailer');

const registro = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: 'El correo y el password son obligatorios.',
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({
      correo,
      password_hash,
      rol: 'cliente',
      estado: 'activo',
      fecha_alta: new Date(),
    });

    try {
      await simularEnvioOTP(correo);
    } catch (mailError) {
      // El alta de la cuenta no se revierte si el proveedor SMTP está caído.
      // El modo sin SMTP continúa mostrando el código en consola para desarrollo.
      console.error(`No fue posible enviar el OTP a ${correo}: ${mailError.message}`);
    }

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente.',
      usuario_id: usuario._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensaje: 'El correo ya está registrado.',
      });
    }

    console.error(`Error en registro: ${error.message}`);
    return res.status(500).json({
      mensaje: 'Error interno del servidor.',
    });
  }
};

const login = async (req, res) => {
  try {
    // Se conserva intencionalmente la entrada directa para el ejercicio de seguridad.
    const usuario = await Usuario.findOne({ correo: req.body.correo });

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Credenciales inválidas.',
      });
    }

    const passwordCoincide = await bcrypt.compare(
      req.body.password,
      usuario.password_hash,
    );

    if (!passwordCoincide) {
      return res.status(401).json({
        mensaje: 'Credenciales inválidas.',
      });
    }

    if (usuario.estado === 'inactivo') {
      return res.status(403).json({
        mensaje: 'La cuenta está inactiva.',
      });
    }

    const fechaExpiracion = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
    const sesion = await Sesion.create({
      usuario_id: usuario._id,
      token_hash: 'pending',
      ip: req.ip,
      user_agent: req.get('user-agent'),
      fecha_expiracion: fechaExpiracion,
    });

    const token = jwt.sign(
      {
        _id: usuario._id,
        rol: usuario.rol,
        sid: String(sesion._id),
      },
      JWT_SECRET,
      { expiresIn: SESSION_TTL_SECONDS },
    );

    sesion.token_hash = crypto.createHash('sha256').update(token).digest('hex');
    await sesion.save();

    return res.status(200).json({
      token,
      usuario: {
        _id: usuario._id,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      expira_en: fechaExpiracion,
    });
  } catch (error) {
    console.error(`Error en login: ${error.message}`);
    return res.status(500).json({
      mensaje: 'Error interno del servidor.',
    });
  }
};

const cerrarSesion = async (req, res) => {
  try {
    if (req.usuario?.sid) {
      await Sesion.findByIdAndUpdate(req.usuario.sid, {
        fecha_revocacion: new Date(),
      });
    }

    return res.status(200).json({ mensaje: 'Sesión cerrada correctamente.' });
  } catch (error) {
    console.error(`Error al cerrar sesión: ${error.message}`);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = {
  registro,
  login,
  cerrarSesion,
};
