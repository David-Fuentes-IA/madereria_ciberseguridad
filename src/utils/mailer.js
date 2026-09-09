const simularEnvioOTP = async (correo) => {
  const codigo = Math.floor(100000 + Math.random() * 900000);

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

