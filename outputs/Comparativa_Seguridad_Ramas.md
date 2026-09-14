# Reporte Comparativo de Seguridad: Fix Local vs. Rama `development`

**Proyecto:** Wood AI Corporation / Maderería Secure API  
**Fecha de Análisis:** Septiembre 2026  
**Objetivo:** Contrastar la implementación de la rama remota `development` contra los arreglos locales recientes, con el fin de definir la estrategia de integración final.

---

## 1. Puntos Fuertes de la Rama `development` (Arquitectura Defensiva)

La rama remota ha traducido exitosamente casi todas las recomendaciones del reporte de auditoría v2.0 a nivel de infraestructura y arquitectura:

* ✅ **Prevención de IDOR (Information Disclosure):** En `contratoController.js`, se implementó correctamente la validación de propiedad (`filtro.usuario_id = req.usuario._id`). Esto evita que un atacante enumere y descargue contratos de otros clientes.
* ✅ **Cadena de Custodia Criptográfica (No Repudio):** En `LogAuditoria.js`, el hook `pre('save')` ahora consulta el último registro (`hash_anterior`) y genera un `hash_actual` SHA-256. Esto convierte la bitácora en una pseudo-blockchain inmutable.
* ✅ **Manejo de OTP y Estado (Spoofing):** Se agregó la lógica para mantener a los usuarios recién registrados en estado `'pendiente'`, bloqueando el login hasta que pasen por el nuevo endpoint `/api/auth/verificar-otp`.
* ✅ **Mitigación DoS y Fuerza Bruta:** Se integró la librería `express-rate-limit` en `authRoutes.js`, limitando de forma efectiva los ataques automatizados hacia los endpoints de sesión.

---

## 2. Puntos Fuertes del Fix Local (Lógica Crítica de Negocio)

Nuestro trabajo local se centró en resolver el flujo más crítico del e-commerce (el momento exacto de la transacción económica), el cual la rama `development` ignoró.

* ✅ **Erradicación del Bypass de Seguridad (Zero Trust):** En `pagoController.js`, nosotros eliminamos la "vulnerabilidad intencional" (`// --- BYPASS APLICADO...`) y reconectamos la función `verificarReautenticacion()`. Con nuestro código, es matemáticamente imposible aprobar una compra sin que el usuario confirme su identidad con su contraseña mediante bcrypt.
* ✅ **Manejo Inteligente de Estados (UX/Seguridad):** En el frontend (`public/app.js`), implementamos una lógica robusta para manejar el código `401 Unauthorized` de la pasarela. Si el atacante/usuario falla la contraseña, el sistema muestra el error sin destruir la sesión; pero si el token JWT caducó, limpia los datos y expulsa al usuario.

---

## 3. El Riesgo Crítico en la Rama `development`

Si se despliega la rama `development` tal como está, **el sistema seguirá siendo vulnerable en su núcleo comercial**. Al mantener el bypass en `pagoController.js`, el sistema asume que, si el JWT es válido, la orden se aprueba automáticamente.

> ⚠️ **Vector de ataque persistente en dev:** Si un empleado o cliente deja su computadora desbloqueada (sesión activa), cualquier tercero puede agregar productos al carrito y vaciar el inventario presionando "Pagar". No se le pedirá re-autenticación.

---

## 4. Estrategia de Fusión Recomendada (El Código Definitivo)

Para lograr un sistema 100% resiliente y alineado tanto con las pruebas como con la auditoría, se debe realizar una **Fusión Híbrida**:

1. **Tomar como base la rama `development`**: Absorber toda su protección estructural (Rate Limiting, OTP, IDOR parcheado, Logs encadenados).
2. **Inyectar nuestros controladores**: Sobrescribir el archivo `pagoController.js` y el script frontend `public/app.js` de la rama `development` con las versiones que nosotros reparamos localmente hoy.

### Resultado de la fusión:
Un e-commerce que frena la fuerza bruta desde la red, impide la filtración cruzada de facturas, encadena criptográficamente cada movimiento del usuario, y **obliga a una firma con contraseña local antes de tocar un solo producto del inventario**.
