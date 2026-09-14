# Wood AI Corporation — Maderería Secure API 🌲🔒
> **Plataforma Web Segura para Gestión y Comercialización Maderera**  
> *Prototipo Académico de Ciberseguridad con Controles Criptográficos, Integridad Inmutable y Transacciones ACID.*

---

## 🏛️ Contexto Académico e Institucional

* **Institución:** Universidad Autónoma del Estado de México (UAEMex)
* **Facultad:** Facultad de Ingeniería
* **Licenciatura:** Ingeniería en Computación / Sistemas
* **Asignatura:** Ciberseguridad — 5° Semestre (Grupo A1)
* **Docente Titular:** Profesora Judith Moreno Jimenez
* **Equipo de Desarrollo y Auditoría:**
  * Debbie Marina Padilla Lara
  * Daniel Aguilar Garduño
  * David Nava Fuentes
  * Isaac Sánchez Camacho
* **Fecha:** Septiembre de 2026

---

## 📋 Descripción del Proyecto

**Wood AI Corporation (Maderería Secure API)** es una plataforma web desarrollada para demostrar la implementación práctica de controles de ciberseguridad en un entorno de comercio electrónico de catálogo, personalización de productos madereros, carrito de compra y checkout.

A diferencia de un e-commerce convencional, el sistema implementa una arquitectura de **Defensa en Profundidad (Defense in Depth)** orientada a satisfacer los marcos de seguridad **STRIDE**, **MITRE ATT&CK** y el estándar **ITU-T X.800**, asegurando:
1. **Autenticidad:** Doble factor de autenticación (2FA/OTP) y sesiones Stateless con JSON Web Tokens (JWT).
2. **Integridad:** Trazabilidad inmutable mediante *Hash Chaining* (estilo Blockchain con SHA-256) en la colección de auditoría.
3. **No Repudio:** Emisión de contratos de compraventa con firma digital asimétrica RSA-PSS y huella criptográfica.
4. **Resiliencia Operativa:** Control de concurrencia y descuentos atómicos de inventario bajo transacciones ACID de MongoDB (`session.withTransaction`).
5. **Mitigación contra Secuestro de Sesión:** Reautenticación forzada de contraseña antes de procesar el cobro.

---

## 🛠️ Stack Tecnológico

| Capa / Módulo | Tecnologías Utilizadas |
| :--- | :--- |
| **Backend Runtime** | Node.js (v20+ / v24) con arquitectura modular CommonJS |
| **Framework HTTP** | Express.js 5.x |
| **Base de Datos** | MongoDB Atlas (Cluster Cloud con Replica Set para transacciones) |
| **ODM / Persistencia** | Mongoose 8.x |
| **Seguridad Perimetral**| `express-rate-limit` (Anti-Fuerza Bruta / DoS), `helmet` (Cabeceras HTTP de seguridad), `cors` |
| **Criptografía & Auth** | `bcryptjs` (Salt de 10 rondas), `jsonwebtoken` (HMAC-SHA256), `node:crypto` (RSA-PSS, SHA-256) |
| **Notificaciones / Correo** | `nodemailer` (Integración SMTP y emulador en consola) |
| **Frontend** | Vanilla JavaScript (Single Page Application - SPA), HTML5 Semántico, CSS3 Moderno |
| **Despliegue** | Vercel Edge Network |

---

## 🛡️ Arquitectura de Ciberseguridad

```
[ Cliente / Navegador Web ]
       │  (HTTPS / TLS 1.3 - Vercel Edge)
       ▼
┌─────────────────────────────────────────────────────────────┐
│                   MIDDLEWARES DE SEGURIDAD                  │
│  • express-rate-limit (Bloqueo de IPs abusivas / Fuerza Bruta) │
│  • Helmet (Protección CSP, X-Frame-Options, HSTS)           │
│  • authMiddleware (Verificación criptográfica de JWT Bearer) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLADORES Y LÓGICA                   │
│  • authController: Registro, Login unificado y 2FA/OTP      │
│  • pagoController: Reautenticación forzada + Transacción ACID│
│  • contratoController: Verificación anti-IDOR de contratos   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼ (Firma RSA / SHA-256)         ▼ (Transacción Atómica)
┌──────────────────────────────┐ ┌────────────────────────────┐
│      MOTOR CRIPTOGRÁFICO     │ │       MONGODB ATLAS        │
│  • Firmas asimétricas RSA    │ │  • Usuarios, Pedidos, Stock│
│  • Hash Chaining Recursivo   │ │  • LogAuditoria (Inmutable)│
└──────────────────────────────┘ └────────────────────────────┘
```

### Controles Destacados:
* **Anti-Enumeración de Usuarios:** Las credenciales erróneas devuelven un mensaje genérico `"Credenciales inválidas"` (HTTP 401).
* **Hash Chaining en Auditoría:** Cada registro en `LogAuditoria` se enlaza matemáticamente al registro previo:  
  `hash_actual = SHA-256(hash_anterior + fecha + accion + usuario_id)`.  
  Cualquier intento de alteración manual en la base de datos rompe la cadena.
* **Modelo Append-Only:** Middlewares de Mongoose bloquean de manera estricta `updateOne`, `deleteMany`, etc.
* **Prevención de Inyecciones (NoSQL / XSS):** Tipado estricto en esquemas Mongoose y sanitización contextual con `escapeHTML()` en frontend.

---

## 📁 Estructura del Proyecto

```text
madereria-secure-api/
│
├── public/                     # Frontend estático (Vanilla JS SPA)
│   ├── app.js                  # Lógica del cliente, carrito, OTP y reautenticación
│   ├── index.html              # Estructura de vistas y modales seguros
│   └── styles.css              # Estilos visuales y diseño responsivo
│
├── src/
│   ├── config/
│   │   ├── db.js               # Conexión a MongoDB Atlas con Mongoose
│   │   └── seed.js             # Catálogo inicial de 15 tipos de madera
│   │
│   ├── controllers/
│   │   ├── authController.js   # Registro, login, emisión de JWT y verificación OTP
│   │   ├── contratoController.js# Emisión de contratos protegida contra IDOR
│   │   └── pagoController.js   # Checkout transaccional con reautenticación
│   │
│   ├── middlewares/
│   │   ├── adminMiddleware.js  # Control de acceso basado en rol administrativo
│   │   └── authMiddleware.js   # Extracción y validación de tokens JWT
│   │
│   ├── models/
│   │   ├── Contrato.js         # Modelo de contratos de compraventa
│   │   ├── LogAuditoria.js     # Libro mayor inmutable (Hash Chaining)
│   │   ├── Pedido.js           # Órdenes de compra con generación de Folio WAI
│   │   ├── Producto.js         # Inventario y catálogo con control de stock
│   │   ├── Sesion.js           # Registro de sesiones activas y revocadas
│   │   └── Usuario.js          # Credenciales con Bcrypt y estado OTP
│   │
│   ├── routes/
│   │   ├── adminRoutes.js      # Rutas privilegiadas de auditoría
│   │   ├── authRoutes.js       # Rutas protegidas por express-rate-limit
│   │   ├── contratoRoutes.js   # Rutas de contratos
│   │   ├── pagoRoutes.js       # Endpoint de checkout transaccional
│   │   └── productoRoutes.js   # Consulta pública de inventario
│   │
│   └── utils/
│       ├── crypto.js           # Generación de llaves y firmas RSA-PSS
│       └── mailer.js           # Envío de OTP vía SMTP o consola (Modo Dev)
│
├── .env.example                # Plantilla de variables de entorno requeridas
├── package.json                # Dependencias y scripts del proyecto
├── server.js                   # Punto de entrada HTTP y configuración de Express
└── vercel.json                 # Configuración de despliegue en Vercel
```

---

## ⚙️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de contar con:
* [Node.js](https://nodejs.org/) (versión 18.x, 20.x o superior instalada).
* [Git](https://git-scm.com/) para el control de versiones.
* Un clúster activo en [MongoDB Atlas](https://www.mongodb.com/atlas) (requerido para soportar transacciones ACID de réplica).

---

## 🚀 Instrucciones de Instalación y Ejecución

### 1. Clonar el Repositorio
```bash
git clone https://github.com/David-Fuentes-IA/madereria_ciberseguridad.git
cd madereria_ciberseguridad/madereria-secure-api
```

### 2. Instalar Dependencias
Instala los paquetes necesarios definidos en `package.json` (incluyendo `express-rate-limit`, `bcryptjs`, `jsonwebtoken`, etc.):
```bash
npm install
```

### 3. Configurar Variables de Entorno (`.env`)
Crea un archivo llamado `.env` en la raíz de la carpeta `madereria-secure-api`:
```env
# Conexión a MongoDB Atlas (Debe ser un clúster con Replica Set)
MONGODB_URI=mongodb+srv://<usuario>:<password>@<tu-cluster>.mongodb.net/?retryWrites=true&w=majority

# Clave secreta simétrica para la firma de JSON Web Tokens
JWT_SECRET=tu_clave_super_secreta_de_ciberseguridad_2026

# Puerto del servidor local
PORT=3000

# (Opcional) Configuración SMTP para envío real de correos OTP
# Si se omiten, el sistema imprimirá el código OTP directamente en la consola.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo_de_pruebas@gmail.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion_google
SMTP_FROM=Wood AI Corporation <tu_correo_de_pruebas@gmail.com>
```

> ⚠️ **Nota de Seguridad:** Nunca incluyas credenciales reales ni tu contraseña personal en el `.env`. Para pruebas con correo real, utiliza una cuenta desechable y una *Contraseña de Aplicación* de Google.

### 4. Poblar la Base de Datos (Opcional / Inicial)
Si la base de datos está vacía, puedes ejecutar el seed para cargar las 15 maderas iniciales:
```bash
npm run seed
```

### 5. Iniciar el Servidor
Inicia la API en tu entorno local:
```bash
node server.js
# o mediante npm:
npm start
```

El servidor desplegará en la consola:
```text
Servidor seguro escuchando en http://localhost:3000
Conectado exitosamente a MongoDB Atlas
```

---

## 🧪 Guía para Probar los Flujos de Seguridad

1. **Abrir la Aplicación:**
   Accede en tu navegador a `http://localhost:3000`.

2. **Registro de Usuario y Doble Factor (2FA/OTP):**
   * Ve a la pestaña **Registro** e ingresa un correo (ej. `cliente@woodai.com`) y una contraseña.
   * Al dar clic en *"Crear cuenta"*, se abrirá automáticamente el **Modal de Verificación OTP**.
   * Revisa la terminal de Visual Studio Code donde corre `node server.js`; verás un mensaje con el código:
     ```text
     [MAIL MOCK] Correo simulado a cliente@woodai.com | Código OTP: 123456
     ```
   * Ingresa dicho código de 6 dígitos en la página para activar tu cuenta.

3. **Catálogo y Carrito:**
   * Inicia sesión con tus credenciales activas.
   * Explora el catálogo de 15 maderas y añade productos al carrito.

4. **Checkout y Reautenticación Forzada:**
   * En el carrito, haz clic en **Pagar**.
   * Aparecerá la ventana modal de seguridad: *"Confirma tu contraseña"*.
   * Ingresa tu contraseña: el servidor valida tu identidad antes de invocar `session.withTransaction`.
   * El stock se descontará atómicamente, se emitirá tu orden con **Folio WAI**, y se generará el contrato con firma digital.

---

## ☁️ Despliegue en Producción (Vercel)

El proyecto incluye el archivo de configuración `vercel.json` para despliegues Serverless:
1. Conecta el repositorio de GitHub con tu proyecto en [Vercel](https://vercel.com).
2. En el panel de Vercel (*Settings -> Environment Variables*), agrega:
   * `MONGODB_URI`
   * `JWT_SECRET`
3. Cada commit a la rama `master` disparará una compilación y despliegue automático con HTTPS/TLS forzado en el Edge.

---

## 📊 Matriz de Validación de Pruebas (STD)

El proyecto fue auditado exhaustivamente mediante un Plan de Pruebas de Software (STD) con **100% de efectividad** sobre los casos de prueba evaluados:

| Categoría | Casos de Prueba | Resultado |
| :--- | :--- | :---: |
| **Autenticación & Sesión** | CP-01 (JWT), CP-06 (Login/2FA), CP-16 (Anti-CSRF), CP-17 (IDOR/Roles) | ✅ Aprobado |
| **Criptografía & Logs** | CP-02 (No Repudio), CP-03 (Hash Chaining), CP-05 (TLS), CP-08 (Contrato RSA) | ✅ Aprobado |
| **Lógica e Inventario** | CP-04 (Stock), CP-07 (Precios), CP-09 (Bloqueo), CP-12 (Deducción ACID), CP-13 (Notificación) | ✅ Aprobado |
| **Vulnerabilidades Web** | CP-14 (Anti-SQLi/NoSQL), CP-15 (Anti-XSS con escapeHTML) | ✅ Aprobado |

*(Los reportes completos y matrices de resultados se encuentran documentados en la carpeta `outputs/Reporte_Resultados_Pruebas.pdf`).*

---

## 👥 Créditos y Autores
Proyecto desarrollado y auditado para la materia de **Ciberseguridad** — **Facultad de Ingeniería, UAEMex**:
* **Debbie Marina Padilla Lara** — *Criptografía, No Repudio y Contratos*
* **Daniel Aguilar Garduño** — *Autenticación, Sesiones y Seguridad Perimetral*
* **David Nava Fuentes** — *Lógica de Negocio, Transacciones ACID e Integración*
* **Isaac Sánchez Camacho** — *Auditoría Web, OWASP Top 10 y Frontend SPA*
