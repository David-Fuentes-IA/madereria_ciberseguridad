(() => {
  'use strict';

  const API_BASE = String(window.MADERERIA_API_BASE || '').replace(/\/$/, '');
  const TOKEN_KEY = 'madereria_secure_token';
  const USER_KEY = 'madereria_secure_user';

  const readStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch (_error) {
      return null;
    }
  };

  const decodeTokenUser = (token) => {
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload?._id && payload?.rol ? { _id: payload._id, rol: payload.rol } : null;
    } catch (_error) {
      return null;
    }
  };

  const initialToken = localStorage.getItem(TOKEN_KEY);

  const state = {
    products: [],
    cart: [],
    view: 'home',
    authMode: 'login',
    token: initialToken,
    user: readStoredUser() || (initialToken ? decodeTokenUser(initialToken) : null),
    toastTimer: null,
    invoice: null,
  };

  const refs = {
    apiStatus: document.getElementById('api-status'),
    sessionButton: document.getElementById('session-button'),
    adminNav: document.getElementById('admin-nav'),
    productGrid: document.getElementById('product-grid'),
    catalogNotice: document.getElementById('catalog-notice'),
    catalogCount: document.getElementById('catalog-count'),
    cartCount: document.getElementById('cart-count'),
    cartDrawer: document.getElementById('cart-drawer'),
    drawerBackdrop: document.getElementById('drawer-backdrop'),
    cartItems: document.getElementById('cart-items'),
    cartTotal: document.getElementById('cart-total'),
    checkoutButton: document.getElementById('checkout-button'),
    invoiceModal: document.getElementById('invoice-modal'),
    invoiceBackdrop: document.getElementById('invoice-backdrop'),
    invoiceStatusRow: document.querySelector('.invoice-status-row'),
    invoiceStatusMark: document.getElementById('invoice-status-mark'),
    invoiceStatus: document.getElementById('invoice-status'),
    invoiceStatusDetail: document.getElementById('invoice-status-detail'),
    invoiceFolio: document.getElementById('invoice-folio'),
    invoiceDate: document.getElementById('invoice-date'),
    invoiceItemCount: document.getElementById('invoice-item-count'),
    invoiceLines: document.getElementById('invoice-lines'),
    invoiceTotal: document.getElementById('invoice-total'),
    invoiceProofDetail: document.getElementById('invoice-proof-detail'),
    invoiceServerData: document.getElementById('invoice-server-data'),
    invoicePrint: document.getElementById('invoice-print'),
    invoiceFinalize: document.getElementById('invoice-finalize'),
    toast: document.getElementById('toast'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    authFeedback: document.getElementById('auth-feedback'),
    adminRefresh: document.getElementById('admin-refresh'),
    adminApplyFilters: document.getElementById('admin-apply-filters'),
    adminDateFrom: document.getElementById('admin-date-from'),
    adminDateTo: document.getElementById('admin-date-to'),
    adminFeedback: document.getElementById('admin-feedback'),
    adminMetricUsers: document.getElementById('admin-metric-users'),
    adminMetricUsersDetail: document.getElementById('admin-metric-users-detail'),
    adminMetricOrders: document.getElementById('admin-metric-orders'),
    adminMetricOrdersDetail: document.getElementById('admin-metric-orders-detail'),
    adminMetricRevenue: document.getElementById('admin-metric-revenue'),
    adminMetricStock: document.getElementById('admin-metric-stock'),
    adminMetricStockDetail: document.getElementById('admin-metric-stock-detail'),
    adminUserSearch: document.getElementById('admin-user-search'),
    adminUserRole: document.getElementById('admin-user-role'),
    adminUserStatus: document.getElementById('admin-user-status'),
    adminUsersBody: document.getElementById('admin-users-body'),
    adminOrderSearch: document.getElementById('admin-order-search'),
    adminOrderStatus: document.getElementById('admin-order-status'),
    adminOrdersBody: document.getElementById('admin-orders-body'),
    adminAuditBody: document.getElementById('admin-audit-body'),
  };

  const demoProducts = [
    {
      _id: 'demo-roble',
      tipo_madera: 'Roble',
      marca: 'Maderería Secure',
      color: 'Miel tostada',
      textura: 'Veta abierta',
      dimensiones: '2.40 × 0.30 m',
      precio: 500,
      existencia: 20,
      estado: 'activo',
    },
    {
      _id: 'demo-nogal',
      tipo_madera: 'Nogal',
      marca: 'Reserva Norte',
      color: 'Café profundo',
      textura: 'Veta fina',
      dimensiones: '2.10 × 0.25 m',
      precio: 780,
      existencia: 8,
      estado: 'activo',
    },
    {
      _id: 'demo-cedro',
      tipo_madera: 'Cedro',
      marca: 'Línea Aurora',
      color: 'Rojo mineral',
      textura: 'Veta lineal',
      dimensiones: '2.40 × 0.20 m',
      precio: 640,
      existencia: 4,
      estado: 'activo',
    },
    {
      _id: 'demo-caoba', tipo_madera: 'Caoba', marca: 'Reserva Imperial', color: 'Castaño rojizo', textura: 'Veta entrelazada', dimensiones: '2.10 × 0.30 m', precio: 1250, existencia: 9, estado: 'activo',
    },
    {
      _id: 'demo-encino', tipo_madera: 'Encino', marca: 'M/S Estructural', color: 'Arena dorada', textura: 'Poros marcados', dimensiones: '2.40 × 0.30 m', precio: 560, existencia: 18, estado: 'activo',
    },
    {
      _id: 'demo-teca', tipo_madera: 'Teca', marca: 'Monzón Select', color: 'Miel ámbar', textura: 'Veta aceitosa', dimensiones: '2.10 × 0.20 m', precio: 1450, existencia: 6, estado: 'activo',
    },
    {
      _id: 'demo-fresno', tipo_madera: 'Fresno', marca: 'Lumen Grain', color: 'Blanco ceniza', textura: 'Veta elástica', dimensiones: '2.40 × 0.25 m', precio: 720, existencia: 10, estado: 'activo',
    },
    {
      _id: 'demo-olmo', tipo_madera: 'Olmo', marca: 'Río Antiguo', color: 'Oliva humo', textura: 'Veta ondulada', dimensiones: '2.10 × 0.30 m', precio: 880, existencia: 8, estado: 'activo',
    },
    {
      _id: 'demo-cerezo', tipo_madera: 'Cerezo', marca: 'Cherry Core', color: 'Rojo cereza', textura: 'Veta satinada', dimensiones: '2.10 × 0.20 m', precio: 1160, existencia: 5, estado: 'activo',
    },
    {
      _id: 'demo-maple', tipo_madera: 'Maple', marca: 'North Clear', color: 'Crema pálido', textura: 'Veta limpia', dimensiones: '2.40 × 0.25 m', precio: 890, existencia: 14, estado: 'activo',
    },
    {
      _id: 'demo-abedul', tipo_madera: 'Abedul', marca: 'Polar Layer', color: 'Blanco natural', textura: 'Veta uniforme', dimensiones: '2.40 × 0.20 m', precio: 610, existencia: 16, estado: 'activo',
    },
    {
      _id: 'demo-haya', tipo_madera: 'Haya', marca: 'Europa Solid', color: 'Rosado claro', textura: 'Veta compacta', dimensiones: '2.10 × 0.25 m', precio: 690, existencia: 11, estado: 'activo',
    },
    {
      _id: 'demo-ebano', tipo_madera: 'Ébano', marca: 'Obsidian Select', color: 'Negro carbón', textura: 'Veta cerrada', dimensiones: '1.80 × 0.15 m', precio: 2400, existencia: 3, estado: 'activo',
    },
    {
      _id: 'demo-wengue', tipo_madera: 'Wengué', marca: 'Darkline Premium', color: 'Chocolate oscuro', textura: 'Veta contrastada', dimensiones: '2.10 × 0.20 m', precio: 1780, existencia: 4, estado: 'activo',
    },
  ];

  const escapeHTML = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[character]));

  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

  const apiRequest = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message = typeof payload === 'object' && payload?.mensaje
        ? payload.mensaje
        : `El servicio respondió ${response.status}.`;
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return payload;
  };

  const showToast = (message) => {
    window.clearTimeout(state.toastTimer);
    refs.toast.textContent = message;
    refs.toast.classList.add('is-visible');
    state.toastTimer = window.setTimeout(() => refs.toast.classList.remove('is-visible'), 4200);
  };

  const setApiStatus = (label, isError = false) => {
    refs.apiStatus.querySelector('span:last-child').textContent = label;
    refs.apiStatus.classList.toggle('is-error', isError);
  };

  const setAuthFeedback = (message = '', isError = false) => {
    refs.authFeedback.textContent = message;
    refs.authFeedback.classList.toggle('is-error', isError);
  };

  const setAdminFeedback = (message = '', isError = false) => {
    refs.adminFeedback.textContent = message;
    refs.adminFeedback.classList.toggle('is-error', isError);
  };

  const formatAdminDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const adminQuery = (extra = {}) => {
    const params = new URLSearchParams();
    if (refs.adminDateFrom.value) params.set('desde', refs.adminDateFrom.value);
    if (refs.adminDateTo.value) params.set('hasta', refs.adminDateTo.value);
    Object.entries(extra).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    return query ? `?${query}` : '';
  };

  const adminRequest = (path) => apiRequest(path, {
    headers: { Authorization: `Bearer ${state.token}` },
  });

  const renderAdminSummary = (summary) => {
    refs.adminMetricUsers.textContent = summary.usuarios?.total ?? '—';
    refs.adminMetricUsersDetail.textContent = `${summary.usuarios?.clientes ?? 0} clientes · ${summary.usuarios?.administradores ?? 0} admins`;
    refs.adminMetricOrders.textContent = summary.pedidos?.total ?? '—';
    refs.adminMetricOrdersDetail.textContent = `${summary.pedidos?.aprobados ?? 0} aprobados · ${summary.pedidos?.rechazados ?? 0} rechazados`;
    refs.adminMetricRevenue.textContent = formatCurrency(summary.ingresos_aprobados);
    refs.adminMetricStock.textContent = summary.inventario?.productos_activos ?? '—';
    refs.adminMetricStockDetail.textContent = `${summary.inventario?.stock_bajo ?? 0} con stock bajo`;
  };

  const renderAdminUsers = (payload) => {
    const usuarios = payload.datos || [];
    refs.adminUsersBody.innerHTML = usuarios.length
      ? usuarios.map((usuario) => `<tr><td>${escapeHTML(usuario.correo)}</td><td><span class="admin-pill">${escapeHTML(usuario.rol || 'cliente')}</span></td><td>${escapeHTML(usuario.estado || 'activo')}</td><td>${formatAdminDate(usuario.fecha_alta)}</td></tr>`).join('')
      : '<tr><td colspan="4">No se encontraron usuarios con esos filtros.</td></tr>';
  };

  const renderAdminOrders = (payload) => {
    const pedidos = payload.datos || [];
    refs.adminOrdersBody.innerHTML = pedidos.length
      ? pedidos.map((pedido) => {
        const cliente = typeof pedido.usuario_id === 'object' ? pedido.usuario_id?.correo : '—';
        const productos = (pedido.items || []).map((item) => `${item.tipo_madera} × ${item.cantidad}`).join(', ') || '—';
        const statusClass = pedido.estado === 'APROBADO' ? 'is-approved' : 'is-rejected';
        return `<tr><td>${escapeHTML(pedido.folio || '—')}</td><td>${escapeHTML(cliente || '—')}</td><td>${escapeHTML(productos)}</td><td>${formatCurrency(pedido.total)}</td><td><span class="admin-status ${statusClass}">${escapeHTML(pedido.estado || '—')}</span></td><td>${formatAdminDate(pedido.fecha)}</td></tr>`;
      }).join('')
      : '<tr><td colspan="6">No se encontraron pedidos con esos filtros.</td></tr>';
  };

  const renderAdminAudit = (payload) => {
    const logs = payload.datos || [];
    refs.adminAuditBody.innerHTML = logs.length
      ? logs.map((log) => {
        const usuario = typeof log.usuario_id === 'object' ? log.usuario_id?.correo : '—';
        const resultado = String(log.resultado || '—');
        const resultClass = resultado.toLowerCase().includes('aprob') ? 'is-approved' : resultado.toLowerCase().includes('rechaz') ? 'is-rejected' : '';
        return `<tr><td>${formatAdminDate(log.fecha_utc)}</td><td>${escapeHTML(usuario || '—')}</td><td>${escapeHTML(log.accion || '—')}</td><td><span class="admin-status ${resultClass}">${escapeHTML(resultado)}</span></td><td>${escapeHTML(log.ip || '—')}</td></tr>`;
      }).join('')
      : '<tr><td colspan="5">No hay actividad registrada para esos filtros.</td></tr>';
  };

  const loadAdminDashboard = async () => {
    if (state.user?.rol !== 'admin') return;
    setAdminFeedback('Actualizando información administrativa…');
    try {
      const usersQuery = adminQuery({
        buscar: refs.adminUserSearch.value.trim(),
        rol: refs.adminUserRole.value,
        estado: refs.adminUserStatus.value,
      });
      const ordersQuery = adminQuery({
        buscar: refs.adminOrderSearch.value.trim(),
        estado: refs.adminOrderStatus.value,
      });
      const [summary, users, orders, audit] = await Promise.all([
        adminRequest(`/api/admin/resumen${adminQuery()}`),
        adminRequest(`/api/admin/usuarios${usersQuery}`),
        adminRequest(`/api/admin/pedidos${ordersQuery}`),
        adminRequest(`/api/admin/auditoria${adminQuery()}`),
      ]);
      renderAdminSummary(summary);
      renderAdminUsers(users);
      renderAdminOrders(orders);
      renderAdminAudit(audit);
      setAdminFeedback(`Datos actualizados ${formatAdminDate(summary.actualizado_en)}.`);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        setAdminFeedback('Tu cuenta no tiene permisos para consultar este panel.', true);
        setView('auth');
        setAuthFeedback('El panel administrativo está reservado para cuentas autorizadas.', true);
        return;
      }
      setAdminFeedback(error.message || 'No fue posible cargar el panel administrativo.', true);
    }
  };

  const setView = (viewName) => {
    if (viewName === 'admin' && state.user?.rol !== 'admin') {
      showToast('Esta sección está disponible únicamente para administradores.');
      viewName = 'auth';
    }
    state.view = viewName;
    document.querySelectorAll('.view').forEach((view) => {
      view.hidden = view.id !== `view-${viewName}`;
    });
    document.querySelectorAll('[data-view]').forEach((control) => {
      control.classList.toggle('is-active', control.dataset.view === viewName);
    });
    if (viewName === 'catalog' && state.products.length === 0) loadProducts();
    if (viewName === 'admin') loadAdminDashboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateSessionUI = () => {
    refs.sessionButton.textContent = state.token ? 'SALIR' : 'MI CUENTA';
    refs.sessionButton.setAttribute('aria-label', state.token ? 'Cerrar sesión' : 'Abrir acceso');
    refs.adminNav.hidden = !(state.token && state.user?.rol === 'admin');
  };

  const productClass = (type) => {
    const normalized = String(type || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const woodClasses = ['roble', 'pino', 'cedro', 'caoba', 'nogal', 'encino', 'teca', 'fresno', 'olmo', 'cerezo', 'maple', 'abedul', 'haya', 'ebano', 'wengue'];
    return woodClasses.includes(normalized) ? `is-${normalized}` : '';
  };

  const productState = (stock) => {
    if (stock <= 0) return { label: 'AGOTADO', className: 'is-empty' };
    if (stock <= 5) return { label: `${stock} DISPONIBLES`, className: 'is-low' };
    return { label: `${stock} DISPONIBLES`, className: '' };
  };

  const renderProducts = () => {
    refs.catalogCount.textContent = `${state.products.length} ${state.products.length === 1 ? 'PRODUCTO' : 'PRODUCTOS'}`;
    if (!state.products.length) {
      refs.productGrid.innerHTML = '<div class="empty-catalog">En este momento no hay maderas disponibles.</div>';
      return;
    }

    refs.productGrid.innerHTML = state.products.map((product, index) => {
      const stock = Number(product.existencia) || 0;
      const status = productState(stock);
      const disabled = stock <= 0 ? 'disabled' : '';
      return `
        <article class="product-card">
          <div class="product-visual ${productClass(product.tipo_madera)}" role="img" aria-label="Textura representativa de ${escapeHTML(product.tipo_madera || 'madera')}">
            <span class="visual-meta">TEXTURA / ${String(index + 1).padStart(2, '0')}</span>
            <span class="visual-index">WA / ${String(index + 1).padStart(2, '0')}</span>
          </div>
          <div class="product-content">
            <div class="product-title-row">
              <h3>${escapeHTML(product.tipo_madera || 'Madera')}</h3>
              <span class="product-state ${status.className}">${status.label}</span>
            </div>
            <p class="product-brand">${escapeHTML(product.marca || 'Wood AI Corporation')}</p>
            <div class="product-spec-row">
              <div class="product-spec"><span>Color / acabado</span><strong>${escapeHTML(product.color || '—')} · ${escapeHTML(product.textura || '—')}</strong></div>
              <div class="product-spec"><span>Medidas</span><strong>${escapeHTML(product.dimensiones || '—')}</strong></div>
            </div>
            <div class="product-footer">
              <div class="product-price">${formatCurrency(product.precio)} <small>MXN</small></div>
              <button class="product-add" type="button" data-add-product="${escapeHTML(product._id)}" ${disabled}>Agregar al carrito</button>
            </div>
          </div>
        </article>`;
    }).join('');
  };

  const loadProducts = async () => {
    refs.productGrid.innerHTML = '<div class="loading-state"><span class="loader"></span> Cargando nuestras maderas...</div>';
    refs.catalogNotice.textContent = '';
    try {
      const products = await apiRequest('/api/productos');
      state.products = Array.isArray(products) ? products : [];
      refs.catalogNotice.className = 'catalog-notice';
      setApiStatus('SERVICIO EN LÍNEA');
      renderProducts();
    } catch (error) {
      state.products = demoProducts;
      refs.catalogNotice.textContent = 'MODO DEMO / catálogo temporal — conecta el servicio para confirmar compras.';
      refs.catalogNotice.className = 'catalog-notice is-demo';
      setApiStatus('SERVICIO SIN CONEXIÓN', true);
      renderProducts();
    }
  };

  const addToCart = (product) => {
    const existing = state.cart.find((item) => item.product._id === product._id);
    if (existing) {
      if (existing.quantity < Number(product.existencia)) existing.quantity += 1;
      else return showToast('Ya alcanzaste la cantidad disponible de esta madera.');
    } else {
      state.cart.push({ product, quantity: 1 });
    }
    renderCart();
    showToast(`${product.tipo_madera || 'Madera'} se agregó a tu carrito.`);
  };

  const renderCart = () => {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = state.cart.reduce((sum, item) => sum + (Number(item.product.precio) || 0) * item.quantity, 0);
    refs.cartCount.textContent = totalItems;
    refs.cartTotal.textContent = formatCurrency(total);

    if (!state.cart.length) {
      refs.cartItems.innerHTML = '<div class="empty-cart"><span class="empty-glyph">∅</span><strong>Tu carrito está vacío</strong><small>Explora el catálogo y agrega la madera ideal para tu proyecto.</small></div>';
      return;
    }

    refs.cartItems.innerHTML = state.cart.map((item) => `
      <div class="cart-line">
        <div class="cart-line-visual ${productClass(item.product.tipo_madera)}"></div>
        <div class="cart-line-info">
          <strong>${escapeHTML(item.product.tipo_madera || 'Madera')}</strong>
          <small>${formatCurrency(item.product.precio)} / unidad</small>
          <div class="cart-quantity">
            <button type="button" aria-label="Disminuir cantidad" data-cart-action="decrease" data-product-id="${escapeHTML(item.product._id)}">−</button>
            <span>${item.quantity}</span>
            <button type="button" aria-label="Aumentar cantidad" data-cart-action="increase" data-product-id="${escapeHTML(item.product._id)}">+</button>
          </div>
          <button class="remove-line" type="button" data-cart-action="remove" data-product-id="${escapeHTML(item.product._id)}">Quitar</button>
        </div>
        <div class="cart-line-price">${formatCurrency((Number(item.product.precio) || 0) * item.quantity)}</div>
      </div>`).join('');
  };

  const toggleCart = (isOpen) => {
    refs.cartDrawer.classList.toggle('is-open', isOpen);
    refs.cartDrawer.setAttribute('aria-hidden', String(!isOpen));
    refs.drawerBackdrop.hidden = !isOpen;
    document.body.classList.toggle('drawer-open', isOpen);
  };

  const setAuthMode = (mode) => {
    state.authMode = mode;
    const isLogin = mode === 'login';
    refs.loginForm.hidden = !isLogin;
    refs.registerForm.hidden = isLogin;
    document.querySelectorAll('[data-auth-mode]').forEach((tab) => {
      const active = tab.dataset.authMode === mode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    setAuthFeedback('');
  };

  const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

  const paymentState = (payload) => {
    const rawState = firstDefined(
      payload?.estado,
      payload?.estado_pago,
      payload?.estado_operacion,
      payload?.status,
      payload?.resultado,
      '',
    );
    const normalized = String(rawState).toLowerCase();
    return normalized.includes('aprob') || normalized === 'approved' ? 'Aprobado' : 'Rechazado';
  };

  const formatInvoiceDate = (value) => {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return 'FECHA NO DISPONIBLE';
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const buildInvoice = (snapshot, outcomes, approvedIds) => {
    const payloads = outcomes.map((outcome) => outcome.response).filter(Boolean);
    const primary = payloads[0] || {};
    const invoice = primary.factura || primary.factura_digital || primary.invoice || primary.comprobante || {};
    const sale = primary.venta || primary.sale || {};
    const transactionIds = outcomes
      .map((outcome) => firstDefined(outcome.response?.transaccion_id, outcome.response?.transaction_id, outcome.response?.id_transaccion, outcome.transactionId))
      .filter(Boolean)
      .map(String);
    const serverTotal = firstDefined(
      invoice.total,
      invoice.totales?.total,
      sale.total,
      primary.total_venta,
    );
    const computedTotal = snapshot.reduce((sum, item) => sum + (Number(item.product.precio) || 0) * item.quantity, 0);
    const approvedCount = outcomes.filter((outcome) => outcome.estado === 'Aprobado').length;
    const rejectedCount = outcomes.length - approvedCount;
    const status = rejectedCount === 0 ? 'APROBADO' : approvedCount ? 'PARCIAL' : 'RECHAZADO';
    const evidence = firstDefined(invoice.hash, invoice.firma, primary.hash, primary.firma);

    return {
      snapshot,
      outcomes,
      approvedIds,
      status,
      folio: firstDefined(
        invoice.folio,
        invoice.folio_id,
        sale.folio,
        primary.folio,
        transactionIds[0],
        `OP-${Date.now().toString(36).toUpperCase()}`,
      ),
      date: firstDefined(invoice.fecha, invoice.fecha_utc, sale.fecha, primary.fecha, primary.fecha_utc, new Date().toISOString()),
      total: serverTotal !== undefined ? Number(serverTotal) || 0 : computedTotal,
      transactionIds,
      evidence,
    };
  };

  const renderInvoice = (invoice) => {
    const isApproved = invoice.status === 'APROBADO';
    const isPartial = invoice.status === 'PARCIAL';
    const statusText = isApproved ? 'COMPRA CONFIRMADA' : isPartial ? 'COMPRA PARCIAL' : 'COMPRA NO COMPLETADA';
    const statusDetail = isApproved
      ? 'Tu pedido fue registrado correctamente.'
      : isPartial
        ? 'Algunos productos fueron confirmados; los demás permanecen en tu carrito.'
        : 'No fue posible completar esta compra. Tus productos permanecen en el carrito.';

    refs.invoiceStatusRow.classList.toggle('is-rejected', !isApproved);
    refs.invoiceStatusRow.classList.toggle('is-partial', isPartial);
    refs.invoiceStatusMark.classList.toggle('is-rejected', !isApproved);
    refs.invoiceStatusMark.classList.toggle('is-partial', isPartial);
    refs.invoiceStatusMark.textContent = isApproved ? '✓' : isPartial ? '!' : '×';
    refs.invoiceStatus.textContent = statusText;
    refs.invoiceStatusDetail.textContent = statusDetail;
    refs.invoiceFolio.textContent = String(invoice.folio);
    refs.invoiceDate.textContent = formatInvoiceDate(invoice.date);
    refs.invoiceItemCount.textContent = `${invoice.snapshot.length} ${invoice.snapshot.length === 1 ? 'PRODUCTO' : 'PRODUCTOS'}`;
    refs.invoiceTotal.textContent = formatCurrency(invoice.total);
    refs.invoiceProofDetail.textContent = invoice.transactionIds.length
      ? `${invoice.transactionIds.length} respaldo(s) digital(es) asociado(s) a tu compra.`
      : 'Tu compra cuenta con un registro verificable para mayor tranquilidad.';

    refs.invoiceLines.innerHTML = invoice.outcomes.map((outcome) => {
      const product = outcome.item.product;
      const lineTotal = (Number(product.precio) || 0) * outcome.item.quantity;
      const rejected = outcome.estado !== 'Aprobado';
      const lineDetail = outcome.error ? ` · ${escapeHTML(outcome.error)}` : '';
      return `
        <div class="invoice-line">
          <div><strong>${escapeHTML(product.tipo_madera || 'Madera')}</strong><small>${escapeHTML(product.dimensiones || 'Medidas no informadas')} · ${escapeHTML(product.marca || 'Wood AI Corporation')}</small><span class="invoice-line-state ${rejected ? 'is-rejected' : ''}">${rejected ? `NO DISPONIBLE${lineDetail}` : 'CONFIRMADA / REGISTRADA'}</span></div>
          <span>${outcome.item.quantity} und.</span>
          <span>${formatCurrency(lineTotal)}</span>
        </div>`;
    }).join('');

    const serverValues = [];
    if (invoice.transactionIds.length) serverValues.push(`<div><span>REFERENCIAS</span><strong>${escapeHTML(invoice.transactionIds.join(' · '))}</strong></div>`);
    if (invoice.evidence) serverValues.push(`<div><span>RESPALDO DIGITAL</span><strong>${escapeHTML(String(invoice.evidence).slice(0, 28))}${String(invoice.evidence).length > 28 ? '…' : ''}</strong></div>`);
    serverValues.push(`<div><span>LÍNEAS PROCESADAS</span><strong>${invoice.outcomes.length}</strong></div>`);
    refs.invoiceServerData.innerHTML = serverValues.join('');
  };

  const openInvoice = (invoice) => {
    state.invoice = invoice;
    renderInvoice(invoice);
    toggleCart(false);
    refs.invoiceBackdrop.hidden = false;
    refs.invoiceModal.hidden = false;
    refs.invoiceModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('invoice-open');
    window.requestAnimationFrame(() => refs.invoiceFinalize.focus());
  };

  const closeInvoice = () => {
    if (!state.invoice) return;
    const approvedIds = new Set(state.invoice.approvedIds.map(String));
    state.cart = state.invoice.status === 'APROBADO'
      ? []
      : state.cart.filter((item) => !approvedIds.has(String(item.product._id)));
    state.invoice = null;
    refs.invoiceModal.hidden = true;
    refs.invoiceBackdrop.hidden = true;
    refs.invoiceModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('invoice-open');
    renderCart();
    renderProducts();
    showToast('Compra finalizada. Tu carrito fue actualizado.');
  };

  const printInvoice = () => {
    if (!state.invoice) return;

    const originalTitle = document.title;
    const folio = String(state.invoice.folio).replace(/[^a-z0-9-_]/gi, '-');
    document.title = `Factura-${folio}`;

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };

    window.addEventListener('afterprint', restoreTitle);
    window.print();
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const formData = new FormData(refs.loginForm);
    const submitButton = refs.loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setAuthFeedback('Verificando tus datos…');
    try {
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo: formData.get('correo'), password: formData.get('password') }),
      });
      state.token = result.token;
      state.user = result.usuario || null;
      localStorage.setItem(TOKEN_KEY, state.token);
      if (state.user) localStorage.setItem(USER_KEY, JSON.stringify(state.user));
      updateSessionUI();
      setAuthFeedback('Bienvenido a Wood AI Corporation.');
      showToast('Has iniciado sesión correctamente.');
      window.setTimeout(() => setView('catalog'), 350);
    } catch (error) {
      setAuthFeedback(error.message || 'No fue posible iniciar sesión.', true);
    } finally {
      submitButton.disabled = false;
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const formData = new FormData(refs.registerForm);
    const submitButton = refs.registerForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setAuthFeedback('Preparando tu cuenta…');
    try {
      const result = await apiRequest('/api/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ correo: formData.get('correo'), password: formData.get('password') }),
      });
      refs.loginForm.elements.correo.value = formData.get('correo');
      refs.registerForm.reset();
      setAuthMode('login');
      setAuthFeedback(result.mensaje || 'Tu cuenta fue creada. Ya puedes iniciar sesión.');
      showToast('Cuenta creada. Te damos la bienvenida.');
    } catch (error) {
      setAuthFeedback(error.message || 'No fue posible crear tu cuenta.', true);
    } finally {
      submitButton.disabled = false;
    }
  };

  const handleCheckout = async () => {
    if (!state.cart.length) return showToast('El carrito está vacío.');
    if (!state.token) {
      toggleCart(false);
      setView('auth');
      setAuthMode('login');
      setAuthFeedback('Inicia sesión para continuar con tu compra.', true);
      return;
    }

    const snapshot = state.cart.map((item) => ({
      product: { ...item.product },
      quantity: item.quantity,
    }));
    const outcomes = [];
    const approvedIds = [];
    let authenticationFailed = false;
    const checkoutId = window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    refs.checkoutButton.disabled = true;
    refs.checkoutButton.textContent = 'Confirmando tu compra…';

    for (const item of snapshot) {
      try {
        const result = await apiRequest('/api/pagos/checkout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${state.token}` },
          body: JSON.stringify({
            producto_id: item.product._id,
            cantidad: item.quantity,
            checkout_id: checkoutId,
            carrito: snapshot.map((line) => ({
              producto_id: line.product._id,
              cantidad: line.quantity,
            })),
          }),
        });
        const estado = paymentState(result);
        outcomes.push({ item, estado, response: result });
        if (estado === 'Aprobado') {
          approvedIds.push(String(item.product._id));
          const liveProduct = state.products.find((product) => String(product._id) === String(item.product._id));
          if (liveProduct) liveProduct.existencia = Math.max(0, Number(liveProduct.existencia) - item.quantity);
        } else {
          outcomes[outcomes.length - 1].error = result.mensaje || 'No fue posible confirmar esta línea.';
        }
      } catch (error) {
        if (error.status === 401) {
          authenticationFailed = true;
          state.token = null;
          state.user = null;
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          updateSessionUI();
          toggleCart(false);
          setView('auth');
          setAuthFeedback('Tu sesión terminó. Inicia sesión nuevamente para continuar.', true);
          break;
        }
        outcomes.push({ item, estado: 'Rechazado', error: error.message || 'No fue posible confirmar esta compra.' });
      }
    }

    refs.checkoutButton.disabled = false;
    refs.checkoutButton.innerHTML = 'Continuar con la compra <span aria-hidden="true">↗</span>';
    renderProducts();
    if (!authenticationFailed && outcomes.length) openInvoice(buildInvoice(snapshot, outcomes, approvedIds));
  };

  document.addEventListener('click', (event) => {
    const viewControl = event.target.closest('[data-view]');
    if (viewControl) {
      event.preventDefault();
      setView(viewControl.dataset.view);
      return;
    }

    const authControl = event.target.closest('[data-auth-mode]');
    if (authControl) {
      setAuthMode(authControl.dataset.authMode);
      return;
    }

    const actionControl = event.target.closest('[data-action]');
    if (actionControl) {
      const { action } = actionControl.dataset;
      if (action === 'toggle-cart') toggleCart(true);
      if (action === 'close-cart') toggleCart(false);
      if (action === 'close-invoice') closeInvoice();
      if (action === 'refresh-products') loadProducts();
      if (action === 'session') {
        if (state.token) {
          const tokenToRevoke = state.token;
          state.token = null;
          state.user = null;
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          updateSessionUI();
          showToast('Sesión cerrada.');
          void apiRequest('/api/auth/logout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${tokenToRevoke}` },
          }).catch(() => {});
        } else {
          setView('auth');
        }
      }
      return;
    }

    const addControl = event.target.closest('[data-add-product]');
    if (addControl) {
      const product = state.products.find((item) => String(item._id) === String(addControl.dataset.addProduct));
      if (product) addToCart(product);
      return;
    }

    const cartControl = event.target.closest('[data-cart-action]');
    if (cartControl) {
      const item = state.cart.find((candidate) => String(candidate.product._id) === String(cartControl.dataset.productId));
      if (!item) return;
      if (cartControl.dataset.cartAction === 'increase' && item.quantity < Number(item.product.existencia)) item.quantity += 1;
      if (cartControl.dataset.cartAction === 'decrease') item.quantity -= 1;
      if (cartControl.dataset.cartAction === 'remove' || item.quantity <= 0) state.cart = state.cart.filter((candidate) => candidate !== item);
      renderCart();
    }
  });

  refs.loginForm.addEventListener('submit', handleLogin);
  refs.registerForm.addEventListener('submit', handleRegister);
  refs.checkoutButton.addEventListener('click', handleCheckout);
  refs.invoicePrint.addEventListener('click', printInvoice);
  refs.adminRefresh.addEventListener('click', loadAdminDashboard);
  refs.adminApplyFilters.addEventListener('click', loadAdminDashboard);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.invoice) closeInvoice();
  });

  const canvas = document.getElementById('neural-canvas');
  const context = canvas.getContext('2d');
  const pointer = { x: -9999, y: -9999, active: false };
  let canvasWidth = 0;
  let canvasHeight = 0;
  let deviceScale = 1;
  let nodes = [];
  let animationFrame;

  const resizeCanvas = () => {
    deviceScale = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = Math.floor(canvasWidth * deviceScale);
    canvas.height = Math.floor(canvasHeight * deviceScale);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    const count = Math.max(34, Math.min(84, Math.floor(canvasWidth / 17)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 0.19,
      vy: (Math.random() - 0.5) * 0.19,
      radius: Math.random() * 1.4 + 0.6,
      pulse: Math.random() * Math.PI * 2,
    }));
  };

  const drawNetwork = (time = 0) => {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;
      node.pulse += 0.018;
      if (node.x < -20 || node.x > canvasWidth + 20) node.vx *= -1;
      if (node.y < -20 || node.y > canvasHeight + 20) node.vy *= -1;
    });

    nodes.forEach((node, index) => {
      for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
        const other = nodes[otherIndex];
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const distance = Math.hypot(dx, dy);
        const pointerBoost = pointer.active && Math.min(Math.hypot(node.x - pointer.x, node.y - pointer.y), Math.hypot(other.x - pointer.x, other.y - pointer.y)) < 170;
        if (distance < (pointerBoost ? 220 : 145)) {
          const alpha = (1 - distance / (pointerBoost ? 220 : 145)) * (pointerBoost ? 0.42 : 0.18);
          context.beginPath();
          context.moveTo(node.x, node.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = pointerBoost ? `rgba(26, 135, 84, ${alpha})` : `rgba(139, 80, 12, ${alpha})`;
          context.lineWidth = pointerBoost ? 1 : 0.55;
          context.stroke();
        }
      }
      const pulse = node.radius + Math.sin(node.pulse + time / 900) * 0.35;
      context.beginPath();
      context.arc(node.x, node.y, Math.max(0.4, pulse), 0, Math.PI * 2);
      context.fillStyle = pointer.active && Math.hypot(node.x - pointer.x, node.y - pointer.y) < 160
        ? 'rgba(26, 135, 84, 0.95)'
        : 'rgba(139, 80, 12, 0.6)';
      context.shadowBlur = pointer.active && Math.hypot(node.x - pointer.x, node.y - pointer.y) < 160 ? 12 : 5;
      context.shadowColor = 'rgba(26, 135, 84, 0.8)';
      context.fill();
      context.shadowBlur = 0;
    });
    animationFrame = window.requestAnimationFrame(drawNetwork);
  };

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  });
  window.addEventListener('pointerleave', () => { pointer.active = false; });
  window.addEventListener('blur', () => { pointer.active = false; });

  resizeCanvas();
  animationFrame = window.requestAnimationFrame(drawNetwork);
  void animationFrame;

  updateSessionUI();
  renderCart();
  loadProducts();
})();
