
(() => {
  const translations = window.TRANSLATIONS;
  let lang = localStorage.getItem('va-lang') || 'es';
  const header = document.getElementById('siteHeader');
  const menuButton = document.getElementById('menuButton');
  const mobileMenu = document.getElementById('mobileMenu');

  function applyLanguage(next) {
    lang = next;
    localStorage.setItem('va-lang', lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const value = translations[lang][el.dataset.i18n];
      if (typeof value === 'string') el.textContent = value;
    });
    document.querySelectorAll('[data-lang]').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
  }
  document.querySelectorAll('[data-lang]').forEach(btn => btn.addEventListener('click', () => applyLanguage(btn.dataset.lang)));
  applyLanguage(lang);

  function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', updateHeader, {passive:true});
  updateHeader();

  menuButton.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open'); header.classList.remove('menu-open'); menuButton.setAttribute('aria-expanded','false');
  }));

  // Interactive map
  if (window.L) {
    const LAT = -50.84787, LNG = -72.23116;
    const map = L.map('map', {center:[-50.7,-72.55], zoom:8, scrollWheelZoom:false, zoomControl:true});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {maxZoom:19, attribution:'&copy; OpenStreetMap · &copy; CARTO'}).addTo(map);
    const mainIcon = L.divIcon({className:'', html:'<div class="map-pulse"><i></i><b></b></div>', iconSize:[22,22], iconAnchor:[11,11]});
    L.marker([LAT,LNG],{icon:mainIcon,zIndexOffset:1000}).addTo(map).bindTooltip('Estancia La Verdadera Argentina',{permanent:true,direction:'right',offset:[8,0],className:'map-label primary'});
    const refs=[[-50.3379,-72.2648,'El Calafate'],[-50.4761,-73.0392,'Glaciar Perito Moreno'],[-49.3315,-72.8859,'El Chaltén'],[-51.7236,-72.5069,'Puerto Natales'],[-51.0,-73.05,'P.N. Torres del Paine']];
    const dot=L.divIcon({className:'',html:'<div class="map-dot"></div>',iconSize:[8,8],iconAnchor:[4,4]});
    refs.forEach(([lat,lng,name])=>L.marker([lat,lng],{icon:dot}).addTo(map).bindTooltip(name,{permanent:true,direction:'right',offset:[6,0],className:'map-label'}));
  }

  // Gallery
  const track = document.getElementById('galleryTrack');
  const slides = [...track.querySelectorAll('.gallery-slide')];
  const counter = document.getElementById('galleryCounter');
  const prev = document.getElementById('galleryPrev'), next = document.getElementById('galleryNext');
  let galleryIndex = 0;
  function nearestSlide(){const center=track.scrollLeft+track.clientWidth/2;let best=0,dist=Infinity;slides.forEach((s,i)=>{const d=Math.abs(s.offsetLeft+s.clientWidth/2-center);if(d<dist){dist=d;best=i}});galleryIndex=best;counter.textContent=`${String(best+1).padStart(2,'0')} — ${String(slides.length).padStart(2,'0')}`;prev.disabled=best===0;next.disabled=best===slides.length-1;}
  track.addEventListener('scroll',()=>requestAnimationFrame(nearestSlide),{passive:true});
  function scrollToSlide(i){i=Math.max(0,Math.min(slides.length-1,i));track.scrollTo({left:slides[i].offsetLeft-24,behavior:'smooth'});}
  prev.addEventListener('click',()=>scrollToSlide(galleryIndex-1)); next.addEventListener('click',()=>scrollToSlide(galleryIndex+1)); nearestSlide();

  // Lightbox for every site image, with gallery navigation where applicable
  const lightbox=document.getElementById('lightbox'), lightboxImage=document.getElementById('lightboxImage'), lightboxCount=document.getElementById('lightboxCount');
  const lbPrev=document.getElementById('lightboxPrev'), lbNext=document.getElementById('lightboxNext');
  let lbItems=[], lbIndex=0;
  function openLightbox(src, items=[src], index=0){lbItems=items;lbIndex=index;renderLightbox();lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
  function renderLightbox(){lightboxImage.src=lbItems[lbIndex];lightboxCount.textContent=lbItems.length>1?`${String(lbIndex+1).padStart(2,'0')} — ${String(lbItems.length).padStart(2,'0')}`:'';lbPrev.style.display=lbItems.length>1?'block':'none';lbNext.style.display=lbItems.length>1?'block':'none';}
  function closeLightbox(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');lightboxImage.src='';document.body.style.overflow='';}
  const gallerySources=slides.map(s=>s.dataset.lightbox);
  document.querySelectorAll('[data-lightbox]').forEach(el=>el.addEventListener('click',()=>{const src=el.dataset.lightbox;const gi=gallerySources.indexOf(src);openLightbox(src,gi>=0?gallerySources:[src],gi>=0?gi:0)}));
  document.getElementById('lightboxClose').addEventListener('click',closeLightbox);
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
  lbPrev.addEventListener('click',()=>{lbIndex=(lbIndex-1+lbItems.length)%lbItems.length;renderLightbox()});
  lbNext.addEventListener('click',()=>{lbIndex=(lbIndex+1)%lbItems.length;renderLightbox()});
  document.addEventListener('keydown',e=>{if(!lightbox.classList.contains('open'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft')lbPrev.click();if(e.key==='ArrowRight')lbNext.click()});
})();
