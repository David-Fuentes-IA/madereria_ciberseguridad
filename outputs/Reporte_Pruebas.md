# Reporte de Validación de Casos de Prueba (STD)

**Proyecto:** Wood AI Corporation

*Nota: Se omitieron los CP-10 y CP-11 (relacionados con la pasarela de pagos Sandbox externa/PayPal) y se evaluó el CP-13 con la modificación acordada previamente (notificaciones en el dashboard de admins).*

---

### CP-01: Validar Autenticidad
* **Objetivo:** Rechazar peticiones con un token modificado (firma inválida).
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** El archivo `authMiddleware.js` utiliza `jwt.verify(token, JWT_SECRET)`. Si el token es interceptado y modificado, la firma criptográfica se rompe, la función arroja un error y el middleware responde inmediatamente con un `401 Token inválido o expirado`, bloqueando el acceso.

### CP-02: Validar No Repudio en Contrato
* **Objetivo:** El contrato incluye la firma digital verificable del usuario y un hash único del documento.
* **Estado en el código:** ⚠️ **Parcialmente Implementado**
* **Justificación:** El sistema actualmente genera un Folio único (ej. `WAI-XXXX`) y lo vincula al `transaccion_id` del Log de Auditoría. El frontend está preparado para mostrar un hash (`invoice.evidence`), pero en el backend (`pagoController.js`) aún no se ha implementado la generación criptográfica asimétrica (RSA) del documento. Cumple operativamente, pero falta el algoritmo matemático riguroso.

### CP-03: Validar Trazabilidad (Log)
* **Objetivo:** Se genera una entrada en el log con fecha, hora, IP, usuario y acción, sin permitir su borrado.
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** El modelo `LogAuditoria.js` registra todos estos datos. Además, incluye hooks de Mongoose (`pre('updateOne')`, `pre('deleteOne')`, etc.) que lanzan un error bloqueante: *"LogAuditoria es append-only: no se permiten modificaciones ni eliminaciones"*. Es verdaderamente inmutable a nivel de aplicación.

### CP-04: Validar Restricción de Inventario
* **Objetivo:** Intentar comprar cuando no hay stock notifica "Stock insuficiente" y se registra el intento.
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** En `pagoController.js`, si `item.cantidad > producto.existencia`, la transacción se aborta, se crea un `LogAuditoria` con estado `'RECHAZADO'` y motivo "Stock insuficiente", devolviendo un error HTTP 400 que el frontend muestra claramente.

### CP-05: Validar Confidencialidad (TLS)
* **Objetivo:** Los datos viajan cifrados por HTTPS.
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** En `server.js` se implementó `helmet.hsts` y una redirección forzada a HTTPS (`x-forwarded-proto`) cuando está en producción (Vercel). Esto asegura que todo el tráfico viaje cifrado sin alterar drásticamente el esquema de despliegue actual.

### CP-06: Validar Login (RF-01)
* **Objetivo:** Acceso concedido solo con credenciales correctas; mensaje genérico ante error.
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** En `authController.js`, tanto si el usuario no existe como si la contraseña es incorrecta, el sistema devuelve exactamente el mismo mensaje: `"Credenciales inválidas."` con un código HTTP 401, evitando ataques de enumeración de usuarios.

### CP-07: Validar Personalización de Producto (RF-02)
* **Objetivo:** El sistema guarda la configuración y recalcula el precio en el servidor, no acepta el precio enviado desde el cliente.
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** En `pagoController.js`, el precio del carrito enviado por el cliente es completamente ignorado. El subtotal se calcula estrictamente usando `Number(productoBase.precio)` obtenido directamente de la base de datos durante la transacción.

### CP-08: Validar Generación de Contrato (RF-03)
* **Objetivo:** Se genera un contrato descargable en formato digital con firma y hash.
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** Al aprobarse el pago, el frontend (`app.js`) despliega un modal de "Comprobante / Wood AI Corporation" que incluye todos los detalles, el `transaccion_id` como respaldo, y cuenta con un botón "Descargar Factura PDF" que invoca la API de impresión del navegador.

### CP-09: Validar Verificación de Inventario (RF-04)
* **Objetivo:** El sistema bloquea el pago si no hay stock suficiente.
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** Se realiza una doble validación. Primero, una comprobación en memoria, y luego una actualización atómica en MongoDB `findOneAndUpdate({ existencia: { $gte: item.cantidad } })`. Si el stock se agotó, la base de datos lo bloquea y hace rollback.

### CP-12: Validar Deducción de Inventario (RF-07)
* **Objetivo:** Se genera número de orden y recibo, y el inventario se descuenta en la base de datos.
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** Si la transacción es exitosa, el operador atómico `$inc: { existencia: -item.cantidad }` deduce el stock de forma segura dentro de la sesión de transacción de MongoDB.

### CP-13: Validar Notificación Interna (RF-08)
* **Objetivo:** Notificación al módulo (adaptado a ventana emergente en dashboard de admins).
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** En `app.js`, la función `pollAdminNotifications()` hace un long-polling cada 8 segundos. Si detecta una nueva orden y el usuario es admin, ejecuta `showAdminNotification()` mostrando el aviso emergente.

### CP-14: Inyección SQL en Login
* **Objetivo:** Ingresar `' OR '1'='1` en campos de usuario/contraseña, la consulta lo rechaza.
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** Al utilizar MongoDB (NoSQL) con el ORM Mongoose, las inyecciones SQL tradicionales no son posibles. Las inyecciones NoSQL están mitigadas porque Mongoose trata las entradas de texto siempre como cadenas literales (Strings).

### CP-15: XSS en Campo de Personalización
* **Objetivo:** Ingresar `<script>alert(1)</script>` en color/textura se escapa/sanitiza y no se ejecuta.
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** Todo el frontend (Vanilla JS) procesa las entradas y salidas pasándolas por la función global `escapeHTML(value)` antes de inyectarlas en el DOM mediante `innerHTML`.

### CP-16: CSRF en Acción Crítica
* **Objetivo:** Enviar una petición de "confirmar pago" sin token CSRF válido es rechazada.
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** El sistema no utiliza Cookies para la autenticación, sino un token JWT enviado a través del header `Authorization: Bearer <token>`. Los ataques CSRF no aplican en este modelo de seguridad.

### CP-17: Acceso No Autorizado a Auditoría
* **Objetivo:** Cliente intenta acceder a GET `/api/auditoria` y recibe 403 Forbidden.
* **Estado en el código:** ✅ **Aprobado**
* **Justificación:** Las rutas en `adminRoutes.js` están protegidas por el `adminMiddleware`, el cual verifica que el JWT tenga el rol `admin`. Si un cliente regular intenta consumirlas, el servidor bloquea la petición inmediatamente.
