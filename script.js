(function(){
  var root=document.documentElement;
  // Vertical cut for tall screens (iPhone), centre-cropped 16:9 cut for wide ones.
  var tall=innerWidth/innerHeight<1;
  var VIDEO_SRC=tall?"media/bg-mobile.mp4":"media/bg-desktop.mp4";
  var v=document.getElementById('bg'), poster=document.getElementById('poster');
  poster.style.backgroundImage='url('+(tall?'media/poster-mobile.jpg':'media/poster-desktop.jpg')+')';
  v.muted=true; v.defaultMuted=true; v.setAttribute('muted',''); v.playsInline=true; v.setAttribute('playsinline','');
  // iPhone Safari needs byte-range streaming, which the host may not give a file served next to the page.
  // Load the whole clip into memory first and play it from there; fall back to the plain URL.
  fetch(VIDEO_SRC).then(function(r){ if(!r.ok) throw new Error('http '+r.status); return r.blob(); })
    .then(function(b){ v.src=URL.createObjectURL(new Blob([b],{type:'video/mp4'})); v.load(); tryPlay(); })
    .catch(function(){ v.src=VIDEO_SRC; v.load(); tryPlay(); });
  v.addEventListener('playing',function(){ poster.hidden=true; });
  function tryPlay(){ if(root.classList.contains('works')) return; var p=v.play(); if(p&&p.catch) p.catch(function(){}); }
  tryPlay();
  // Low Power Mode on iPhone blocks autoplay: start on the first touch instead.
  function kick(){ if(v.paused) tryPlay(); }
  ['touchend','pointerup','click','scroll'].forEach(function(e){ addEventListener(e,kick,{passive:true}); });
  v.addEventListener('canplay',tryPlay);
  document.addEventListener('visibilitychange',function(){ if(document.hidden) v.pause(); else tryPlay(); });


  // Lightbox for photos: tap to open, swipe or arrows to move, tap outside or ✕ to close
  var lb=document.getElementById('lb'), lbImg=document.getElementById('lbImg'), lbCount=document.getElementById('lbCount'), set=[], idx=0;
  function show(i){ idx=(i+set.length)%set.length; lbImg.style.opacity='0'; var src=set[idx].getAttribute('data-full');
    var pre=new Image(); pre.onload=function(){ lbImg.src=src; lbImg.style.opacity='1'; }; pre.src=src;
    lbImg.alt=set[idx].querySelector('img').alt; lbCount.textContent=(idx+1)+' / '+set.length; }
  function openLb(btn){ set=[].slice.call(btn.closest('.masonry').querySelectorAll('.ph')); lb.hidden=false; root.classList.add('lb-open'); show(set.indexOf(btn)); }
  function closeLb(){ lb.hidden=true; root.classList.remove('lb-open'); lbImg.removeAttribute('src'); }
  document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('.ph'); if(b) openLb(b); });
  document.getElementById('lbClose').addEventListener('click',closeLb);
  document.getElementById('lbNext').addEventListener('click',function(e){ e.stopPropagation(); show(idx+1); });
  document.getElementById('lbPrev').addEventListener('click',function(e){ e.stopPropagation(); show(idx-1); });
  lb.addEventListener('click',function(e){ if(e.target===lb) closeLb(); });
  document.addEventListener('keydown',function(e){ if(lb.hidden) return; if(e.key==='Escape') closeLb(); if(e.key==='ArrowLeft') show(idx+1); if(e.key==='ArrowRight') show(idx-1); });
  var sx=null,sy=0; lb.addEventListener('touchstart',function(e){ sx=e.touches[0].clientX; sy=e.touches[0].clientY; },{passive:true});
  lb.addEventListener('touchend',function(e){ if(sx===null) return; var dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy; sx=null;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)) show(idx+(dx>0?1:-1)); else if(dy>90) closeLb(); },{passive:true});

  // Views: home (default) and #video
  var ui=document.querySelector('.ui');
  var views={'#video':document.getElementById('works'),'#photo':document.getElementById('photo'),'#about':document.getElementById('about')};
  function route(){
    var isWorks=!!views[location.hash];
    for(var k in views) views[k].hidden=(k!==location.hash);
    ui.hidden=isWorks;
    root.classList.toggle('works',isWorks); root.classList.toggle('home',!isWorks);
    document.body.classList.toggle('works',isWorks);
    if(!lb.hidden) closeLb();
    if(isWorks) v.pause(); else tryPlay();
    window.scrollTo(0,0);
  }
  addEventListener('hashchange',route); route();
})();
