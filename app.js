(function () {
  const menu = document.getElementById('mobileMenu');
  const toggle = document.getElementById('menuToggle');
  if (menu && toggle) {
    toggle.addEventListener('click', () => {
      const opened = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(opened));
      toggle.textContent = opened ? 'بستن ×' : 'منو ☰';
    });
  }

  const form = document.getElementById('requestForm');
  const intro = document.getElementById('formIntro');
  const status = document.getElementById('formStatus');
  const frame = document.getElementById('formSubmitFrame');
  const submit = form?.querySelector('button[type="submit"]');
  const endpoint = String(window.ADADROSHAN_FORM_ENDPOINT || '').trim();
  const ready = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(endpoint);
  let pending = false;
  let timer = null;

  if (form && ready) {
    form.action = endpoint;
    form.method = 'POST';
    form.target = 'formSubmitFrame';
  } else if (form) {
    if (intro) intro.textContent = 'ثبت آنلاین درخواست در حال حاضر در دسترس نیست.';
    if (submit) submit.disabled = true;
  }

  function showStatus(message, kind) {
    if (!status) return;
    status.hidden = false;
    status.className = 'request-status request-status--' + kind;
    status.textContent = message;
  }

  if (form) form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (pending || !ready || !frame || !form.reportValidity()) return;
    pending = true;
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'در حال ثبت…';
    }
    showStatus('در حال ثبت درخواست…', 'pending');
    // ارسال فقط برای ذخیره‌سازی؛ هیچ متن جداگانه‌ای ساخته نمی‌شود.
    form.submit();
    timer = setTimeout(() => {
      pending = false;
      if (submit) {
        submit.disabled = false;
        submit.textContent = 'ثبت درخواست ←';
      }
      showStatus('تأیید ثبت دریافت نشد. قبل از ارسال دوباره، وضعیت درخواست را بررسی کن تا ثبت تکراری انجام نشود.', 'error');
    }, 25000);
  });

  window.addEventListener('message', (event) => {
    if (!pending || !frame || event.data?.source !== 'adadroshan-form-v1') return;
    if (!/^https:\/\/([a-z0-9-]+\.)*(googleusercontent\.com|google\.com)$/.test(event.origin)) return;
    if (timer) clearTimeout(timer);
    pending = false;
    if (submit) {
      submit.disabled = false;
      submit.textContent = 'ثبت درخواست ←';
    }
    if (event.data.status === 'success') {
      const id = String(event.data.id || '').trim();
      showStatus('درخواست شما با موفقیت ثبت شد. کارشناسان ما در اولین فرصت با شما تماس می‌گیرند.' + (id ? ' شناسه پیگیری: ' + id : ''), 'success');
      form.reset();
    } else {
      showStatus('ثبت درخواست موفق نبود. لطفاً دوباره تلاش کن.', 'error');
    }
  });
})();
