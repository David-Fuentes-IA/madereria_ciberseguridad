# Análisis de Alineación con Marcos de Seguridad Internacionales
**Proyecto:** Wood AI Corporation / Maderería Secure API

A continuación se desmenuza el código del proyecto para buscar la presencia de componentes que satisfagan los tres grandes modelos de ciberseguridad.

---

## 1. Modelo STRIDE (Modelado de Amenazas de Microsoft)

El modelo STRIDE clasifica las amenazas en 6 categorías. Así las aborda el proyecto:

1. **S - Spoofing (Suplantación de Identidad)**
   * **¿Está presente?** Sí.
   * **Implementación:** Se aborda mediante Autenticación Multifactor (OTP) en `authController.js` y el uso de `JWT` blindado en `authMiddleware.js`.
2. **T - Tampering (Alteración de Datos)**
   * **¿Está presente?** Sí, de manera destacada.
   * **Implementación:** El "Hash Chaining" en `LogAuditoria.js` vincula criptográficamente (SHA-256) cada movimiento de la base de datos con el anterior. Alterar un registro invalida toda la cadena.
3. **R - Repudiation (Repudio)**
   * **¿Está presente?** Sí.
   * **Implementación:** Firmas digitales con RSA-PSS en `crypto.js` para los contratos, garantizando que el origen de la transacción no pueda ser negado por el usuario.
4. **I - Information Disclosure (Fuga de Información)**
   * **¿Está presente?** Sí.
   * **Implementación:** Manejo estricto de variables de entorno (`.env`), cifrado de contraseñas con Bcrypt (`Usuario.js`), y uso de la librería `Helmet` para ocultar cabeceras de servidor que podrían delatar la tecnología usada.
5. **D - Denial of Service (Denegación de Servicio)**
   * **¿Está presente?** Sí (Nivel Aplicación).
   * **Implementación:** Mitigado por el módulo `express-rate-limit` en `authRoutes.js`, que limita la cantidad de peticiones permitidas por IP.
   * *Faltante:* No hay mitigación volumétrica (Capa 3 y 4), lo cual requeriría un servicio externo como Cloudflare.
6. **E - Elevation of Privilege (Elevación de Privilegios)**
   * **¿Está presente?** Sí (Parcialmente).
   * **Implementación:** Cierre de la vulnerabilidad IDOR en `contratoController.js` (un usuario raso no puede ver contratos de otros).
   * *Faltante:* El sistema tiene roles (admin/cliente) en el JWT, pero carece de un middleware de Control de Acceso Basado en Roles (RBAC) robusto y complejo para múltiples jerarquías.

---

## 2. MITRE ATT&CK (Tácticas y Técnicas Adversarias Reales)

El proyecto contiene contramedidas para las siguientes técnicas documentadas por MITRE:

* **T1110 - Brute Force (Fuerza Bruta):**
  * *Defensa presente:* El atacante no puede adivinar contraseñas indefinidamente porque el `Rate Limiting` lo bloquea temporalmente. Además, el OTP mitiga el Credential Stuffing (reúso de contraseñas filtradas).
* **T1189 - Drive-by Compromise / Cross-Site Scripting (XSS):**
  * *Defensa presente:* `Helmet` inyecta Content-Security-Policy (CSP) rudimentarias, limitando la ejecución de scripts no autorizados.
* **T1566 - Phishing / Session Hijacking (Secuestro de Sesión):**
  * *Defensa presente:* La *Reautenticación Forzada* en `pagoController.js`. Si un atacante roba la cookie/token y entra al carrito, al momento de querer robar el inventario (pagar), el sistema exige la contraseña original, frustrando el ataque.
* **T1190 - Exploit Public-Facing Application (IDOR/Inyecciones):**
  * *Defensa presente:* Validación de identidad estricta en las descargas de contratos. Uso de Mongoose que por naturaleza parametriza las consultas, mitigando Inyecciones NoSQL.

---

## 3. Modelo ITU-T X.800 (Arquitectura de Seguridad OSI)

El estándar X.800 define 5 servicios fundamentales de seguridad.

1. **Autenticación (Peer Entity & Data Origin):**
   * *Cumplimiento:* Fuerte. Sistema JWT (JSON Web Tokens) validado en cada petición mediante middleware. Se suma OTP (2FA) para autenticación de origen confiable.
2. **Control de Acceso:**
   * *Cumplimiento:* Bueno. Middleware revisa firmas de JWT y bloquea peticiones (HTTP 401/403) antes de que toquen los controladores. Se incluyó verificación de `usuario_id`.
3. **Confidencialidad de Datos:**
   * *Cumplimiento:* Fuerte (En tránsito). Delegado a la infraestructura Edge de Vercel que fuerza HTTPS/TLS 1.3, evitando ataques Man-in-the-Middle (MitM).
4. **Integridad de Datos:**
   * *Cumplimiento:* Sobresaliente. Logrado mediante el `LogAuditoria.js` "Append-only" (solo añadir). Un hook impide modificaciones o borrados a nivel base de datos, y el Hash de integridad garantiza que los datos no han sido modificados en reposo.
5. **No Repudio:**
   * *Cumplimiento:* Activo en entorno Demo. Generación de firmas asimétricas RSA en `crypto.js` aplicadas a contratos digitales. 
   * *Faltante para ser nivel militar:* Que las llaves privadas del RSA provengan del lado del cliente o de un módulo físico (HSM) y no se generen al vuelo en el servidor.
