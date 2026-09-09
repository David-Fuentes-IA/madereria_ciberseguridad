const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_super_secreta_de_desarrollo_123';
const configuredTtl = Number(process.env.SESSION_TTL_SECONDS);
const SESSION_TTL_SECONDS = Number.isInteger(configuredTtl) && configuredTtl > 0
  ? configuredTtl
  : 60 * 60 * 8;

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET debe estar definido en producción.');
}

module.exports = {
  JWT_SECRET,
  SESSION_TTL_SECONDS,
};
