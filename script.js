const fs = require('fs');
const file = 'public/app.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add refs
content = content.replace(
  "paymentAuthFeedback: document.getElementById('payment-auth-feedback'),",
  "paymentAuthFeedback: document.getElementById('payment-auth-feedback'),\n    otpModal: document.getElementById('otp-modal'),\n    otpBackdrop: document.getElementById('otp-backdrop'),\n    otpForm: document.getElementById('otp-form'),\n    otpFeedback: document.getElementById('otp-feedback'),"
);

// 2. Add OTP functions after closePaymentAuthModal
const otpFunctions = 
  const setOtpFeedback = (message, isError = false) => {
    if(!refs.otpFeedback) return;
    refs.otpFeedback.textContent = message;
    refs.otpFeedback.classList.toggle('is-error', isError);
  };
  const openOtpModal = (email) => {
    if(!refs.otpForm) return;
    refs.otpForm.reset();
    refs.otpForm.elements.correo.value = email;
    setOtpFeedback('');
    refs.otpBackdrop.hidden = false;
    refs.otpModal.hidden = false;
    refs.otpModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('otp-open');
    window.requestAnimationFrame(() => refs.otpForm.elements.otp_code.focus());
  };
  const closeOtpModal = () => {
    if(!refs.otpModal) return;
    refs.otpModal.hidden = true;
    refs.otpBackdrop.hidden = true;
    refs.otpModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('otp-open');
  };
  const handleOtpVerification = async (event) => {
    event.preventDefault();
    const formData = new FormData(refs.otpForm);
    const submitButton = refs.otpForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setOtpFeedback('Verificando código...');
    try {
      const result = await apiRequest('/api/auth/verificar-otp', {
        method: 'POST',
        body: JSON.stringify({ correo: formData.get('correo'), otp_code: formData.get('otp_code') }),
      });
      showToast(result.mensaje || 'Cuenta verificada.');
      closeOtpModal();
      setAuthMode('login');
      refs.loginForm.elements.correo.value = formData.get('correo');
      setAuthFeedback('Tu cuenta ha sido activada. Ya puedes iniciar sesión.');
    } catch (error) {
      setOtpFeedback(error.message || 'Código incorrecto.', true);
    } finally {
      submitButton.disabled = false;
    }
  };
;
content = content.replace(
  "document.body.classList.remove('payment-auth-open');\n  };",
  "document.body.classList.remove('payment-auth-open');\n  };\n" + otpFunctions
);

// 3. Update handleLogin
content = content.replace(
  "setAuthFeedback(error.message || 'No fue posible iniciar sesi\\u00f3n.', true);",
  "if (error.status === 403 && String(error.message).toLowerCase().includes('pendiente')) { openOtpModal(formData.get('correo')); setAuthFeedback('Verifica tu correo para continuar.', true); } else { setAuthFeedback(error.message || 'No fue posible iniciar sesión.', true); }"
);

// 4. Update handleRegister
content = content.replace(
  "refs.loginForm.elements.correo.value = formData.get('correo');\n      refs.registerForm.reset();\n      setAuthMode('login');\n      setAuthFeedback(result.mensaje || 'Tu cuenta fue creada. Ya puedes iniciar sesi\\u00f3n.');\n      showToast('Cuenta creada. Te damos la bienvenida.');",
  "refs.registerForm.reset();\n      openOtpModal(formData.get('correo'));\n      setAuthFeedback('Revisa tu correo para el código de activación.');\n      showToast('Cuenta creada. Revisa tu correo.');"
);

// 5. Add event listeners
content = content.replace(
  "refs.paymentAuthForm.addEventListener('submit', handlePaymentAuthorization);",
  "refs.paymentAuthForm.addEventListener('submit', handlePaymentAuthorization);\n  if(refs.otpForm) refs.otpForm.addEventListener('submit', handleOtpVerification);\n  document.querySelectorAll('[data-action=\"cancel-otp\"]').forEach(btn => btn.addEventListener('click', closeOtpModal));"
);

content = content.replace(
  "if (event.key === 'Escape' && !refs.paymentAuthModal.hidden) closePaymentAuthModal();",
  "if (event.key === 'Escape' && !refs.paymentAuthModal.hidden) closePaymentAuthModal();\n    if (event.key === 'Escape' && refs.otpModal && !refs.otpModal.hidden) closeOtpModal();"
);

fs.writeFileSync(file, content);
console.log('app.js updated with OTP logic');
