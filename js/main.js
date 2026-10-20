(function(){
  var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA='https://wa.me/5511976845878?text=';
  var brl=function(n){return 'R$ '+Math.round(n).toLocaleString('pt-BR')};

  /* Navegação: borda, barra de leitura, parallax do hero */
  var nav=document.getElementById('nav'),prog=document.getElementById('progress'),photo=document.getElementById('heroPhoto'),wa=document.getElementById('waFloat');
  var ticking=false;
  function onScroll(){
    if(ticking)return;ticking=true;
    requestAnimationFrame(function(){
      var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;
      nav.classList.toggle('scrolled',y>8);
      prog.style.transform='scaleX('+(h>0?y/h:0)+')';
      if(!RM&&y<innerHeight*1.2)photo.style.transform='translateY('+(y*0.08)+'px) scale(1.02)';
      wa.classList.toggle('wide',y>innerHeight*.8&&y<h-400);
      stepsFill();
      ticking=false;
    });
  }
  window.addEventListener('scroll',onScroll,{passive:true});

  /* Palavra rotativa */
  var rotEl=document.getElementById('rot'),rot=[].slice.call(rotEl.querySelectorAll('span')),ri=0;
  function rotW(){rotEl.style.width=rot[ri].getBoundingClientRect().width+'px'}
  rotW();if(document.fonts)document.fonts.ready.then(rotW);
  if(!RM)setInterval(function(){
    var cur=rot[ri];cur.classList.remove('on');cur.classList.add('off');
    ri=(ri+1)%rot.length;var nx=rot[ri];nx.classList.remove('off');
    setTimeout(function(){cur.classList.remove('off')},500);
    nx.classList.add('on');rotW();
  },2600);

  /* Celular do hero: contador, barra e status */
  function countTo(el,to,dur,fmt){
    if(RM){el.textContent=fmt(to);return}
    var t0=performance.now();
    (function f(t){var p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=fmt(to*e);if(p<1)requestAnimationFrame(f)})(t0);
  }
  setTimeout(function(){
    countTo(document.getElementById('heroCount'),54200,1600,brl);
    document.getElementById('heroBar').style.width='67%';
  },RM?0:900);
  setTimeout(function(){document.getElementById('dasStatus').classList.add('done')},RM?0:2200);

  /* Revelação ao rolar */
  var io='IntersectionObserver' in window;
  var rev=[].slice.call(document.querySelectorAll('[data-reveal]'));
  if(io&&!RM){
    var ob=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('reveal-in');e.target.classList.remove('reveal-wait');ob.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    rev.forEach(function(el,i){if(el.getBoundingClientRect().top>innerHeight){el.classList.add('reveal-wait');el.style.transitionDelay=(i%2?'.08s':'0s');ob.observe(el)}});
  }

  /* Contadores da prova */
  [].slice.call(document.querySelectorAll('[data-count]')).forEach(function(el){
    var to=parseFloat(el.dataset.count),d=+el.dataset.dec||0;
    var fmt=function(v){return v.toFixed(d).replace('.',',')};
    if(!io){return}
    var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){countTo(el,to,1400,fmt);o.disconnect()}},{threshold:.6});
    o.observe(el);
  });

  /* Menu ativo */
  var links=[].slice.call(document.querySelectorAll('#menu a'));
  if(io){
    var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id)})}})},{rootMargin:'-45% 0px -50% 0px'});
    links.forEach(function(a){var s=document.querySelector(a.getAttribute('href'));if(s)so.observe(s)});
  }

  /* Trilho: setas, pontos, arrastar, autoplay */
  var rail=document.getElementById('rail'),cards=[].slice.call(rail.querySelectorAll('.svc')),dots=document.getElementById('dots');
  cards.forEach(function(c,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Serviço '+(i+1)+': '+c.querySelector('.tag').textContent);b.innerHTML='<i></i>';b.addEventListener('click',function(){go(i)});dots.appendChild(b)});
  var dbtn=[].slice.call(dots.children);
  function cw(){return cards[0].getBoundingClientRect().width+16}
  function idx(){return Math.round(rail.scrollLeft/cw())}
  function maxIdx(){return Math.round((rail.scrollWidth-rail.clientWidth)/cw())}
  function go(i){rail.scrollTo({left:i*cw(),behavior:RM?'auto':'smooth'})}
  function mark(){var k=Math.min(idx(),cards.length-1);dbtn.forEach(function(b,i){b.setAttribute('aria-current',i===k?'true':'false')})}
  rail.addEventListener('scroll',function(){requestAnimationFrame(mark)},{passive:true});mark();
  document.getElementById('prev').addEventListener('click',function(){go(Math.max(0,idx()-1))});
  document.getElementById('next').addEventListener('click',function(){go(idx()>=maxIdx()?0:idx()+1)});
  var down=false,sx=0,sl=0,moved=false;
  rail.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=rail.scrollLeft;rail.classList.add('drag')});
  window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>4)moved=true;rail.scrollLeft=sl-dx});
  window.addEventListener('pointerup',function(){if(!down)return;down=false;rail.classList.remove('drag');go(idx())});
  rail.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation()}},true);
  var paused=false,auto;
  ['mouseenter','focusin','touchstart'].forEach(function(ev){rail.addEventListener(ev,function(){paused=true},{passive:true})});
  ['mouseleave','focusout'].forEach(function(ev){rail.addEventListener(ev,function(){paused=false})});
  if(!RM)auto=setInterval(function(){if(!paused&&!document.hidden){var r=rail.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)go(idx()>=maxIdx()?0:idx()+1)}},5000);

  /* Simulador MEI */
  var fat=document.getElementById('fat'),fatOut=document.getElementById('fatOut'),segs=[].slice.call(document.querySelectorAll('#meses button')),meses=12;
  var ringFg=document.getElementById('ringFg'),pct=document.getElementById('pct'),pill=document.getElementById('pill'),vT=document.getElementById('vTitle'),vX=document.getElementById('vText'),vN=document.getElementById('vNums'),res=document.getElementById('result'),cta=document.getElementById('calcCta');
  function calc(){
    var m=+fat.value,ano=m*meses,lim=6750*meses,p=lim?ano/lim:0;
    fat.style.setProperty('--p',(m/12000*100)+'%');
    fatOut.textContent=brl(m);
    var st,pl,t,x;
    if(p<=.8){st='var(--ok)';pl='Dentro do limite';t='Você está tranquilo por enquanto';x='Continue acompanhando mês a mês para não ser pego de surpresa.'}
    else if(p<=1){st='var(--warn)';pl='Atenção';t='Você está perto do teto';x='Vale planejar agora se continua no MEI ou se prepara para virar microempresa.'}
    else if(p<=1.2){st='var(--bad)';pl='Até 20% acima';t='O excesso gera guia complementar';x='Você paga a diferença sobre o valor excedente e muda de regime no ano seguinte.'}
    else{st='var(--bad)';pl='Mais de 20% acima';t='Desenquadramento retroativo';x='Os impostos são recalculados desde o início do ano. Fale comigo o quanto antes.'}
    res.style.setProperty('--st',st);
    ringFg.style.strokeDashoffset=314.16*(1-Math.min(p,1));
    pct.textContent=Math.round(p*100)+'%';
    pill.textContent=pl;vT.textContent=t;vX.textContent=x;
    vN.textContent=brl(ano)+' de '+brl(lim)+' no período';
    cta.href=WA+encodeURIComponent('Olá Nathany! Fiz a simulação no site: faturo cerca de '+brl(m)+' por mês ('+(meses===12?'ano todo':meses+' meses de atividade')+'), o que dá '+Math.round(p*100)+'% do limite do MEI. Pode me ajudar?');
  }
  fat.addEventListener('input',calc);
  segs.forEach(function(b){b.addEventListener('click',function(){meses=+b.dataset.m;segs.forEach(function(s){s.setAttribute('aria-pressed',s===b?'true':'false')});calc()})});
  calc();

  /* Conversa no WhatsApp */
  var chat=document.getElementById('chat'),msgs=[].slice.call(chat.querySelectorAll('.msg'));
  function playChat(){
    var t=300;
    msgs.forEach(function(mm,i){
      var isThem=mm.classList.contains('them');
      if(isThem){var ty;setTimeout(function(){ty=document.createElement('div');ty.className='typing';ty.innerHTML='<i></i><i></i><i></i>';chat.insertBefore(ty,mm)},t);t+=1300;setTimeout(function(){ty.remove();mm.classList.remove('pre')},t)}
      else setTimeout(function(){mm.classList.remove('pre')},t);
      t+=900;
    });
  }
  if(io&&!RM){var co=new IntersectionObserver(function(es){if(es[0].isIntersecting){playChat();co.disconnect()}},{threshold:.5});co.observe(chat)}
  else msgs.forEach(function(mm){mm.classList.remove('pre')});

  /* Linha de progresso do processo */
  var ol=document.getElementById('steps'),lis=[].slice.call(ol.children);
  function stepsFill(){
    var r=ol.getBoundingClientRect(),mid=innerHeight*.6;
    var f=Math.max(0,Math.min(1,(mid-r.top)/r.height));
    ol.style.setProperty('--fill',f);
    lis.forEach(function(li){li.classList.toggle('lit',li.getBoundingClientRect().top<mid)});
  }
  onScroll();

  /* FAQ: abrir um de cada vez com animação */
  var dets=[].slice.call(document.querySelectorAll('#faqList details'));
  dets.forEach(function(d){
    var s=d.querySelector('summary'),a=d.querySelector('.ans');
    s.addEventListener('click',function(e){
      if(RM||!a.animate)return;
      e.preventDefault();
      if(d.open){var h=a.offsetHeight;a.animate([{height:h+'px'},{height:'0px'}],{duration:280,easing:'cubic-bezier(.4,0,.2,1)'}).onfinish=function(){d.open=false}}
      else{dets.forEach(function(o){if(o!==d&&o.open)o.open=false});d.open=true;var h2=a.offsetHeight;a.animate([{height:'0px',opacity:0},{height:h2+'px',opacity:1}],{duration:320,easing:'cubic-bezier(.16,1,.3,1)'})}
    });
  });

  /* Copiar número */
  [].slice.call(document.querySelectorAll('[data-copy]')).forEach(function(b){
    b.addEventListener('click',function(){
      var el=document.getElementById(b.dataset.copy),t=el.textContent.trim(),o='Copiar número';
      var done=function(){b.textContent='Copiado';setTimeout(function(){b.textContent=o},1600)};
      var fallback=function(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selecionado';setTimeout(function(){b.textContent=o},1600)};
      try{navigator.clipboard.writeText(t).then(done,fallback)}catch(e){fallback()}
    });
  });

  /* Formulário para WhatsApp */
  var nome=document.getElementById('nome'),serv=document.getElementById('servico'),msg=document.getElementById('msg'),send=document.getElementById('send'),fn=document.getElementById('f-nome'),err=document.getElementById('nome-err');
  function build(){send.href=WA+encodeURIComponent('Olá Nathany! Meu nome é '+(nome.value.trim()||'[seu nome]')+'. Preciso de: '+serv.value+'.'+(msg.value.trim()?' '+msg.value.trim():''))}
  function validate(){var ok=nome.value.trim().length>1;fn.classList.toggle('invalid',!ok);err.textContent=ok?'':'Digite seu nome para a mensagem chegar completa.';return ok}
  [nome,serv,msg].forEach(function(el){el.addEventListener('input',function(){build();if(el===nome&&fn.classList.contains('invalid'))validate()})});
  nome.addEventListener('blur',function(){if(nome.value)validate()});
  send.addEventListener('click',function(e){if(!validate()){e.preventDefault();nome.focus()}});
  document.getElementById('form').addEventListener('submit',function(e){e.preventDefault()});
  build();
})();
