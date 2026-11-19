(function(){
  const menu=document.getElementById('mobileMenu');
  const toggle=document.getElementById('menuToggle');
  if(toggle&&menu){toggle.addEventListener('click',()=>{const opened=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(opened));toggle.textContent=opened?'بستن ×':'منو ☰';});}
  const form=document.getElementById('requestForm');
  const out=document.getElementById('formResult');
  const pre=document.getElementById('requestText');
  const copy=document.getElementById('copyRequest');
  let composed='';
  if(form&&out&&pre){form.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(form);const d=Object.fromEntries(f.entries());composed=`سلام، برای بررسی اولیه فایل فروش درخواست دارم.\nنوع فروشگاه: ${d.shop||'مشخص نشده'}\nتعداد تقریبی شیت: ${d.sheets||'نامشخص'}\nبازه اطلاعات: ${d.period||'مشخص نشده'}\nتوضیح بیشتر: ${d.details||'ندارم'}\n\nلطفاً بفرمایید برای بررسی اولیه چه اطلاعات غیرحساس دیگری لازم است و روش امن ارسال فایل چیست.`;pre.textContent=composed;out.classList.add('show');out.scrollIntoView({behavior:'smooth',block:'nearest'});});}
  if(copy){copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(composed);copy.textContent='متن کپی شد ✓';}catch(e){const r=document.createRange();r.selectNodeContents(pre);const s=window.getSelection();s.removeAllRanges();s.addRange(r);copy.textContent='متن انتخاب شد؛ کپی کنید';}});}
})();