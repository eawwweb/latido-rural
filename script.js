// Utility
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

// slider: try local files in ./assets/images/slider/; fallback to SVG placeholders
(async () => {
  const slider = document.querySelector('[data-slider]');
  if (!slider) return;

  function svgPlaceholder(w=1600,h=900,title='',sub='',bg='#bda388',fg='#ffffff'){
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><rect width='100%' height='100%' fill='${bg}'/><g font-family='Arial, Helvetica, sans-serif' font-size='36' font-weight='bold' fill='${fg}' text-anchor='middle'><text x='${w/2}' y='${h/2-40}'>${escapeHtml(title)}</text><text x='${w/2}' y='${h/2+40}' font-size='20' font-weight='normal'>${escapeHtml(sub)}</text></g></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // load slider images from index.json
  let files = [];
  try {
    const res = await fetch('./assets/images/slider/index.json');
    if (res.ok) {
      const data = await res.json();
      files = (data.images || []).map(img => `./assets/images/slider/${img}`);
    }
  } catch(e) { console.error('Error loading slider index:', e); }

  let slides = [];
  if(files.length>0){
    // rebuild slides from local files
    slider.innerHTML = '';
    files.forEach(path=>{
      const s = document.createElement('div');
      s.className = 'slide';
      s.style.backgroundImage = `url('${path}')`;
      
      // Añadir watermark
      const watermark = document.createElement('img');
      watermark.src = './assets/images/logotipo.png';
      watermark.alt = 'Latido Rural';
      watermark.style.position = 'absolute';
      watermark.style.bottom = '12px';
      watermark.style.right = '12px';
      watermark.style.width = '60px';
      watermark.style.height = '60px';
      watermark.style.opacity = '0.35';
      watermark.style.zIndex = '10';
      watermark.style.pointerEvents = 'none';
      s.appendChild(watermark);
      
      slider.appendChild(s);
      slides.push(s);
    });
    // add controls
    const prevBtn = document.createElement('button'); prevBtn.className='slider-prev'; prevBtn.setAttribute('data-prev',''); prevBtn.setAttribute('aria-label','Anterior'); prevBtn.textContent = '<';
    const nextBtn = document.createElement('button'); nextBtn.className='slider-next'; nextBtn.setAttribute('data-next',''); nextBtn.setAttribute('aria-label','Siguiente'); nextBtn.textContent = '>';
    slider.appendChild(prevBtn); slider.appendChild(nextBtn);
  } else {
    // use existing DOM slides and placeholders
    slides = Array.from(slider.querySelectorAll('.slide'));
    slides.forEach((s, i)=>{
      const title = s.getAttribute('data-title') || `Imagen ${i+1}`;
      const sub = s.getAttribute('data-sub') || '';
      const hue = 30 + (i*30) % 360;
      const bg = `hsl(${hue} 30% 40%)`;
      s.style.backgroundImage = `url('${svgPlaceholder(1600,900,title,sub,bg)}')`;
      
      // Añadir watermark
      const watermark = document.createElement('img');
      watermark.src = './assets/images/logotipo.png';
      watermark.alt = 'Latido Rural';
      watermark.style.position = 'absolute';
      watermark.style.bottom = '12px';
      watermark.style.right = '12px';
      watermark.style.width = '60px';
      watermark.style.height = '60px';
      watermark.style.opacity = '0.35';
      watermark.style.zIndex = '10';
      watermark.style.pointerEvents = 'none';
      s.appendChild(watermark);
    });
  }

  // slider behaviour
  let idx = 0;
    const show = (i) => {
      slides.forEach(s => s.classList.remove('active', 'prev', 'next'));
      if (slides.length === 0) return;
      const current = slides[i];
      const prevIdx = (i - 1 + slides.length) % slides.length;
      const nextIdx = (i + 1) % slides.length;
      slides[prevIdx].classList.add('prev');
      slides[nextIdx].classList.add('next');
      current.classList.add('active');
    };
  show(idx);
  const next = () => { idx = (idx+1)%slides.length; show(idx); };
  const prev = () => { idx = (idx-1+slides.length)%slides.length; show(idx); };

  // ensure prev/next buttons exist (some setups may not render them)
  let nextBtn = slider.querySelector('[data-next]');
  let prevBtn = slider.querySelector('[data-prev]');
  if(!nextBtn){
    nextBtn = document.createElement('button');
    nextBtn.className = 'slider-next';
    nextBtn.setAttribute('data-next','');
    nextBtn.setAttribute('aria-label','Siguiente');
    nextBtn.textContent = '>';
    slider.appendChild(nextBtn);
  }
  if(!prevBtn){
    prevBtn = document.createElement('button');
    prevBtn.className = 'slider-prev';
    prevBtn.setAttribute('data-prev','');
    prevBtn.setAttribute('aria-label','Anterior');
    prevBtn.textContent = '<';
    slider.appendChild(prevBtn);
  }
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // autoplay every 3 seconds
  let auto;
  if(slides.length > 0){
    auto = setInterval(next, 3000);
    slider.addEventListener('mouseenter', ()=>{ if(auto) clearInterval(auto); });
    slider.addEventListener('mouseleave', ()=>{ if(auto) auto = setInterval(next, 3000); });
  }
})();

// mobile nav toggle
(function(){
  const toggle = document.getElementById('nav-toggle');
  if(!toggle) return;
  toggle.addEventListener('click', ()=>{
    document.documentElement.classList.toggle('nav-open');
  });
  // close nav when a link is clicked
  document.getElementById('main-nav')?.addEventListener('click', (e)=>{
    if(e.target.tagName==='A') document.documentElement.classList.remove('nav-open');
  });
})();

// gallery generation and filters + modal
(async function() {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  // helper: create SVG placeholder
  function svgData(w=800,h=600,text,bg){
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><rect width='100%' height='100%' fill='${bg}'/><text x='20' y='40' font-family='Arial, Helvetica, sans-serif' font-size='24' font-weight='bold' fill='rgba(255,255,255,0.8)'>${escapeHtml(text)}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // load gallery images from index.json
  let galleryFiles = [];
  try {
    const res = await fetch('./assets/images/gallery/index.json');
    if (res.ok) {
      const data = await res.json();
      galleryFiles = (data.images || []).map(img => `./assets/images/gallery/${img}`);
    }
  } catch(e) { console.error('Error loading gallery index:', e); }

  const itemsByCategory = {};
  if(galleryFiles.length>0){
    galleryFiles.forEach((path)=>{
      const name = path.split('/').pop();
      // match gallery-{category}-{order}.ext where category may contain hyphens
      const m = name.match(/^gallery-([a-z0-9\-]+)-(\d+)\.[a-z]+$/i);
      let cat = 'uncategorized';
      let order = 99999;
      if(m){ cat = m[1].toLowerCase(); order = parseInt(m[2],10); }
      if(!itemsByCategory[cat]) itemsByCategory[cat]=[];
      itemsByCategory[cat].push({src:path, order});
    });
    // sort each category by order
    Object.keys(itemsByCategory).forEach(cat=>{
      itemsByCategory[cat].sort((a,b)=>a.order - b.order);
    });
  } else {
    // fallback placeholders into default categories
    for(let i=1;i<=7;i++){
      const cat = i%3===0?'culture':(i%3===1?'portraits':'landscapes');
      itemsByCategory[cat] = itemsByCategory[cat]||[];
      itemsByCategory[cat].push({src: svgData(800,600,`Imagen ${i}` , `hsl(${(i*30)%360} 40% 45%)`), order:i});
    }
  }

  // build filter buttons dynamically from discovered categories
  const filtersWrap = document.querySelector('.filters');
  filtersWrap.innerHTML = '';
  const allBtn = document.createElement('button'); allBtn.dataset.filter='all'; allBtn.className='active'; allBtn.textContent='Todos';
  filtersWrap.appendChild(allBtn);
  Object.keys(itemsByCategory).sort().forEach(cat=>{
    const btn = document.createElement('button'); btn.dataset.filter=cat; btn.textContent = cat.replace(/-/g,' ');
    filtersWrap.appendChild(btn);
  });

  // build gallery DOM from discovered items — flatten all categories and sort globally by the trailing order number
  const galleryItems = [];
  Object.keys(itemsByCategory).forEach(cat => {
    itemsByCategory[cat].forEach(item => {
      // item has {src, order}
      galleryItems.push({ src: item.src, cat, order: (item.order||99999) });
    });
  });

  // sort globally by order (number at filename end)
  galleryItems.sort((a,b) => (a.order - b.order));

  let indexCounter = 0;
  galleryItems.forEach(item => {
    indexCounter++;
    const el = document.createElement('button');
    el.className = 'gallery-item';
    el.setAttribute('data-cat', item.cat);
    el.setAttribute('aria-label', `${item.cat} photo ${indexCounter}`);
    el.innerHTML = `<img src="${item.src}" alt="${item.cat} ${indexCounter}">`;

    // long-press: start a timer on pointerdown, open modal only if user keeps pressing
    // cancel the long-press if the pointer moves beyond a small threshold (i.e., user is scrolling)
    let holdActive = false;
    let recentlyHeld = false;
    let longPressTimer = null;
    const LONG_PRESS_MS = 450;
    const MOVE_TOLERANCE = 10;

    const startHold = (e) => {
      if(e && e.button !== undefined && e.button !== 0) return; // only primary button
      const startX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      const startY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
      let moved = false;

      const cancelTimer = () => { if(longPressTimer){ clearTimeout(longPressTimer); longPressTimer = null; } };

      const onMove = (ev) => {
        const x = (ev.touches && ev.touches[0]) ? ev.touches[0].clientX : ev.clientX;
        const y = (ev.touches && ev.touches[0]) ? ev.touches[0].clientY : ev.clientY;
        if(Math.abs(x - startX) > MOVE_TOLERANCE || Math.abs(y - startY) > MOVE_TOLERANCE){
          moved = true;
          cancelTimer();
        }
      };

      const onUp = () => {
        cancelTimer();
        if(holdActive){
          // user released after long-press: close modal
          closeModal();
          holdActive = false;
        }
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      longPressTimer = setTimeout(()=>{
        longPressTimer = null;
        if(!moved){
          holdActive = true;
          recentlyHeld = true;
          openModal(item.src, `${item.cat} ${indexCounter}`);
          setTimeout(()=>{ recentlyHeld = false; }, 400);
        }
      }, LONG_PRESS_MS);

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, {once:false});
      window.addEventListener('pointercancel', onUp, {once:false});
    };

    // prefer pointer events; pointerdown will handle touch/mouse. keep a touchstart fallback for older browsers
    el.addEventListener('pointerdown', startHold);
    el.addEventListener('touchstart', startHold);

    el.addEventListener('click', (e) => {
      if(recentlyHeld){ e.preventDefault(); e.stopImmediatePropagation(); return; }
      openModal(item.src, `${item.cat} ${indexCounter}`);
    });

    gallery.appendChild(el);
  });

  // set about photo: fixed team image
  const aboutPhoto = document.getElementById('about-photo');
  if(aboutPhoto){
    aboutPhoto.src = './assets/images/team/team-01.jpg';
    aboutPhoto.alt = 'Equipo Latido Rural';
  }

  // services images: populate dynamically from ./assets/images/services/ using index.json
  const servicesGrid = document.getElementById('services-grid');
  let serviceFiles = [];
  try {
    const res = await fetch('./assets/images/services/index.json');
    if (res.ok) {
      const data = await res.json();
      serviceFiles = (data.images || []).map(img => `./assets/images/services/${img}`);
    }
  } catch(e) { console.error('Error loading services index:', e); }

  if(serviceFiles.length>0 && servicesGrid && servicesGrid.innerHTML.trim() === ''){
    // parse filenames and extract category + order. Example: service-portrait-02.jpg
    const parsed = serviceFiles.map(path=>{
      const name = path.split('/').pop();
      const m = name.match(/^service-([a-z0-9\-]+)-(\d+)\.[a-z]+$/i);
      if(m) return {src:path, cat:m[1].toLowerCase(), order: parseInt(m[2],10)};
      const m2 = name.match(/^service-([a-z0-9\-]+)\.[a-z]+$/i);
      if(m2) return {src:path, cat:m2[1].toLowerCase(), order: 99999};
      return {src:path, cat:name.split('.')[0].toLowerCase(), order:99999};
    });

    // sort by order ascending so lower order wins when duplicate categories exist
    parsed.sort((a,b)=>a.order - b.order);

    // keep first occurrence per category (after sorting by order)
    const servicesMap = new Map();
    parsed.forEach(item=>{
      if(!servicesMap.has(item.cat)) servicesMap.set(item.cat, item);
    });

    // build final array preserving order
    const servicesArr = Array.from(servicesMap.values());

    // render services: number of services == number of unique categories found
    // Only render if servicesGrid is empty to avoid overwriting static content
    servicesGrid.innerHTML = '';
    servicesArr.forEach(svc=>{
      const art = document.createElement('article');
      art.className = 'service-item';
      const img = document.createElement('img'); img.src = svc.src; img.alt = svc.cat;
      const h3 = document.createElement('h3'); h3.textContent = svc.cat.replace(/-/g,' ');
      const p = document.createElement('p'); p.textContent = '';
      art.appendChild(img); art.appendChild(h3); art.appendChild(p);
      servicesGrid.appendChild(art);
    });
  } else {
    // no local services found - leave servicesGrid empty
  }

  // filters
  const filterButtons = document.querySelectorAll('.filters button');
  filterButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelector('.filters button.active')?.classList.remove('active');
      btn.classList.add('active');
      const f = btn.getAttribute('data-filter');
      document.querySelectorAll('.gallery-item').forEach(it=>{
        if(f==='all' || it.getAttribute('data-cat')===f) it.style.display='block'; else it.style.display='none';
      });
    });
  });

  // modal
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modal-img');
  const closeBtn = modal.querySelector('[data-close]');
  function openModal(src, alt){
    modalImg.src = src;
    modalImg.alt = alt;
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); modalImg.src=''; }
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });
})();
