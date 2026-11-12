(() => {
  const preview=document.getElementById('tocfl-preview');
  const card=preview.closest('.cert-card'), image=preview.querySelector('img');
  const buttons=[...document.querySelectorAll('[data-tocfl-slide]')], pause=document.getElementById('tocfl-pause');
  const slides=[
    {src:'assets/certificate-tocfl.jpg',alt:'Calvin — TOCFL Level 4 / CEFR B2 certificate',url:'https://drive.google.com/file/d/1S3-GVOeeNJlRmfEQASatZcCmxC7IcS6n/view'},
    {src:'assets/certificate-tocfl-score.jpg',alt:'Calvin — TOCFL score report: Listening 555/700, Reading 590/700, CEFR B2',url:'https://drive.google.com/file/d/1u8gxfuWDPZ2CA7OTVE6P2-7MliOZ3OYH/view'}
  ];
  let current=0, paused=reduced, visible=false, hovered=false, timer;
  function schedule(){clearTimeout(timer);if(paused||!visible||hovered||document.hidden||card.contains(document.activeElement)||certificateViewer.open)return;timer=setTimeout(()=>{show(1-current);schedule();},6000);}
  function show(index){
    current=index;const slide=slides[index];image.src=slide.src;image.alt=slide.alt;
    preview.dataset.certificate=slide.src;preview.dataset.original=slide.url;
    preview.classList.toggle('score-active',index===1);preview.classList.toggle('rotated-certificate',index===1);
    preview.classList.remove('slide-changing');requestAnimationFrame(()=>preview.classList.add('slide-changing'));
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  }
  function label(){pause.dataset.i18n=paused?'playSlides':'pauseSlides';pause.textContent=tr(pause.dataset.i18n);pause.setAttribute('aria-pressed',String(paused));}
  buttons.forEach(button=>button.addEventListener('click',()=>{paused=true;show(Number(button.dataset.tocflSlide));label();schedule();}));
  pause.addEventListener('click',()=>{paused=!paused;label();schedule();});
  card.addEventListener('pointerenter',()=>{hovered=true;schedule();});card.addEventListener('pointerleave',()=>{hovered=false;schedule();});
  card.addEventListener('focusin',schedule);card.addEventListener('focusout',()=>setTimeout(schedule,0));
  certificateViewer.addEventListener('close',schedule);document.addEventListener('visibilitychange',schedule);
  window.addEventListener('portfolio-language',label);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.35}).observe(preview);
  label();
})();
