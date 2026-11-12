(() => {
  const preview=document.getElementById('tocfl-preview');
  const card=preview.closest('.cert-card'), image=preview.querySelector('img');
  const arrows=[...document.querySelectorAll('[data-tocfl-direction]')];
  const slides=[
    {src:'assets/certificate-tocfl.jpg',alt:'Calvin — TOCFL Level 4 / CEFR B2 certificate',url:'https://drive.google.com/file/d/1S3-GVOeeNJlRmfEQASatZcCmxC7IcS6n/view'},
    {src:'assets/certificate-tocfl-score.jpg',alt:'Calvin — TOCFL score report: Listening 555/700, Reading 590/700, CEFR B2',url:'https://drive.google.com/file/d/1u8gxfuWDPZ2CA7OTVE6P2-7MliOZ3OYH/view'}
  ];
  const ready=slides.map(slide=>{const preload=new Image();preload.src=slide.src;return preload.decode().then(()=>true).catch(()=>false);});
  new ResizeObserver(()=>card.style.setProperty('--tocfl-preview-height',preview.offsetHeight+'px')).observe(preview);
  let current=0, paused=reduced, visible=false, hovered=false, timer, revision=0;
  function schedule(){clearTimeout(timer);if(paused||!visible||hovered||document.hidden||card.contains(document.activeElement)||certificateViewer.open)return;timer=setTimeout(async()=>{await show(1-current);schedule();},6000);}
  async function show(index){
    const request=++revision;if(!await ready[index]||request!==revision)return;
    current=index;const slide=slides[index];image.src=slide.src;image.alt=slide.alt;
    preview.dataset.certificate=slide.src;preview.dataset.original=slide.url;
    preview.classList.toggle('score-active',index===1);preview.classList.toggle('rotated-certificate',index===1);
    preview.classList.remove('slide-changing');requestAnimationFrame(()=>preview.classList.add('slide-changing'));

  }
  function label(){const labels=locale==='zh-Hans'?['上一份文件','下一份文件']:locale==='id'?['Dokumen sebelumnya','Dokumen berikutnya']:['Previous document','Next document'];arrows.forEach((arrow,i)=>arrow.setAttribute('aria-label',labels[i]));}
  arrows.forEach(arrow=>arrow.addEventListener('click',async()=>{await show((current+Number(arrow.dataset.tocflDirection)+slides.length)%slides.length);schedule();}));
  card.addEventListener('pointerenter',()=>{hovered=true;schedule();});card.addEventListener('pointerleave',()=>{hovered=false;schedule();});
  card.addEventListener('focusin',schedule);card.addEventListener('focusout',()=>setTimeout(schedule,0));
  certificateViewer.addEventListener('close',schedule);document.addEventListener('visibilitychange',schedule);
  window.addEventListener('portfolio-language',label);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.35}).observe(preview);
  label();
})();
