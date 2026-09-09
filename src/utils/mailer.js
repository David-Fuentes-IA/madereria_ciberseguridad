const nodemailer = require('nodemailer');

const tieneSMTP = () => Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASSWORD,
);

const crearTransportador = () => {
  if (!tieneSMTP()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const simularEnvioOTP = async (correo) => {
  const codigo = Math.floor(100000 + Math.random() * 900000);
  const transportador = crearTransportador();

  if (transportador) {
    await transportador.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: correo,
      subject: 'Tu código de verificación de Wood AI Corporation',
      text: `Tu código de verificación es: ${codigo}`,
      html: `<p>Tu código de verificación es:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${codigo}</p>`,
    });
    console.log(`Código OTP enviado por SMTP a ${correo}.`);
    return codigo;
  }

  console.log(`
=== SIMULADOR DE CORREO =================
Destino: ${correo}
Asunto: Tu código de verificación de la Maderería
Código: ${codigo}
=========================================
`);

  return codigo;
};

module.exports = {
  simularEnvioOTP,
};
