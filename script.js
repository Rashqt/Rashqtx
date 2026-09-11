// Theme toggle (dark / light-beige), persisted where storage is available, shared across pages
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
function applyTheme(t){
  html.setAttribute('data-theme', t);
  if(themeToggle){
    themeToggle.textContent = t === 'light' ? '🌙' : '☀️';
    themeToggle.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', t === 'light' ? '#f6efe0' : '#07070b');
  try{ localStorage.setItem('rashid-theme', t); }catch(e){}
}
let startTheme = 'light'; // light mode is the default on first visit
try{
  const saved = localStorage.getItem('rashid-theme');
  if(saved){ startTheme = saved; } // a returning visitor's toggle choice always wins
}catch(e){}
applyTheme(startTheme);
if(themeToggle){
  themeToggle.addEventListener('click', ()=>{
    applyTheme(html.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });
}

// Rotating quotes (home page only)
const quoteEl = document.getElementById('quoteText');
if(quoteEl){
  const quotes = [
    "Jack of all trades, master of none — but oftentimes better than a master of one.",
    "Piracy is not over.",
    "Culture shouldn't exist only for those who can afford it."
  ];
  const dotsEl = document.getElementById('quoteDots');
  let qi = 0;
  quoteEl.textContent = quotes[0];
  if(dotsEl) dotsEl.innerHTML = quotes.map((_,i)=>`<span class="${i===0?'active':''}"></span>`).join('');
  function showQuote(i){
    quoteEl.classList.add('fade');
    setTimeout(()=>{
      qi = i;
      quoteEl.textContent = quotes[qi];
      quoteEl.classList.remove('fade');
      if(dotsEl) [...dotsEl.children].forEach((d,idx)=>d.classList.toggle('active', idx===qi));
    }, 400);
  }
  setInterval(()=>showQuote((qi+1) % quotes.length), 5000);
}

// Hero letter-by-letter reveal (home page only)
const title = document.getElementById('heroTitle');
if(title){
  const text = [
    {t:"Rash", grad:false},
    {t:"qt.", grad:true}
  ];
  let delay = 0;
  text.forEach(part=>{
    [...part.t].forEach(ch=>{
      const el = document.createElement('span');
      el.className = 'letter' + (part.grad ? ' grad':'') + (ch === ' ' ? ' space' : '');
      el.style.animationDelay = delay + 's';
      el.textContent = ch;
      title.appendChild(el);
      delay += 0.035;
    });
  });
}

// Marquee ticker content (home page only)
const tickerEl = document.getElementById('ticker');
if(tickerEl){
  const skills = ["HTML5","CSS3","JavaScript","Node.js","Python","Pandas","MySQL","KYC Compliance","Data Entry","Excel","Git/GitHub","AI Workflows","REST APIs","Quality Assurance"];
  tickerEl.innerHTML = [...skills, ...skills].map(s=>`<span>${s}</span>`).join('');
}

// Scroll progress bar
const progress = document.getElementById('progress');
if(progress){
  window.addEventListener('scroll', ()=>{
    const h = document.documentElement;
    const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = pct + '%';
  });
}

// Cursor glow (desktop only)
const glow = document.getElementById('glow');
if(glow){
  window.addEventListener('pointermove', (e)=>{
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// Scroll reveal — exposed as a function so dynamically-added cards (blog posts) can hook in too
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:.12});
function observeReveals(root=document){
  root.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));
}
observeReveals();

// Mobile menu toggle
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
if(burger && mobileMenu){
  burger.addEventListener('click', ()=>{
    const isOpen = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a, button').forEach(link=>{
    link.addEventListener('click', ()=>{
      mobileMenu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });
}

// Tilt effect on cards (skip on touch / reduced motion) — also exposed for dynamically-added cards
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
function attachTilt(root=document){
  if(prefersReduced || !isFine) return;
  root.querySelectorAll('.card:not([data-tilt-bound])').forEach(card=>{
    card.setAttribute('data-tilt-bound', '1');
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - .5;
      const y = (e.clientY - r.top)/r.height - .5;
      card.style.transform = `perspective(700px) rotateX(${y*-7}deg) rotateY(${x*7}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)'; });
  });
}
attachTilt();

// Share buttons — works for both the homepage blog cards and the in-page blog modal,
// since it's delegated on document rather than bound to elements that exist at load time.
function runShare(btn){
  const platform = btn.dataset.platform;
  const url = btn.dataset.url || window.location.href;
  const text = btn.dataset.text || document.title;
  const enc = encodeURIComponent;
  const intents = {
    fb: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    x: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(text)}`,
    wa: `https://wa.me/?text=${enc(text + ' ' + url)}`
  };
  if(intents[platform]){
    window.open(intents[platform], '_blank', 'noopener,width=600,height=500');
    return;
  }
  // Instagram (no public web share intent) and the explicit Copy Link button both copy the URL.
  const original = btn.innerHTML;
  const copiedLabel = btn.dataset.copiedText || '✓';
  navigator.clipboard?.writeText(url).then(()=>{
    btn.classList.add('copied');
    btn.innerHTML = copiedLabel;
    setTimeout(()=>{ btn.classList.remove('copied'); btn.innerHTML = original; }, 1600);
  }).catch(()=>{});
}
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.share-btn');
  if(!btn) return;
  e.preventDefault();
  e.stopPropagation();
  runShare(btn);
});

// ---------- Shared blog helpers (used by both index.html previews and blog.html hub) ----------
let BLOGS = [];

const SHARE_ICONS = {
  ig: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>`,
  fb: `<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5h1.65V3.7c-.29-.04-1.27-.12-2.4-.12-2.38 0-4 1.45-4 4.12V10H7.4v3.1h2.9V21h3.2z"/></svg>`,
  wa: `<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.7-.85-2-.95-.27-.1-.46-.15-.66.15-.2.3-.76.95-.93 1.15-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.14-.14.3-.34.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1-1.04 2.45s1.06 2.85 1.2 3.05c.15.2 2.1 3.2 5.1 4.48.71.3 1.27.49 1.7.62.72.23 1.37.2 1.88.12.57-.09 1.7-.7 1.95-1.37.24-.68.24-1.26.17-1.38-.07-.12-.27-.2-.57-.35z"/><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.15-.43-4.5-1.24l-.32-.2-3.06.95.94-2.98-.2-.32A8.2 8.2 0 1 1 12 20.2z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M13.9 10.5 21 3h-2l-6.1 6.5L8 3H3l7.4 10.2L3 21h2l6.5-6.9L17.5 21H21z"/></svg>`,
  link: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 15l6-6"/><path d="M13 5.5l1.5-1.5a3.5 3.5 0 0 1 5 5L18 10.5"/><path d="M11 18.5L9.5 20a3.5 3.5 0 0 1-5-5L6 13.5"/></svg>`
};

function shareRowHTML(id, title, url){
  // Order matches the requested set: Instagram, Facebook, WhatsApp, X, Copy Link
  return `
    <button class="share-btn ig" data-platform="ig" data-url="${url}" data-text="${title}" aria-label="Share on Instagram">${SHARE_ICONS.ig}</button>
    <button class="share-btn fb" data-platform="fb" data-url="${url}" data-text="${title}" aria-label="Share on Facebook">${SHARE_ICONS.fb}</button>
    <button class="share-btn wa" data-platform="wa" data-url="${url}" data-text="${title}" aria-label="Share on WhatsApp">${SHARE_ICONS.wa}</button>
    <button class="share-btn x" data-platform="x" data-url="${url}" data-text="${title}" aria-label="Share on X">${SHARE_ICONS.x}</button>
    <button class="share-btn copy-link-text" data-platform="copy" data-url="${url}" data-copied-text="Link copied!" aria-label="Copy link">${SHARE_ICONS.link}<span>Copy Link</span></button>
  `;
}

function likeState(id){
  let liked = false, likes = null;
  try{
    liked = localStorage.getItem(`liked-${id}`) === '1';
    const stored = localStorage.getItem(`likes-${id}`);
    likes = stored !== null ? parseInt(stored, 10) : null;
  }catch(e){}
  return { liked, likes };
}

function currentLikeCount(post){
  const { likes } = likeState(post.id);
  return likes !== null ? likes : post.likes;
}

function loadBlogs(){
  return fetch('blogs.json').then(res=>res.json()).then(data=>{ BLOGS = data; return data; });
}

// ---------- Homepage: blog previews (read-only, no share/support, no interactive like) ----------
const blogPreviewGrid = document.getElementById('blogPreviewGrid');
if(blogPreviewGrid){
  loadBlogs().then(()=>{
    blogPreviewGrid.innerHTML = BLOGS.slice(0, 3).map(post=>{
      const isSoon = post.status === 'coming-soon';
      return `
      <a class="card blog-card reveal" href="blog.html#${post.id}">
        ${post.image ? `<div class="blog-card-image"><img src="${post.image}" alt="${post.title}" loading="lazy"></div>` : ''}
        <span class="blog-date mono">${post.category} · ${post.date}</span>
        <h3>${post.title}</h3>
        ${isSoon
          ? `<div style="margin-top:10px;"><span class="coming-soon-badge">Coming soon</span></div>`
          : `<p>${post.excerpt}</p>
             <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px;">
               <span class="like-count-display mono">❤️ ${currentLikeCount(post)}</span>
               <span class="arrow-link">Read more</span>
             </div>`}
      </a>`;
    }).join('');
    observeReveals(blogPreviewGrid);
    attachTilt(blogPreviewGrid);
  }).catch(()=>{
    blogPreviewGrid.innerHTML = '<p class="mono" style="color:var(--muted);">Couldn\'t load blog posts — this page needs to be served over http(s) for blogs.json to load.</p>';
  });
}

// ---------- blog.html: search + grid + full article view (in-page, hash-routed) ----------
const blogFullGrid = document.getElementById('blogFullGrid');
if(blogFullGrid){
  const gridView = document.getElementById('blogGridView');
  const articleView = document.getElementById('blogArticleView');
  const searchInput = document.getElementById('blogSearch');
  const noResults = document.getElementById('blogNoResults');

  function cardHTML(post){
    const isSoon = post.status === 'coming-soon';
    return `
      <div class="card blog-card reveal" data-blog-id="${post.id}" style="cursor:pointer;">
        ${post.image ? `<div class="blog-card-image"><img src="${post.image}" alt="${post.title}" loading="lazy"></div>` : ''}
        <span class="blog-date mono">${post.category} · ${post.date}</span>
        <h3>${post.title}</h3>
        ${isSoon
          ? `<div style="margin-top:10px;"><span class="coming-soon-badge">Coming soon</span></div>`
          : `<p>${post.excerpt}</p>
             <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px;">
               <span class="like-count-display mono">❤️ ${currentLikeCount(post)}</span>
               <span class="arrow-link">Read</span>
             </div>`}
      </div>`;
  }

  function renderGrid(list){
    if(!list.length){
      blogFullGrid.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }
    blogFullGrid.style.display = '';
    noResults.style.display = 'none';
    blogFullGrid.innerHTML = list.map(cardHTML).join('');
    blogFullGrid.querySelectorAll('.blog-card').forEach(card=>{
      card.addEventListener('click', ()=>openArticle(card.dataset.blogId));
    });
    observeReveals(blogFullGrid);
    attachTilt(blogFullGrid);
  }

  function applySearch(){
    const q = (searchInput.value || '').trim().toLowerCase();
    if(!q){ renderGrid(BLOGS); return; }
    const filtered = BLOGS.filter(post=>{
      const bodyText = post.content.map(c => typeof c === 'string' ? c : (c.text || '')).join(' ');
      return post.title.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        bodyText.toLowerCase().includes(q);
    });
    renderGrid(filtered);
  }
  searchInput?.addEventListener('input', applySearch);

  function contentBlockHTML(block){
    if(typeof block === 'string') return `<p>${block}</p>`;
    if(block.type === 'quote'){
      return `<blockquote class="blog-quote">"${block.text}"<cite>— ${block.attribution}</cite></blockquote>`;
    }
    if(block.type === 'heading'){
      return `<h3 class="blog-heading">${block.text}</h3>`;
    }
    return '';
  }

  function productHTML(product){
    if(!product) return '';
    const imageBlock = product.image
      ? `<div class="product-image"><img src="${product.image}" alt="${product.title}"></div>`
      : `<div class="product-image product-image--empty">Product photo coming soon</div>`;
    const button = product.buttonUrl
      ? `<a class="btn primary" href="${product.buttonUrl}" target="_blank" rel="noopener sponsored">${product.buttonText} <span class="arrow">→</span></a>`
      : `<button class="btn primary" disabled aria-disabled="true" title="Link coming soon">${product.buttonText} <span class="coming-soon-badge">Coming soon</span></button>`;
    return `
      <div class="product-placement">
        <div class="product-placement-label mono">Product Placement</div>
        ${imageBlock}
        <div class="product-info">
          <h3>${product.title}</h3>
          <p>${product.description}</p>
          ${button}
        </div>
      </div>`;
  }

  function openArticle(id){
    const post = BLOGS.find(p=>p.id === id);
    if(!post) return;
    const url = window.location.origin + window.location.pathname + '#' + post.id;
    const isSoon = post.status === 'coming-soon';

    document.getElementById('articleMeta').textContent = `${post.category} · ${post.date}`;
    document.getElementById('articleTitle').textContent = post.title;

    const featuredImg = document.getElementById('articleFeaturedImage');
    if(post.image){
      document.getElementById('articleFeaturedImg').src = post.image;
      document.getElementById('articleFeaturedImg').alt = post.title;
      featuredImg.style.display = 'block';
    }else{
      featuredImg.style.display = 'none';
    }

    document.getElementById('articleComingSoon').style.display = isSoon ? 'block' : 'none';
    document.getElementById('articleBody').style.display = isSoon ? 'none' : 'block';
    document.getElementById('articleLikeRow').style.display = isSoon ? 'none' : 'flex';
    document.getElementById('articleShareBlock').style.display = isSoon ? 'none' : 'block';

    if(!isSoon){
      document.getElementById('articleBody').innerHTML = post.content.map(contentBlockHTML).join('');
      document.getElementById('articleProduct').innerHTML = productHTML(post.product);
      document.getElementById('articleShare').innerHTML = shareRowHTML(post.id, post.title, url);

      const { liked } = likeState(post.id);
      const likeBtn = document.getElementById('likeBtn');
      likeBtn.dataset.blogId = post.id;
      likeBtn.dataset.baseLikes = post.likes;
      likeBtn.classList.toggle('liked', liked);
      likeBtn.setAttribute('aria-pressed', liked);
      document.getElementById('likeCount').textContent = currentLikeCount(post);
    }else{
      document.getElementById('articleProduct').innerHTML = '';
    }

    gridView.style.display = 'none';
    articleView.style.display = 'block';
    window.scrollTo({ top: articleView.offsetTop - 90, behavior: prefersReduced ? 'auto' : 'smooth' });
    history.pushState({ blogId: post.id }, '', '#' + post.id);
  }

  function backToGrid(pushState = true){
    articleView.style.display = 'none';
    gridView.style.display = 'block';
    if(pushState) history.pushState({}, '', window.location.pathname);
  }

  document.getElementById('backToGrid')?.addEventListener('click', ()=>backToGrid());
  window.addEventListener('popstate', ()=>{
    const id = window.location.hash.replace('#', '');
    if(id && BLOGS.find(p=>p.id === id)) openArticle(id);
    else backToGrid(false);
  });

  document.getElementById('likeBtn')?.addEventListener('click', ()=>{
    const btn = document.getElementById('likeBtn');
    const id = btn.dataset.blogId;
    const nowLiked = !btn.classList.contains('liked');
    const base = parseInt(btn.dataset.baseLikes, 10);
    const countEl = document.getElementById('likeCount');
    const newCount = base + (nowLiked ? 1 : 0);
    btn.classList.toggle('liked', nowLiked);
    btn.setAttribute('aria-pressed', nowLiked);
    countEl.textContent = newCount;
    try{
      localStorage.setItem(`liked-${id}`, nowLiked ? '1' : '0');
      localStorage.setItem(`likes-${id}`, newCount);
    }catch(e){}
  });

  loadBlogs().then(()=>{
    renderGrid(BLOGS);
    const hashId = window.location.hash.replace('#', '');
    if(hashId && BLOGS.find(p=>p.id === hashId)) openArticle(hashId);
  }).catch(()=>{
    blogFullGrid.innerHTML = '<p class="mono" style="color:var(--muted);">Couldn\'t load blog posts — this page needs to be served over http(s) for blogs.json to load.</p>';
  });
}

// ---------- Support Rash: amount picker -> UPI payment screen ----------
const supportModal = document.getElementById('supportModal');
const paymentModal = document.getElementById('paymentModal');
const UPI_ID = 'rashqt-37@ybl'; // real UPI ID
const PAYEE_NAME = 'Rashqt';

if(supportModal && paymentModal){
  let selectedAmount = null;

  function updateContinueState(){
    const btn = document.getElementById('continueBtn');
    btn.disabled = !selectedAmount || selectedAmount <= 0;
  }

  // Any element with .open-support (navbar button, mobile menu button, or the
  // button inside a full blog article) opens the amount-picker modal.
  document.querySelectorAll('.open-support').forEach(trigger=>{
    trigger.addEventListener('click', ()=>{
      selectedAmount = null;
      document.querySelectorAll('.amount-chip').forEach(c=>c.classList.remove('active'));
      document.getElementById('customAmount').value = '';
      updateContinueState();
      supportModal.classList.add('open');
      supportModal.setAttribute('aria-hidden', 'false');
    });
  });

  document.querySelectorAll('.amount-chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      document.querySelectorAll('.amount-chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      document.getElementById('customAmount').value = '';
      selectedAmount = parseInt(chip.dataset.amount, 10);
      updateContinueState();
    });
  });

  document.getElementById('customAmount')?.addEventListener('input', (e)=>{
    document.querySelectorAll('.amount-chip').forEach(c=>c.classList.remove('active'));
    const v = parseInt(e.target.value, 10);
    selectedAmount = (v && v > 0) ? v : null;
    updateContinueState();
  });

  function closeSupportModal(){
    supportModal.classList.remove('open');
    supportModal.setAttribute('aria-hidden', 'true');
  }
  function closePaymentModal(){
    paymentModal.classList.remove('open');
    paymentModal.setAttribute('aria-hidden', 'true');
  }
  document.getElementById('supportModalClose')?.addEventListener('click', closeSupportModal);
  supportModal.addEventListener('click', (e)=>{ if(e.target === supportModal) closeSupportModal(); });
  document.getElementById('paymentModalClose')?.addEventListener('click', closePaymentModal);
  paymentModal.addEventListener('click', (e)=>{ if(e.target === paymentModal) closePaymentModal(); });

  document.getElementById('continueBtn')?.addEventListener('click', ()=>{
    if(!selectedAmount) return;
    closeSupportModal();

    const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${selectedAmount}&cu=INR&tn=${encodeURIComponent('Support for Rash')}`;
    document.getElementById('payAmount').textContent = `₹${selectedAmount}`;
    document.getElementById('upiIdText').textContent = UPI_ID;
    document.getElementById('openUpiBtn').href = upiLink;

    const qrWrap = document.getElementById('qrWrap');
    qrWrap.innerHTML = '';
    if(window.QRCode){
      new QRCode(qrWrap, { text: upiLink, width: 160, height: 160, colorDark: '#0a0a0f', colorLight: '#ffffff' });
    }else{
      qrWrap.innerHTML = '<p class="mono" style="color:var(--muted); font-size:.8rem;">QR code library failed to load — use "Open in UPI App" instead.</p>';
    }

    paymentModal.classList.add('open');
    paymentModal.setAttribute('aria-hidden', 'false');
  });

  document.getElementById('copyUpiBtn')?.addEventListener('click', ()=>{
    const btn = document.getElementById('copyUpiBtn');
    navigator.clipboard?.writeText(UPI_ID).then(()=>{
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(()=>{ btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1400);
    }).catch(()=>{});
  });
}

// ---------- Newsletter (client-side only — wire up a real endpoint, e.g. Mailchimp/ConvertKit, to actually collect emails) ----------
document.querySelectorAll('.newsletter-form').forEach(form=>{
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const status = form.parentElement.querySelector('.newsletter-status');
    const email = form.querySelector('input[type="email"]').value;
    if(status){ status.textContent = `Thanks — ${email} is on the list.`; }
    form.reset();
  });
});
