const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/Usuario');
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
    });

    await simularEnvioOTP(correo);

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

    const token = jwt.sign(
      {
        _id: usuario._id,
        rol: usuario.rol,
      },
      'mi_clave_super_secreta_de_desarrollo_123',
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error(`Error en login: ${error.message}`);
    return res.status(500).json({
      mensaje: 'Error interno del servidor.',
    });
  }
};

module.exports = {
  registro,
  login,
};
