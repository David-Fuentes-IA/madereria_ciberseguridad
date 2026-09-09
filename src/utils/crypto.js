const crypto = require('crypto');

const generarFirma = (datosContrato) => {
  const contenido =
    typeof datosContrato === 'string'
      ? datosContrato
      : JSON.stringify(datosContrato);

  if (typeof contenido !== 'string') {
    throw new TypeError('datosContrato debe ser un string o un objeto serializable.');
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  const hash = crypto
    .createHash('sha256')
    .update(contenido, 'utf8')
    .digest('hex');

  const firmador = crypto.createSign('RSA-SHA256');
  firmador.update(hash, 'utf8');
  firmador.end();

  const firma = firmador.sign(privateKey, 'base64');

  return {
    hash,
    firma,
    clave_publica: publicKey,
  };
};

module.exports = {
  generarFirma,
};

