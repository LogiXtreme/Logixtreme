(function(){
  'use strict';
  const $ = (s,r=document)=> r.querySelector(s);
  const $$ = (s,r=document)=> Array.from((r||document).querySelectorAll(s));
  function safeParse(s){ try{ return JSON.parse(s); }catch(e){ return {}; } }

  document.addEventListener('DOMContentLoaded', ()=> {
    // Year
    const year = document.getElementById('lxYear'); if(year) year.textContent = new Date().getFullYear();

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileMenuToggle') || document.querySelector('.mobile-toggle');
    const mobileMenu = document.getElementById('mobileMenu') || document.querySelector('.mobile-menu');
    function toggleMenu(){ if(!mobileMenu) return; mobileMenu.classList.toggle('open'); mobileMenu.setAttribute('aria-hidden', String(!mobileMenu.classList.contains('open'))); }
    if(mobileToggle) mobileToggle.addEventListener('click', toggleMenu);
    if(mobileMenu) mobileMenu.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> mobileMenu.classList.remove('open')));

    // Reveal on scroll
    const reveals = $$('.fade-in-up');
    if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      const io = new IntersectionObserver((entries, obs)=> {
        entries.forEach(entry=>{
          if(entry.isIntersecting){ entry.target.classList.add('revealed'); obs.unobserve(entry.target); }
        });
      }, { threshold:0.12 });
      reveals.forEach(r => io.observe(r));
    } else { reveals.forEach(r => r.classList.add('revealed')); }

    // lightweight cart (localStorage)
    function getCart(){ return safeParse(localStorage.getItem('lx_cart')||'{}'); }
    function setCart(c){ localStorage.setItem('lx_cart', JSON.stringify(c)); renderCart(); }
    function addToCart(i){ if(!i||!i.id) return; const c=getCart(); if(!c[i.id]) c[i.id]={id:i.id,title:i.title||'Item',price:i.price||0,qty:0}; c[i.id].qty+=1; setCart(c); }
    function removeFromCart(id){ const c=getCart(); if(c[id]){ delete c[id]; setCart(c); } }
    function changeQty(id,qty){ const c=getCart(); if(c[id]){ c[id].qty = qty; if(c[id].qty<=0) delete c[id]; setCart(c); } }

    $$('.btn-add').forEach(btn=>{
      btn.addEventListener('click',(e)=>{
        const id = btn.dataset.id || btn.getAttribute('data-id');
        const card = btn.closest('[data-id]') || btn.closest('.product-card') || btn.closest('.panel');
        const title = (card && (card.dataset.title || (card.querySelector('h3') && card.querySelector('h3').innerText))) || 'Item';
        const price = parseFloat((card && (card.dataset.price || '0'))||0) || 0;
        addToCart({id,title,price});
        const t = btn.innerHTML; btn.innerText='Added'; btn.disabled=true; setTimeout(()=>{ btn.innerHTML=t; btn.disabled=false; },900);
      });
    });

    function renderCart(){
      const container = $('#cartItems'), summary = $('#cartSummary');
      if(!container && !summary) return;
      const cart = getCart(); const keys = Object.keys(cart||{});
      if(container) container.innerHTML='';
      if(!keys.length){ if(summary) summary.innerHTML = '<p class="lx-muted">No items in cart.</p>'; return; }
      let total=0;
      keys.forEach(k=>{
        const it=cart[k]; const row=document.createElement('div'); row.className='cart-item';
        row.innerHTML = `<img src="assets/placeholder-cart.png" style="width:86px;height:64px;object-fit:cover;border-radius:6px"><div style="flex:1"><strong>${escapeHtml(it.title)}</strong><div class="lx-muted">€${(it.price).toFixed(2)}</div></div><div class="cart-actions"><input class="cart-qty" data-id="${it.id}" type="number" value="${it.qty}" min="0" style="width:64px;padding:.4rem;border-radius:6px;border:1px solid rgba(255,255,255,0.06)"><button class="lx-btn btn-remove" data-id="${it.id}">Remove</button></div>`;
        if(container) container.appendChild(row);
        total += (it.price||0)*(it.qty||0);
      });
      if(summary) summary.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><strong>Total</strong><strong>€${total.toFixed(2)}</strong></div><div style="margin-top:.6rem"><a id="checkoutBtn" class="lx-btn lx-btn-primary" href="#">Checkout</a> <a href="store.html" class="lx-btn lx-btn-outline" style="margin-left:.6rem">Continue shopping</a></div>`;
      $$('.cart-qty').forEach(inp=> inp.addEventListener('change', e=> changeQty(e.target.dataset.id, parseInt(e.target.value||'0',10))));
      $$('.btn-remove').forEach(b=> b.addEventListener('click', e=> removeFromCart(e.currentTarget.dataset.id)));
      const chk = $('#checkoutBtn'); if(chk) chk.addEventListener('click', e=>{ e.preventDefault(); const c=getCart(); let body='Order Summary:\n'; Object.values(c).forEach(it=> body += `${it.title} x${it.qty} - €${(it.price*it.qty).toFixed(2)}\n`); window.location.href = `mailto:hello@logixtreme.com?subject=New Order&body=${encodeURIComponent(body)}`; });
    }
    renderCart();

    // particles
    if(!document.getElementById('lxParticles') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      const canvas = document.createElement('canvas'); canvas.id='lxParticles'; document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d'); let w=canvas.width=innerWidth,h=canvas.height=innerHeight;
      const parts=[]; const PR = Math.max(12, Math.min(80, Math.floor((w*h)/90000)));
      for(let i=0;i<PR;i++) parts.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.6+0.4,vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.4,a:0.06+Math.random()*0.24});
      window.addEventListener('resize', ()=>{ w=canvas.width=innerWidth; h=canvas.height=innerHeight; });
      (function draw(){ ctx.clearRect(0,0,w,h); parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; if(p.x<-30) p.x=w+30; if(p.x>w+30) p.x=-30; if(p.y<-30) p.y=h+30; if(p.y>h+30) p.y=-30; const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*12); g.addColorStop(0, `rgba(0,255,178,${p.a})`); g.addColorStop(1, `rgba(0,255,178,0)`); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*6,0,Math.PI*2); ctx.fill(); }); requestAnimationFrame(draw); })();
    }

  }); // DOMContentLoaded

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, (m)=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
})();
