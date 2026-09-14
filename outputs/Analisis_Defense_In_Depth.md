# Análisis de Defensa en Profundidad (Defense in Depth)
**Proyecto:** Wood AI Corporation / Maderería Secure API  
**Analista:** Antigravity AI Security 

## 1. ¿Qué es la Defensa en Profundidad?
El principio de **Defense in Depth (DiD)** es una estrategia de ciberseguridad que consiste en colocar múltiples capas de controles de seguridad (defensas superpuestas) en un sistema de TI. La premisa es que si un atacante logra evadir una medida de seguridad, la siguiente capa lo detendrá. No existe la "bala de plata" en seguridad; el objetivo es retrasar al atacante y alertar al equipo.

## 2. ¿Está presente en nuestro proyecto?
**Sí, está claramente presente.** Tras la integración de la rama `development` y las correcciones locales, la plataforma *Maderería Secure API* dejó de depender de un solo candado (como un simple login) y evolucionó hacia un modelo multicapa.

## 3. ¿Cómo está presente? (Análisis por Capas)

Actualmente, el proyecto implementa las siguientes capas superpuestas:

### Capa 1: Seguridad Perimetral y de Red
* **Vercel Edge & HTTPS:** Todo el tráfico viaja cifrado. El sistema rechaza peticiones HTTP puras.
* **Rate Limiting (`express-rate-limit`):** Si un atacante intenta un ataque de denegación de servicio (DDoS) o fuerza bruta contra los endpoints de autenticación, el firewall a nivel de aplicación bloquea su IP después de un número determinado de intentos.

### Capa 2: Seguridad de Aplicación (Cabeceras y Sesión)
* **Helmet.js:** Protege la aplicación inyectando cabeceras HTTP de seguridad (prevención de Clickjacking, XSS, MIME sniffing).
* **Autenticación con JSON Web Tokens (JWT):** Las sesiones no se manejan con cookies vulnerables a CSRF directo. Además, el JWT tiene un `SESSION_TTL` (tiempo de vida limitado), forzando la expiración de sesiones abandonadas.

### Capa 3: Lógica de Negocio y Control de Acceso (Zero Trust)
* **Mitigación IDOR en Contratos:** Aunque un usuario tenga un JWT válido, el controlador `contratoController.js` verifica que el archivo solicitado pertenezca estrictamente al `usuario_id` del token. No se confía ciegamente en el parámetro de la URL.
* **Autenticación Multifactor (OTP):** El acceso a la plataforma requiere "Algo que sabes" (Contraseña) y "Algo que tienes" (Acceso a tu bandeja de correo para el código de 6 dígitos).
* **Reautenticación Crítica (Checkout):** Antes de afectar recursos valiosos (descontar inventario), el sistema asume que la sesión pudo ser secuestrada (Session Hijacking) y exige la contraseña nuevamente (`pagoController.js`).

### Capa 4: Seguridad de Datos y Criptografía
* **Protección de Credenciales:** Mongoose no guarda contraseñas en texto plano. Se utiliza `bcryptjs` con un "salt" de 10 rondas para resistir ataques de tablas arcoíris.
* **Trazabilidad Inmutable (Blockchain-style):** El modelo `LogAuditoria.js` utiliza Hash Chaining (SHA-256). Cada registro guarda un hash criptográfico calculado a partir del hash del registro anterior. Si un atacante interno (Insider Threat) altera un registro viejo en la base de datos, la cadena matemática se rompe, haciendo la manipulación evidente de inmediato.

---

## 4. ¿Qué se necesita para mejorarlo? (Siguientes pasos)
Aunque la aplicación cuenta con un diseño defensivo robusto para su escala actual, una arquitectura de nivel bancario requeriría integrar tecnologías adicionales en capas externas e internas:

1. **Web Application Firewall (WAF) Dedicado:** 
   * **Faltante:** Implementar Cloudflare o AWS WAF frente a Vercel para detener bots maliciosos, escaneos de vulnerabilidades y ataques SQLi/XSS antes de que toquen el backend de Node.js.
2. **Hardware Security Module (HSM) / Key Management Service (KMS):** 
   * **Faltante:** Actualmente la firma RSA de los contratos genera pares de claves al vuelo (`crypto.generateKeyPairSync`). Para un "No Repudio" legalmente vinculante, las claves privadas deben vivir en una bóveda de hardware (AWS KMS o Azure Key Vault) donde ni siquiera los desarrolladores puedan extraerlas.
3. **Gestión de Eventos e Información de Seguridad (SIEM):** 
   * **Faltante:** Los registros inmutables existen en MongoDB, pero no hay un sistema que los "lea" en tiempo real. Se requeriría conectar el backend a Datadog, Splunk o Elastic Security para disparar alarmas al celular del administrador si hay demasiados `LogAuditoria` con estado "Rechazado".
4. **Rotación Automática de Secretos:** 
   * **Faltante:** El `JWT_SECRET` vive estático en el archivo `.env`. En un modelo avanzado, un gestor de secretos (HashiCorp Vault) inyectaría y rotaría estas llaves cada 30 días sin intervención humana.
