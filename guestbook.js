// Public guestbook uses its own table; older private messages stay private.
(() => {
  const list=document.getElementById('guestbook-list'), status=document.getElementById('guestbook-status');
  const more=document.getElementById('guestbook-more'), refresh=document.getElementById('guestbook-refresh');
  let rows=[], total=null, busy=false, state='commentsLoading';
  window.guestbookReady=false;
  sendButton.disabled=true;
  function render(){
    status.textContent=state?tr(state):'';
    document.getElementById('guestbook-count').textContent=total===null?'':`(${total})`;
    list.replaceChildren();
    for(const row of rows){
      const item=document.createElement('li'), avatar=document.createElement('span'), body=document.createElement('div');
      const head=document.createElement('div'), name=document.createElement('strong'), time=document.createElement('time'), text=document.createElement('p');
      item.className='guestbook-entry';avatar.className='guestbook-avatar';avatar.setAttribute('aria-hidden','true');
      const label=row.display_name?.trim()||tr('anonymous');
      avatar.textContent=Array.from(label).slice(0,2).join('').toUpperCase();name.textContent=label;
      head.className='guestbook-entry-head';body.className='guestbook-entry-body';
      const date=new Date(row.created_at), seconds=Math.min(0,Math.round((date-Date.now())/1000));
      if(!Number.isNaN(date.getTime())){
        const unit=Math.abs(seconds)<60?'second':Math.abs(seconds)<3600?'minute':Math.abs(seconds)<86400?'hour':'day';
        const divisor={second:1,minute:60,hour:3600,day:86400}[unit];
        time.textContent=new Intl.RelativeTimeFormat(locale,{numeric:'auto'}).format(Math.round(seconds/divisor),unit);
        time.dateTime=date.toISOString();time.title=date.toLocaleString(locale);
      }
      text.textContent=row.message;head.append(name,time);body.append(head,text);item.append(avatar,body);list.append(item);
    }
    more.hidden=total===null||rows.length>=total;more.disabled=busy;refresh.disabled=busy;
    list.setAttribute('aria-busy',String(busy));
  }
  async function load(reset=false){
    if(busy||!configured)return;
    busy=true;state='commentsLoading';render();
    const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),15000);
    try{
      const offset=reset?0:rows.length;
      const headers={apikey:config.supabaseKey,Prefer:'count=exact'};
      if(config.supabaseKey.startsWith('eyJ'))headers.Authorization=`Bearer ${config.supabaseKey}`;
      const response=await fetch(`${config.supabaseUrl.replace(/\/$/,'')}/rest/v1/portfolio_guestbook?select=id,display_name,message,created_at&order=created_at.desc,id.desc&limit=10&offset=${offset}`,{headers,signal:controller.signal});
      if(!response.ok)throw new Error('Guestbook unavailable');
      const data=await response.json();if(!Array.isArray(data))throw new Error('Invalid response');
      rows=reset?data:[...rows,...data.filter(row=>!rows.some(old=>old.id===row.id))];
      const count=response.headers.get('content-range')?.split('/')[1];
      total=count&&count!=='*'?Number(count):rows.length;
      state=rows.length?'':'commentsEmpty';window.guestbookReady=true;sendButton.disabled=sending;
    }catch{state='commentsError';}
    finally{clearTimeout(timer);busy=false;render();}
  }
  more.addEventListener('click',()=>load());refresh.addEventListener('click',()=>load(true));
  window.addEventListener('guestbook-posted',()=>load(true));
  window.addEventListener('portfolio-language',render);
  load(true);
})();
