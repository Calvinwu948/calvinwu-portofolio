const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let locale='zh-Hans';
try { const saved=localStorage.getItem('calvin-language'); if(['zh-Hans','id','en'].includes(saved))locale=saved; } catch {}
const tr=key=>translations[key]?.[locale]||key;
let statusKey='';
function setStatus(key){statusKey=key;document.getElementById('form-status').textContent=key?tr(key):'';}
function setLanguage(value){
  locale=value;document.documentElement.lang=value;
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=tr(el.dataset.i18n));
  document.title=tr('pageTitle');document.getElementById('language-label').textContent={'zh-Hans':'简体中文',id:'Indonesia',en:'English'}[value];
  document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===value)));
  document.querySelector('meta[name="description"]').content=tr('heroSub')+' TOCFL B2 · Excel · PANTAUTOKO';
  document.querySelector('nav').setAttribute('aria-label',value==='zh-Hans'?'主选单':value==='id'?'Navigasi utama':'Main navigation');
  document.querySelector('footer>a').setAttribute('aria-label',value==='zh-Hans'?'回到顶端':value==='id'?'Kembali ke atas':'Back to top');
  if(statusKey)setStatus(statusKey);
  sendButton.textContent=tr(sending?'sending':'send');
  try{localStorage.setItem('calvin-language',value);}catch{}
  requestAnimationFrame(()=>{updateScroll();drawContours();});
}
const tabs=[...document.querySelectorAll('[role="tab"]')];
function chooseTab(key){
  document.getElementById('certificate-grid').hidden=key!=='certificates';
  document.getElementById('project-content').hidden=key!=='projects';
  document.getElementById('portfolio-panel').classList.add('show-certificates');
  document.getElementById('portfolio-panel').setAttribute('aria-labelledby',`tab-${key}`);
  tabs.forEach(tab=>{const active=tab.dataset.tab===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
}
document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{
  chooseTab(button.dataset.tab);
  if(button.classList.contains('folder'))document.getElementById('portfolio-content').scrollIntoView({behavior:reduced?'instant':'smooth'});
}));
tabs.forEach((tab,i)=>tab.addEventListener('keydown',event=>{
  const next={ArrowRight:(i+1)%tabs.length,ArrowLeft:(i+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
  if(next===undefined)return;event.preventDefault();chooseTab(tabs[next].dataset.tab);tabs[next].focus();
}));
const form=document.getElementById('contact-form'),sendButton=document.getElementById('send-message');
const message=document.getElementById('message');
let sending=false;
const config=window.PORTFOLIO_CONFIG||{};
const configured=config.messagingEnabled === true && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.supabaseUrl||'') && /^(sb_publishable_|eyJ)/.test(config.supabaseKey||'');
message.addEventListener('input',()=>document.getElementById('message-count').textContent=`${message.value.length} / 3000`);
form.addEventListener('submit',async event=>{
  event.preventDefault();if(sending)return;
  if(!configured){setStatus('unavailable');return;}
  const fields=new FormData(form);
  if(fields.get('website')){setStatus('invalid');return;}
  const payload={name:fields.get('name').trim(),email:fields.get('email').trim(),message:fields.get('message').trim(),locale};
  if(!form.reportValidity()||!payload.name||payload.message.length<10){setStatus('invalid');return;}
  sending=true;sendButton.disabled=true;sendButton.textContent=tr('sending');form.setAttribute('aria-busy','true');setStatus('');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try{
    const headers={'Content-Type':'application/json',apikey:config.supabaseKey,Prefer:'return=minimal'};
    if(config.supabaseKey.startsWith('eyJ'))headers.Authorization=`Bearer ${config.supabaseKey}`;
    const response=await fetch(`${config.supabaseUrl.replace(/\/$/,'')}/rest/v1/portfolio_messages`,{method:'POST',headers,body:JSON.stringify(payload),signal:controller.signal});
    if(!response.ok)throw new Error('Request failed');
    form.reset();document.getElementById('message-count').textContent='0 / 3000';setStatus('success');
  }catch{setStatus('error');}
  finally{clearTimeout(timeout);sending=false;sendButton.disabled=false;form.removeAttribute('aria-busy');sendButton.textContent=tr('send');}
});
const languageMenu=document.getElementById('language-menu');
const languageTrigger=languageMenu.querySelector('summary');
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{
  setLanguage(button.dataset.language);languageMenu.open=false;languageTrigger.focus();
}));
document.addEventListener('click',event=>{if(!languageMenu.contains(event.target))languageMenu.open=false;});
languageMenu.addEventListener('keydown',event=>{if(event.key==='Escape'){languageMenu.open=false;languageTrigger.focus();}});
document.addEventListener('focusin',event=>{if(!languageMenu.contains(event.target))languageMenu.open=false;});
chooseTab('certificates');
if(!configured){sendButton.disabled=true;setStatus('unavailable');}
setLanguage(locale);
const navLinks = [...document.querySelectorAll('nav a')];
const sections = ['Home','About','Portofolio','Contact'].map(id=>document.getElementById(id));
function updateScroll(){
  let current=0;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.45)current=i;});
  navLinks.forEach((a,i)=>{a.classList.toggle('active',i===current);if(i===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  const first=navLinks[0].getBoundingClientRect(),active=navLinks[current].getBoundingClientRect();
  document.querySelector('.mascot').style.setProperty('--ghost-x',`${active.left-first.left+(active.width-first.width)/2}px`);
  updateTimelineFocus();
}
let queued=false;addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{updateScroll();queued=false;});}},{passive:true});
if(!reduced && 'IntersectionObserver' in window){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
document.getElementById('year').textContent=new Date().getFullYear();
// Deterministic contour lines: decorative only, redrawn on resize.
function drawContours(){const canvas=document.getElementById('topography'),ctx=canvas.getContext('2d');const w=canvas.parentElement.clientWidth,h=canvas.parentElement.clientHeight;canvas.width=w;canvas.height=h;ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(119,139,170,.16)';ctx.lineWidth=1.2;for(let group=0;group<12;group++){const cx=(Math.sin(group*7.9)*.45+.5)*w,cy=(group/11)*h;for(let ring=1;ring<=8;ring++){ctx.beginPath();for(let step=0;step<=100;step++){const a=step*Math.PI*2/100,r=ring*24+(Math.sin(a*3+group)+Math.cos(a*5-group))*9,x=cx+Math.cos(a)*r*1.7,y=cy+Math.sin(a)*r;if(step===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();}}}
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{updateScroll();drawContours();},100);});updateScroll();drawContours();


// Gentle reveal staggering and timeline focus, respecting reduced motion.
if(!reduced && 'IntersectionObserver' in window){
  document.querySelectorAll('.education-item,.cert-card,.preview-folder,.timeline-item').forEach((el,i)=>{
    el.classList.add('motion-item');el.style.setProperty('--reveal-delay',`${(i%3)*90}ms`);
  });
  const motionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('in-view');motionObserver.unobserve(entry.target);}
  }),{threshold:.12});
  document.querySelectorAll('.motion-item').forEach(el=>motionObserver.observe(el));
}
function updateTimelineFocus(){
  for(const selector of ['.education-list','.education-companion']){
    const group=document.querySelector(selector);if(!group)continue;
    const items=[...group.querySelectorAll('.education-item,.timeline-item')];
    const target=innerHeight*.43;
    const nearest=items.reduce((best,item)=>{const rect=item.getBoundingClientRect();const distance=Math.abs(rect.top+Math.min(rect.height,130)/2-target);return !best||distance<best.distance?{item,distance}:best;},null);
    items.forEach(item=>item.classList.toggle('is-current',item===nearest?.item));
  }
}
updateTimelineFocus();
