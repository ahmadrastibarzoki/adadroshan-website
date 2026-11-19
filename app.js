(function(){
  const menu = document.getElementById('mobileMenu');
  const toggle = document.getElementById('menuToggle');
  if (toggle && menu) toggle.addEventListener('click', () => {
    const opened = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(opened));
    toggle.textContent = opened ? 'بستن ×' : 'منو ☰';
  });

  const form = document.getElementById('requestForm');
  const result = document.getElementById('formResult');
  const pre = document.getElementById('requestText');
  const copy = document.getElementById('copyRequest');
  const intro = document.getElementById('formIntro');
  const status = document.getElementById('formStatus');
  const frame = document.getElementById('formSubmitFrame');
  const endpoint = String(window.ADADROSHAN_FORM_ENDPOINT || '').trim();
  const ready = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(endpoint);
  let composed = '';
  let pending = false;
  let timer = null;

  if (intro && ready) intro.textContent = 'مشخصات اولیه را وارد کن. درخواست پس از ثبت در فهرست بررسی‌ها ذخیره می‌شود. فایل یا اطلاعات حساس فروش را اینجا ارسال نکن.';
  if (form && ready) {
    form.action = endpoint;
    form.method = 'POST';
    form.target = 'formSubmitFrame';
    form.querySelector('button[type="submit"]').textContent = 'ثبت درخواست ←';
  }

  function statusText(text, isError) {
    if (!status) return;
    status.textContent = text;
    status.style.color = isError ? '#A33B30' : '#23786D';
  }
  if (form && result && pre) form.addEventListener('submit', event => {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(form);
    composed = 'سلام، برای بررسی اولیه فایل فروش درخواست دارم.\n' +
      'نام: ' + (data.get('name') || '') + '\n' +
      'راه تماس: ' + (data.get('contact') || '') + '\n' +
      'نوع فروشگاه: ' + (data.get('shop') || '') + '\n' +
      'تعداد تقریبی شیت: ' + (data.get('sheets') || 'نامشخص') + '\n' +
      'بازه اطلاعات: ' + (data.get('period') || 'مشخص نشده') + '\n' +
      'توضیح بیشتر: ' + (data.get('details') || 'ندارم');
    pre.textContent = composed;
    result.classList.add('show');
    result.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    if (!ready || !frame) {
      statusText('فعلاً ذخیره‌سازی آنلاین فعال نشده است؛ متن درخواست فقط آماده شده.', true);
      return;
    }
    pending = true;
    statusText('در حال ارسال درخواست…', false);
    form.submit();
    timer = setTimeout(() => {
      pending = false;
      statusText('تأیید ذخیره دریافت نشد. قبل از ارسال دوباره، وضعیت درخواست را بررسی کن.', true);
    }, 25000);
  });
  window.addEventListener('message', event => {
    if (!pending || !frame || event.data?.source !== 'adadroshan-form-v1') return;
    if (!/^https:\/\/([a-z0-9-]+\.)*(googleusercontent\.com|google\.com)$/.test(event.origin)) return;
    if (timer) clearTimeout(timer);
    pending = false;
    if (event.data.status === 'success') {
      statusText('درخواست با موفقیت ذخیره شد. شناسه پیگیری: ' + event.data.id, false);
      form.reset();
    } else {
      statusText('ثبت درخواست موفق نبود. لطفاً دوباره تلاش کن.', true);
    }
  });
  if (copy) copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(composed); copy.textContent = 'متن کپی شد ✓'; }
    catch (err) {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(pre); sel.removeAllRanges(); sel.addRange(range);
      copy.textContent = 'متن انتخاب شد؛ کپی کنید';
    }
  });
})();