(function(){
  const search=document.getElementById('articleSearch');
  const buttons=[...document.querySelectorAll('[data-filter]')];
  const cards=[...document.querySelectorAll('[data-article]')];
  const count=document.getElementById('articleCount');
  const empty=document.getElementById('noArticles');
  const reset=document.getElementById('resetFilters');
  if(!search || !cards.length) return;
  let selected='همه مقاله‌ها';
  const normalize=s=>(s||'').toLowerCase().replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim();
  const apply=()=>{
    const term=normalize(search.value);
    let visible=0;
    cards.forEach(el=>{
      const matchCategory=selected==='همه مقاله‌ها'||el.dataset.category===selected;
      const matchSearch=normalize(el.dataset.search).includes(term);
      const show=matchCategory&&matchSearch;
      el.hidden=!show;
      if(show) visible++;
    });
    count.textContent=visible.toLocaleString('fa-IR')+' مقاله';
    empty.hidden=visible>0;
    if(reset) reset.hidden=selected==='همه مقاله‌ها'&&!term;
  };
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
    selected=btn.dataset.filter;
    buttons.forEach(b=>{const on=b===btn;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
    apply();
  }));
  search.addEventListener('input',apply);
  if(reset)reset.addEventListener('click',()=>{
    search.value='';selected='همه مقاله‌ها';buttons.forEach((b,i)=>{b.classList.toggle('selected',i===0);b.setAttribute('aria-pressed',String(i===0));});apply();search.focus();
  });
  apply();
})();