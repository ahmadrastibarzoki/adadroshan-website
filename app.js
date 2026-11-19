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

  // Basic consent mode: do not load or contact Google Analytics before opt-in.
  // All pages share app.js; GTM-TBWS99TZ is intentionally NOT installed to avoid duplicate tags.
  const ANALYTICS_ID = 'G-72GB25QWPC';
  const ANALYTICS_PREF_KEY = 'adadroshan_analytics_consent_v1';
  const DENIED_CONSENT = {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  };
  let analyticsConsent = null;
  let analyticsStarted = false;
  try {
    const stored = window.localStorage.getItem(ANALYTICS_PREF_KEY);
    if (stored === 'granted' || stored === 'denied') analyticsConsent = stored;
  } catch (_) { /* A blocked storage API must not break the website. */ }

  function saveAnalyticsConsent(choice) {
    analyticsConsent = choice;
    try { window.localStorage.setItem(ANALYTICS_PREF_KEY, choice); } catch (_) {}
  }

  function startAnalytics() {
    if (analyticsConsent !== 'granted' || analyticsStarted) return;
    analyticsStarted = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('consent', 'default', DENIED_CONSENT);
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('config', ANALYTICS_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      // Query strings can contain personal data. Measure only the public page URL.
      page_location: window.location.origin + window.location.pathname,
      page_referrer: (() => {
        try {
          const ref = new URL(document.referrer);
          return ref.origin + ref.pathname;
        } catch (_) { return ''; }
      })()
    });

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ANALYTICS_ID);
    tag.id = 'adadroshan-ga4';
    document.head.appendChild(tag);
  }

  function clearAnalyticsCookies() {
    // Best-effort cleanup for cookies created on this hostname.
    const cookieNames = document.cookie.split(';').map(x => x.trim().split('=')[0]);
    const currentPath = window.location.pathname.replace(/\/[^/]*$/, '/') || '/';
    const paths = Array.from(new Set(['/', '/adadroshan-website/', currentPath]));
    cookieNames.forEach(name => {
      if (name !== '_ga' && !name.startsWith('_ga_')) return;
      paths.forEach(path => {
        document.cookie = name + '=; Max-Age=0; path=' + path + '; SameSite=Lax; Secure';
      });
    });
  }

  function showAnalyticsChoices() {
    if (document.getElementById('analyticsConsentPanel')) {
      document.getElementById('analyticsConsentPanel').hidden = false;
      return;
    }
    const panel = document.createElement('section');
    panel.id = 'analyticsConsentPanel';
    panel.className = 'analytics-consent';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'انتخاب حریم خصوصی و آمار بازدید');

    const articlePage = /\/articles\//.test(window.location.pathname);
    const privacyUrl = articlePage ? '../contact.html#privacy' : 'contact.html#privacy';
    panel.innerHTML =
      '<div class="analytics-consent__copy">' +
        '<strong>آمار بازدید و حریم خصوصی</strong>' +
        '<p>با اجازه شما، از Google Analytics برای شناخت بازدید صفحات و بهبود عددروشن استفاده می‌کنیم. ' +
        'رد کردن آمار بازدید هیچ محدودیتی برای استفاده از سایت ایجاد نمی‌کند. ' +
        '<a href="' + privacyUrl + '">جزئیات حریم خصوصی</a></p>' +
      '</div>' +
      '<div class="analytics-consent__actions">' +
        '<button type="button" data-consent="granted">پذیرش آمار بازدید</button>' +
        '<button type="button" data-consent="denied">رد آمار بازدید</button>' +
      '</div>';
    document.body.appendChild(panel);
    panel.querySelectorAll('button[data-consent]').forEach(button => {
      button.addEventListener('click', () => {
        const next = button.getAttribute('data-consent');
        if (next !== 'granted' && next !== 'denied') return;
        const previouslyEnabled = analyticsStarted;
        saveAnalyticsConsent(next);
        panel.hidden = true;
        if (next === 'granted') startAnalytics();
        else if (previouslyEnabled) {
          if (typeof window.gtag === 'function') window.gtag('consent', 'update', DENIED_CONSENT);
          clearAnalyticsCookies();
          // Reload to remove previously loaded GA4 code from the active page.
          window.location.reload();
        }
      });
    });
  }

  function installAnalyticsPrivacyLink() {
    const footerLinks = document.querySelector('.footer .foot-links');
    if (!footerLinks || footerLinks.querySelector('[data-analytics-preferences]')) return;
    const link = document.createElement('a');
    link.href = '#analytics-preferences';
    link.textContent = 'تنظیمات آمار و حریم خصوصی';
    link.setAttribute('data-analytics-preferences', 'true');
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showAnalyticsChoices();
      document.getElementById('analyticsConsentPanel')
        ?.querySelector('button[data-consent="granted"]')?.focus();
    });
    footerLinks.appendChild(link);
  }

  installAnalyticsPrivacyLink();
  if (analyticsConsent === 'granted') startAnalytics();
  else if (analyticsConsent === null) showAnalyticsChoices();

  // Never pass names, contact details, form values or tracking identifiers to GA4.
  function emitAnalyticsEvent(eventName) {
    if (analyticsConsent !== 'granted' || !analyticsStarted || typeof window.gtag !== 'function') return;
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
    if (!pending || !frame || event.source !== frame.contentWindow || event.data?.source !== 'adadroshan-form-v1') return;
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
