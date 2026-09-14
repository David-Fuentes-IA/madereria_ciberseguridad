# -*- coding: utf-8 -*-
"""
Generador de Reporte Académico en PDF: Validación de Casos de Prueba (STD)
Universidad Autónoma del Estado de México - Facultad de Ingeniería
Curso: Ciberseguridad | Septiembre 2026
Estilo: Formato Académico Riguroso, Monocromático Profesional (Solo Negro/Gris, Cero Azul).
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class UniversityNumberedCanvas(canvas.Canvas):
    """
    Canvas personalizado con numeración 'Página X de Y', encabezado institucional y pie de página.
    Estilo 100% monocromático / negro académico profesional.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Strictly monochrome: Dark Gray and Black only. NO BLUE.
        self.setStrokeColor(colors.HexColor('#222222'))
        self.setLineWidth(0.6)

        # Encabezado para páginas 2 en adelante
        if self._pageNumber > 1:
            self.line(36, 755, 576, 755)
            self.setFont('Helvetica-Bold', 7.5)
            self.setFillColor(colors.HexColor('#111111'))
            self.drawString(36, 760, 'UNIVERSIDAD AUTÓNOMA DEL ESTADO DE MÉXICO | FACULTAD DE INGENIERÍA')
            self.setFont('Helvetica', 7.5)
            self.setFillColor(colors.HexColor('#333333'))
            self.drawRightString(576, 760, 'Reporte de Pruebas STD — Ciberseguridad 2026')

        # Pie de página en todas las páginas
        self.line(36, 42, 576, 42)
        self.setFont('Helvetica', 7.5)
        self.setFillColor(colors.HexColor('#444444'))
        self.drawString(36, 30, 'Maderería Secure API (Wood AI Corporation) — Prototipo Web Seguro')
        self.drawRightString(576, 30, f'Página {self._pageNumber} de {page_count}')
        self.restoreState()

def build_pdf():
    output_pdf = os.path.abspath('outputs/Reporte_Resultados_Pruebas.pdf')
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()

    # Estilos tipográficos institucionales (ESTRICTAMENTE NEGRO Y GRIS, CERO AZUL)
    c_black = colors.HexColor('#000000')
    c_body = colors.HexColor('#1A1A1A')
    c_dark_gray = colors.HexColor('#333333')

    style_inst = ParagraphStyle(
        'InstTitle',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        alignment=TA_CENTER,
        textColor=c_black,
        spaceAfter=2
    )

    style_fac = ParagraphStyle(
        'FacTitle',
        fontName='Helvetica',
        fontSize=9.5,
        leading=12,
        alignment=TA_CENTER,
        textColor=c_dark_gray,
        spaceAfter=10
    )

    style_doc_title = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=17,
        alignment=TA_CENTER,
        textColor=c_black,
        spaceAfter=4
    )

    style_doc_sub = ParagraphStyle(
        'DocSub',
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=c_dark_gray,
        spaceAfter=10
    )

    style_h1 = ParagraphStyle(
        'H1',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=c_black,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'H2',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12.5,
        textColor=c_dark_gray,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'Body',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=c_body,
        alignment=TA_JUSTIFY,
        spaceAfter=5
    )

    style_caption = ParagraphStyle(
        'Caption',
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10,
        alignment=TA_CENTER,
        textColor=c_dark_gray,
        spaceBefore=4,
        spaceAfter=8
    )

    style_th = ParagraphStyle(
        'TH',
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        alignment=TA_CENTER,
        textColor=colors.white
    )

    style_td = ParagraphStyle(
        'TD',
        fontName='Helvetica',
        fontSize=7,
        leading=9,
        alignment=TA_LEFT,
        textColor=c_body
    )

    style_td_center = ParagraphStyle(
        'TDCenter',
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        alignment=TA_CENTER,
        textColor=c_black
    )

    story = []

    # ==================== ENCABEZADO INSTITUCIONAL ====================
    story.append(Paragraph("UNIVERSIDAD AUTÓNOMA DEL ESTADO DE MÉXICO", style_inst))
    story.append(Paragraph("FACULTAD DE INGENIERÍA — LICENCIATURA EN COMPUTACIÓN / SISTEMAS", style_fac))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_black, spaceBefore=0, spaceAfter=6))
    
    story.append(Paragraph("INFORME TÉCNICO DE RESULTADOS Y VALIDACIÓN DE PRUEBAS (STD)", style_doc_title))
    story.append(Paragraph("Evaluación Formal de Controles de Ciberseguridad, Criptografía, Integridad y Resiliencia Web", style_doc_sub))
    story.append(HRFlowable(width="100%", thickness=0.6, color=c_dark_gray, spaceBefore=0, spaceAfter=6))

    # Ficha Técnica de la Práctica
    ficha_data = [
        [
            Paragraph("<b>Materia:</b> Ciberseguridad", style_td),
            Paragraph("<b>Docente:</b> Profesora Judith Moreno Jimenez", style_td)
        ],
        [
            Paragraph("<b>Semestre y Grupo:</b> 5° Semestre | Grupo A1", style_td),
            Paragraph("<b>Fecha de Evaluación:</b> Septiembre de 2026", style_td)
        ],
        [
            Paragraph("<b>Proyecto Auditado:</b> Maderería Secure API (Wood AI Corporation)", style_td),
            Paragraph("<b>Integrantes:</b> Debbie Marina Padilla Lara, Daniel Aguilar Garduño, David Nava Fuentes, Isaac Sánchez Camacho", style_td)
        ]
    ]
    t_ficha = Table(ficha_data, colWidths=[240, 300])
    t_ficha.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F6F6F6')),
        ('BOX', (0,0), (-1,-1), 0.6, colors.HexColor('#333333')),
        ('INNERGRID', (0,0), (-1,-1), 0.4, colors.HexColor('#D5D5D5')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_ficha)
    story.append(Spacer(1, 8))

    # ==================== 1. RESUMEN EJECUTIVO ====================
    story.append(Paragraph("1. Resumen Ejecutivo y Alcance Metodológico", style_h1))
    p_intro = (
        "El presente informe documenta los resultados experimentales obtenidos tras la ejecución del Plan de Pruebas "
        "de Software (STD, Sección 3) sobre el sistema <b>Wood AI Corporation / Maderería Secure API</b>. "
        "El objetivo central radica en verificar y justificar formalmente la eficacia de los controles de seguridad "
        "desplegados en el backend (Node.js/Express 5) y frontend (Vanilla JS SPA), respaldados por la base de datos "
        "NoSQL (MongoDB Atlas). La auditoría evalúa la mitigación de vectores descritos en los marcos STRIDE, MITRE ATT&CK "
        "y el estándar ITU-T X.800, abarcando autenticación multifactor (OTP), integridad criptográfica mediante Hash Chaining, "
        "prevención de inyecciones y consistencia transaccional ACID."
    )
    story.append(Paragraph(p_intro, style_body))

    p_delimitacion = (
        "<b>Delimitación de Alcance de Pruebas:</b> Conforme a los acuerdos de diseño y alcance técnico del prototipo académico, "
        "se evaluaron la totalidad de los Casos de Prueba (CP-01 a CP-17). Los casos CP-10 y CP-11 (procesamiento y rechazo en pasarelas "
        "Sandbox externas como PayPal/Stripe) fueron deliberadamente adaptados al motor transaccional interno del servidor "
        "(<code>session.withTransaction</code>), descartando dependencias de webhooks externos y validando el checkout de forma estricta "
        "mediante reautenticación local. Asimismo, el caso CP-13 fue adaptado a un esquema reactivo de long-polling en el panel administrativo."
    )
    story.append(Paragraph(p_delimitacion, style_body))
    story.append(Spacer(1, 6))

    # ==================== 2. TABLA MATRIZ DE RESULTADOS ====================
    story.append(Paragraph("2. Matriz Consolidada de Resultados (STD - Sección 3)", style_h1))
    p_tab_desc = "Resumen comparativo del comportamiento esperado frente al resultado real observado en el prototipo:"
    story.append(Paragraph(p_tab_desc, style_body))

    matriz_data = [
        [
            Paragraph("ID", style_th),
            Paragraph("Objetivo / Prueba", style_th),
            Paragraph("Entrada / Vector", style_th),
            Paragraph("Resultado Obtenido", style_th),
            Paragraph("Estado", style_th),
            Paragraph("Componente / Módulo", style_th)
        ],
        [
            Paragraph("<b>CP-01</b>", style_td_center),
            Paragraph("Validar Autenticidad", style_td),
            Paragraph("Token modificado/manipulado.", style_td),
            Paragraph("Rechazo 401: Firma criptográfica rota.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>authMiddleware.js</code>", style_td)
        ],
        [
            Paragraph("<b>CP-02</b>", style_td_center),
            Paragraph("No Repudio en Contrato", style_td),
            Paragraph("Generación al autorizar compra.", style_td),
            Paragraph("Firma RSA asimétrica y Hash SHA-256 único.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>crypto.js</code> / <code>Contrato.js</code>", style_td)
        ],
        [
            Paragraph("<b>CP-03</b>", style_td_center),
            Paragraph("Trazabilidad (Log Inmutable)", style_td),
            Paragraph("Transacción aprobada/rechazada.", style_td),
            Paragraph("Hash Chaining recursivo; bloqueo append-only.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>LogAuditoria.js</code>", style_td)
        ],
        [
            Paragraph("<b>CP-04</b>", style_td_center),
            Paragraph("Restricción de Stock", style_td),
            Paragraph("Compra con cantidad > existencia.", style_td),
            Paragraph("Rechazo 400 'Stock insuficiente'; log creado.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>pagoController.js</code>", style_td)
        ],
        [
            Paragraph("<b>CP-05</b>", style_td_center),
            Paragraph("Confidencialidad (TLS)", style_td),
            Paragraph("Inspección de tráfico HTTP/HTTPS.", style_td),
            Paragraph("Tráfico forzado por TLS 1.3 / HSTS Vercel.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>server.js</code> / Edge Vercel", style_td)
        ],
        [
            Paragraph("<b>CP-06</b>", style_td_center),
            Paragraph("Validar Login (RF-01)", style_td),
            Paragraph("Credenciales inválidas vs válidas.", style_td),
            Paragraph("Mensaje genérico unificado; activación 2FA/OTP.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>authController.js</code>", style_td)
        ],
        [
            Paragraph("<b>CP-07</b>", style_td_center),
            Paragraph("Personalización (RF-02)", style_td),
            Paragraph("Envío de precio alterado en payload.", style_td),
            Paragraph("Precio recalculado estrictamente en servidor.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>pagoController.js</code>", style_td)
        ],
        [
            Paragraph("<b>CP-08</b>", style_td_center),
            Paragraph("Generación Contrato (RF-03)", style_td),
            Paragraph("Confirmación de pedido exitoso.", style_td),
            Paragraph("Folio WAI emitido, evidencia hash y PDF view.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>contratoController.js</code>", style_td)
        ],
        [
            Paragraph("<b>CP-09</b>", style_td_center),
            Paragraph("Verificación Inventario (RF-04)", style_td),
            Paragraph("Consulta y bloqueo de concurrencia.", style_td),
            Paragraph("Filtro atómico $gte en MongoDB; rollback.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>Producto.js</code> (Mongoose)", style_td)
        ],
        [
            Paragraph("<b>CP-10</b>", style_td_center),
            Paragraph("Procesamiento Pago (RF-05)", style_td),
            Paragraph("Checkout con reautenticación.", style_td),
            Paragraph("Transacción ACID interna confirmada sin pasarela ext.", style_td),
            Paragraph("ADAPTADO", style_td_center),
            Paragraph("<code>pagoController.js</code>", style_td)
        ],
        [
            Paragraph("<b>CP-11</b>", style_td_center),
            Paragraph("Gestión de Rechazos (RF-06)", style_td),
            Paragraph("Password errónea o stock agotado.", style_td),
            Paragraph("Rechazo 401/400; inventario intacto y reintento.", style_td),
            Paragraph("ADAPTADO", style_td_center),
            Paragraph("<code>pagoController.js</code>", style_td)
        ],
        [
            Paragraph("<b>CP-12</b>", style_td_center),
            Paragraph("Deducción Inventario (RF-07)", style_td),
            Paragraph("Compra validada exitosa.", style_td),
            Paragraph("Descuento atómico $inc y creación de pedido.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>Pedido.js</code> / <code>pagoController</code>", style_td)
        ],
        [
            Paragraph("<b>CP-13</b>", style_td_center),
            Paragraph("Notificación Interna (RF-08)", style_td),
            Paragraph("Nueva orden confirmada.", style_td),
            Paragraph("Aviso emergente reactivo en UI de administradores.", style_td),
            Paragraph("ADAPTADO", style_td_center),
            Paragraph("<code>app.js</code> (Long-polling)", style_td)
        ],
        [
            Paragraph("<b>CP-14</b>", style_td_center),
            Paragraph("Inyección SQL/NoSQL en Login", style_td),
            Paragraph("Inyección: ' OR '1'='1 en password/email.", style_td),
            Paragraph("Rechazado; tipado estricto Mongoose lo aísla.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>Usuario.js</code> / Mongoose", style_td)
        ],
        [
            Paragraph("<b>CP-15</b>", style_td_center),
            Paragraph("XSS en Personalización", style_td),
            Paragraph("Payload: &lt;script&gt;alert(1)</script>.", style_td),
            Paragraph("Sanitización contextual con escapeHTML().", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>public/app.js</code>", style_td)
        ],
        [
            Paragraph("<b>CP-16</b>", style_td_center),
            Paragraph("CSRF en Acción Crítica", style_td),
            Paragraph("Petición cross-origin sin Bearer token.", style_td),
            Paragraph("Rechazo 401; sin dependencia de cookies.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>authMiddleware.js</code>", style_td)
        ],
        [
            Paragraph("<b>CP-17</b>", style_td_center),
            Paragraph("Acceso No Autorizado Auditoría", style_td),
            Paragraph("Cliente común llama a /api/auditoria.", style_td),
            Paragraph("Rechazo 403 Forbidden; verificación de rol.", style_td),
            Paragraph("APROBADO", style_td_center),
            Paragraph("<code>adminMiddleware.js</code>", style_td)
        ]
    ]

    t_matriz = Table(matriz_data, colWidths=[38, 95, 115, 150, 56, 86])
    t_matriz.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1A1A1A')),
        ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor('#222222')),
        ('INNERGRID', (0,0), (-1,-1), 0.4, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8F8F8')]),
    ]))
    story.append(t_matriz)
    story.append(Spacer(1, 10))

    # ==================== 3. DESGLOSE TÉCNICO DETALLADO ====================
    story.append(Spacer(1, 14))
    story.append(Paragraph("3. Desglose Técnico y Justificación de Resultados", style_h1))

    # 3.1
    story.append(Paragraph("3.1 Controles de Autenticación, Acceso y Gestión de Sesión", style_h2))
    p_auth = (
        "<b>CP-01 (Autenticidad de Tokens JWT):</b> La arquitectura emplea JSON Web Tokens firmados mediante una clave "
        "simétrica robusta (<code>JWT_SECRET</code>). En <code>authMiddleware.js</code>, la invocación <code>jwt.verify(token, secret)</code> "
        "comprueba la firma criptográfica HMAC-SHA256. Ante cualquier byte modificado en la cabecera o carga útil (payload), "
        "la función lanza de inmediato una excepción <code>JsonWebTokenError</code>, retornando un código <b>HTTP 401</b> y abortando "
        "la cadena de ejecución antes de tocar la capa de controladores.<br/>"
        "<b>CP-06 (Validación de Login y Resistencia a Enumeración):</b> En <code>authController.js</code>, el algoritmo de inicio de sesión "
        "evalúa la existencia del correo y la coincidencia del hash de contraseña usando <code>bcrypt.compare()</code>. En ambos casos "
        "(usuario inexistente o contraseña inválida), la respuesta es estrictamente idéntica: <code>{\"mensaje\": \"Credenciales inválidas.\"}</code> "
        "con código <b>HTTP 401</b>. Esto impide que atacantes mapeen qué correos están registrados. Complementariamente, se incorporó "
        "un esquema de <b>Autenticación de Dos Factores (2FA/OTP)</b>: los usuarios recién registrados adquieren el estado <code>'pendiente'</code> "
        "y el servidor genera un código numérico pseudoaleatorio de 6 dígitos que debe validarse en <code>/api/auth/verificar-otp</code> "
        "antes de permitir el acceso.<br/>"
        "<b>CP-16 (Mitigación CSRF) y CP-17 (Control de Acceso / Mitigación IDOR):</b> El prototipo es 100% Stateless: no utiliza cookies de sesión, "
        "eliminando el vector clásico de Cross-Site Request Forgery. Toda acción privilegiada exige la cabecera <code>Authorization: Bearer</code>. "
        "En <code>adminMiddleware.js</code> se comprueba que el claim <code>rol === 'admin'</code>; peticiones no autorizadas reciben un <b>HTTP 403</b>. "
        "En la descarga de contratos (<code>contratoController.js</code>) se forzó la validación <code>contrato.usuario_id.equals(req.usuario._id)</code>, "
        "neutralizando vulnerabilidades de Referencia Directa Insegura a Objetos (IDOR)."
    )
    story.append(Paragraph(p_auth, style_body))

    # 3.2
    story.append(Paragraph("3.2 Criptografía, Integridad Inmutable y No Repudio", style_h2))
    p_crypto = (
        "<b>CP-02 y CP-08 (No Repudio y Generación de Contratos):</b> Los contratos emitidos integran evidencia criptográfica verificable. "
        "En el archivo <code>src/utils/crypto.js</code> se utiliza el motor nativo <code>node:crypto</code> para computar un hash SHA-256 de los "
        "detalles de la compraventa y generar una firma digital asimétrica basada en RSA-PSS con claves de 2048 bits. Cada orden genera un folio "
        "único mediante un hook en <code>Pedido.js</code> (ej. <code>WAI-XXXX</code>) que vincula al usuario, fecha, total y huella digital.<br/>"
        "<b>CP-03 (Trazabilidad e Inmutabilidad de Auditoría — Hash Chaining):</b> El modelo <code>LogAuditoria.js</code> implementa un libro mayor "
        "inmutable estilo Blockchain. Cada documento nuevo calcula su huella actual mediante: "
        "<code>hash_actual = SHA-256(hash_anterior + fecha + accion + usuario_id)</code>. "
        "Si un adversario accede directamente a MongoDB Atlas y modifica un registro antiguo, la cadena completa de hashes subsecuentes "
        "se invalida, evidenciando la manipulación de inmediato. Para salvaguardar esto a nivel de aplicación, se configuraron hooks de Mongoose "
        "que interceptan y arrojan un error bloqueante ante operaciones <code>updateOne</code>, <code>updateMany</code>, <code>deleteOne</code> o <code>deleteMany</code>."
    )
    story.append(Paragraph(p_crypto, style_body))

    # 3.3
    story.append(Paragraph("3.3 Lógica de Negocio y Transaccionalidad ACID en Inventario", style_h2))
    p_biz = (
        "<b>CP-04, CP-09 y CP-12 (Gestión Atómica de Stock y Transacciones):</b> En <code>pagoController.js</code>, el proceso de compra "
        "está encapsulado dentro de una transacción atómica de MongoDB (<code>session.withTransaction</code>). Se aplica una validación en dos niveles: "
        "primero, se comprueba en memoria la disponibilidad de stock; segundo, se ejecuta una actualización atómica con filtro de concurrencia: "
        "<code>Producto.findOneAndUpdate({ _id: item.producto_id, existencia: { $gte: item.cantidad } }, { $inc: { existencia: -item.cantidad } })</code>. "
        "Si el inventario es rebasado o entra en conflicto por concurrencia, la transacción efectúa un rollback total, se genera un registro en "
        "<code>LogAuditoria</code> con estado <code>'RECHAZADO'</code> y se retorna un código <b>HTTP 400</b>.<br/>"
        "<b>CP-07 (Integridad de Precios en el Servidor):</b> El controlador descarta explícitamente cualquier precio o subtotal remitido por el cliente "
        "en el JSON de la petición. El costo financiero se calcula multiplicando las cantidades por el precio real extraído directamente de la base de "
        "datos durante la sesión de transacción.<br/>"
        "<b>Reautenticación Forzada en Checkout:</b> Como mecanismo de defensa en profundidad contra el Secuestro de Sesiones (Session Hijacking), "
        "el endpoint <code>/api/pagos/checkout</code> exige la contraseña en texto claro del usuario activo. Dicha credencial es revalidada "
        "mediante <code>bcrypt.compare()</code> en un bloque <code>try/catch</code> resiliente. Si la contraseña no coincide, se rechaza con <b>HTTP 401</b> "
        "sin comprometer ni descontar el inventario."
    )
    story.append(Paragraph(p_biz, style_body))

    # 3.4
    story.append(Paragraph("3.4 Resistencia ante Ataques Web Comunes (OWASP Top 10)", style_h2))
    p_owasp = (
        "<b>CP-14 (Inyección SQL / NoSQL):</b> El acceso a la base de datos se realiza mediante el ODM Mongoose con esquemas estrictos. "
        "Los payloads maliciosos como <code>' OR '1'='1</code> ingresados en los campos de formulario son casteados a cadenas de texto literales, "
        "impidiendo que alteren la estructura del árbol de consulta sintáctico de MongoDB.<br/>"
        "<b>CP-15 (Cross-Site Scripting — XSS):</b> En <code>public/app.js</code>, todas las variables que se insertan en la interfaz de usuario "
        "(colores, maderas, nombres, precios) son filtradas por la función <code>escapeHTML()</code> antes de insertarse en el DOM, neutralizando "
        "la inyección y ejecución de etiquetas <code>&lt;script&gt;</code> o atributos <code>onerror</code>."
    )
    story.append(Paragraph(p_owasp, style_body))
    story.append(Spacer(1, 10))

    # ==================== 4. EVIDENCIAS VISUALES ====================
    story.append(Spacer(1, 10))
    story.append(Paragraph("4. Evidencias Visuales y Verificación de Resultados", style_h1))
    p_evidencias_intro = (
        "A continuación se integran las capturas de pantalla de los ensayos de laboratorio, evidenciando el despliegue "
        "de infraestructura, los mecanismos de defensa perimetral y la interacción segura con el usuario:"
    )
    story.append(Paragraph(p_evidencias_intro, style_body))

    # Figura 1: Terminal
    img_terminal_path = os.path.abspath('outputs/img/terminal_git.png')
    if os.path.exists(img_terminal_path):
        # 1024x639 -> escala ancho 420 pt, alto ~262 pt
        im1 = Image(img_terminal_path, width=420, height=262)
        story.append(Spacer(1, 4))
        story.append(im1)
        caption1 = (
            "<b>Figura 1.</b> Captura de consola en Visual Studio Code: Control de versiones con GitHub (rama principal <code>master</code>) "
            "e integración del middleware perimetral <code>express-rate-limit</code> para la mitigación de ataques de fuerza bruta y denegación de servicio."
        )
        story.append(Paragraph(caption1, style_caption))

    story.append(PageBreak())

    # Figura 2: Modal de Reautenticación
    img_modal_path = os.path.abspath('outputs/img/modal_auth.png')
    if os.path.exists(img_modal_path):
        # 1024x564 -> escala ancho 420 pt, alto ~231 pt
        im2 = Image(img_modal_path, width=420, height=231)
        story.append(im2)
        caption2 = (
            "<b>Figura 2.</b> Interfaz de usuario (Frontend Vanilla JS): Componente modal de Reautenticación Forzada en la pasarela de pagos. "
            "El sistema exige la contraseña de la cuenta para validar la identidad del usuario antes de proceder a la transacción ACID y descuento de stock."
        )
        story.append(Paragraph(caption2, style_caption))

    story.append(Spacer(1, 10))

    # Figura 3: Simulacion de Ataques
    img_attack_path = os.path.abspath('outputs/img/terminal_attack_simulation.png')
    if os.path.exists(img_attack_path):
        im3 = Image(img_attack_path, width=420, height=235)
        story.append(im3)
        caption3 = (
            "<b>Figura 3.</b> Banco de Pruebas de Resistencia y Simulación de Ataques: Ejecución de vectores reales de agresión "
            "(Fuerza Bruta / DoS, Falsificación de firma JWT y Alteración de base de datos), verificando la respuesta activa de "
            "los controles de seguridad (HTTP 429 Too Many Requests, HTTP 401 Unauthorized y bloqueo por hook Append-Only)."
        )
        story.append(Paragraph(caption3, style_caption))

    story.append(PageBreak())
    # ==================== 5. CONCLUSIONES Y TRABAJO FUTURO ====================
    story.append(Spacer(1, 10))
    story.append(Paragraph("5. Conclusiones Técnicas y Dictamen de Aceptación", style_h1))

    p_conc = (
        "El proceso de auditoría y ejecución del Plan de Pruebas (STD) concluye con un <b>dictamen completamente favorable</b>. "
        "Se logró una tasa de éxito del <b>100% de los casos de prueba aplicables</b> (15 casos aprobados/adaptados de 15 evaluados). "
        "Las principales fortalezas del sistema radican en la separación clara de responsabilidades, la inmutabilidad garantizada "
        "por la cadena de bloques interna (Hash Chaining SHA-256) en los registros de auditoría y el blindaje ante ataques de inyección "
        "y secuestro de sesión mediante reautenticación forzada."
    )
    story.append(Paragraph(p_conc, style_body))

    # Métricas de Evaluación
    metricas_data = [
        [
            Paragraph("Métrica de Evaluación", style_th),
            Paragraph("Valor Observado", style_th),
            Paragraph("Dictamen Técnico", style_th)
        ],
        [
            Paragraph("Total de Casos Evaluados en STD", style_td),
            Paragraph("17 Casos (CP-01 al CP-17)", style_td_center),
            Paragraph("Cobertura total del documento de especificación.", style_td)
        ],
        [
            Paragraph("Casos Aprobados de Forma Directa", style_td),
            Paragraph("14 Casos (82.3%)", style_td_center),
            Paragraph("Controles criptográficos, validación de stock y OWASP.", style_td)
        ],
        [
            Paragraph("Casos Adaptados al Entorno Prototipo", style_td),
            Paragraph("3 Casos (17.7%)", style_td_center),
            Paragraph("CP-10, CP-11 (Simulador ACID) y CP-13 (Long-polling).", style_td)
        ],
        [
            Paragraph("Casos Rechazados / No Superados", style_td),
            Paragraph("0 Casos (0.0%)", style_td_center),
            Paragraph("Ninguna falla de seguridad ni colapso de servidor.", style_td)
        ],
        [
            Paragraph("<b>Eficacia Global del Sistema</b>", style_td),
            Paragraph("<b>100.0%</b>", style_td_center),
            Paragraph("<b>Cumplimiento pleno de requerimientos académicos.</b>", style_td)
        ]
    ]

    t_metricas = Table(metricas_data, colWidths=[180, 130, 230])
    t_metricas.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1A1A1A')),
        ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor('#222222')),
        ('INNERGRID', (0,0), (-1,-1), 0.4, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8F8F8')]),
    ]))
    story.append(t_metricas)

    # 5.1 Recomendaciones y Trabajo Futuro
    story.append(Spacer(1, 10))
    story.append(Paragraph("5.1 Recomendaciones Técnicas de Continuidad", style_h2))
    p_rec = (
        "Para la transición del prototipo hacia un entorno corporativo de alta criticidad, se recomienda:<br/>"
        "• <b>Web Application Firewall (WAF) Perimetral:</b> Desplegar una capa previa (ej. Cloudflare Enterprise o AWS WAF) "
        "para absorber ataques distribuidos de denegación de servicio (DDoS volumétrico) antes de que alcancen el runtime de Node.js.<br/>"
        "• <b>Módulos HSM para Gestión de Claves:</b> Migrar la generación al vuelo de claves asimétricas RSA hacia un Key Management "
        "Service (AWS KMS o HashiCorp Vault), garantizando que las claves privadas nunca residan en memoria volátil de la aplicación.<br/>"
        "• <b>Monitoreo y SIEM Centralizado:</b> Integrar alertas automáticas (Elastic Security / Datadog) vinculadas a los registros "
        "rechazados de LogAuditoria para detectar intentos sostenidos de intrusión en tiempo real."
    )
    story.append(Paragraph(p_rec, style_body))


    doc.build(story, canvasmaker=UniversityNumberedCanvas)
    print(f"[OK] Reporte PDF generado exitosamente en: {output_pdf}")

if __name__ == '__main__':
    build_pdf()
