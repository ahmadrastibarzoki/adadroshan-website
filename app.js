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

  // GA4 event hooks: inactive until an approved Analytics tag is installed.
  // Never pass names, contact details, form fields or request identifiers to GA4.
  function emitAnalyticsEvent(eventName) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName);
  }

  // Track interest in the request form, without collecting a user's input.
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    const href = link?.getAttribute('href') || '';
    if (href === '#request' || /(?:^|\/)contact\.html#request$/.test(href)) {
      emitAnalyticsEvent('click_request');
    }
  });

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

  // A form-start event is emitted at most once per visit to this form.
  if (form) {
    let started = false;
    form.addEventListener('focusin', (event) => {
      if (started || !event.target.matches?.('input:not([name="website"]),select,textarea')) return;
      started = true;
      emitAnalyticsEvent('request_form_start');
    });
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
      // Count a lead only after the server confirms successful saving.
      emitAnalyticsEvent('generate_lead');
      form.reset();
    } else {
      showStatus('ثبت درخواست موفق نبود. لطفاً دوباره تلاش کن.', 'error');
    }
  });
})();
