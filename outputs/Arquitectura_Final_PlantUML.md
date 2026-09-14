# Arquitectura Final del Sistema (Post-Modificaciones)

Este documento contiene el resumen de las integraciones aplicadas a la plataforma y el diagrama de infraestructura final modelado en **PlantUML**.

## Cambios Implementados en la Arquitectura
Durante la fusión final y las reparaciones de seguridad, la arquitectura del sistema **sí cambió**. Originalmente constaba solo de un Frontend, una API sencilla y MongoDB. Con las nuevas integraciones, la arquitectura evolucionó para incorporar módulos especializados:
1. **Módulo OTP y Correo (SMTP):** El backend ahora interactúa con servicios externos (Gmail SMTP vía Nodemailer) para completar el ciclo de 2FA.
2. **Sistema de Auditoría Inmutable (Hash Chaining):** Mongoose se configuró con hooks especiales e interacción con módulos nativos de criptografía (`crypto`) para generar un Ledger inmutable en la base de datos.
3. **Escudo Edge (Rate Limiting):** Se integró una barrera en la capa de red del backend (`express-rate-limit`) que actúa como un escudo previo a los controladores.
4. **Modal OTP (Frontend):** Se acopló un nuevo flujo asíncrono y componentes UI para manejar códigos de validación sin romper la SPA (Single Page Application).

---

## Código PlantUML de la Arquitectura

Puedes copiar este bloque y pegarlo en [PlantText.com](https://www.planttext.com/) o en un visor de VS Code para visualizar la topología de la aplicación.

```plantuml
@startuml
!theme plain
skinparam componentStyle uml2

actor "Usuario / Cliente" as Cliente

cloud "Vercel Edge Network" as Vercel {
  node "Capa Frontend (Navegador)" as Frontend {
    component "Single Page Application (SPA)" as SPA
    component "Módulo Auth / OTP UI" as OTP_UI
  }
}

node "Entorno Node.js (Servidor / Serverless)" as Backend {
  package "Middlewares de Seguridad" as Shield {
    component "Express Rate Limit" as RateLimit
    component "Helmet & CORS" as Headers
    component "Verificador JWT" as JWT
  }
  
  package "Lógica de Negocio (Controladores)" as Control {
    component "Auth Controller" as Auth
    component "Pago Controller\n(Transacciones ACID)" as Pago
    component "Contrato Controller" as Contrato
  }
  
  package "Servicios Internos" as Servicios {
    component "Nodemailer (SMTP)" as Mailer
    component "Crypto Engine (RSA-PSS)" as Crypto
  }
}

database "MongoDB Atlas (Cloud Cluster)" as Atlas {
  folder "Colecciones Transaccionales" {
    component "Usuarios" as DB_User
    component "Pedidos e Inventario" as DB_Data
  }
  folder "Ledger Criptográfico" {
    component "LogAuditoria (Append-Only)" as DB_Audit
  }
}

' Flujos de interacción
Cliente --> SPA : HTTPS (TLS 1.3)
SPA --> OTP_UI : Interacción Local
SPA --> RateLimit : Peticiones REST API
OTP_UI --> RateLimit : POST /verificar-otp

RateLimit --> Headers
Headers --> JWT
JWT --> Auth : Rutas Públicas/Login
JWT --> Pago : Token Válido
JWT --> Contrato : Verificación IDOR

Auth --> Mailer : Enviar OTP
Auth --> DB_User : CRUD Usuarios
Mailer --> Cliente : Correo Electrónico

Pago --> DB_Data : StartSession (Transacción)
Pago --> DB_Audit : Registrar Evento

Contrato --> Crypto : Solicitar Firma Digital
Crypto --> Contrato : Retorna Documento Firmado

DB_Audit --> Crypto : (Hook) Generar Hash SHA-256

note right of DB_Audit
  Cada log de auditoría está 
  encadenado al anterior
  mediante SHA-256 (Hash Chaining).
end note

@enduml
```
