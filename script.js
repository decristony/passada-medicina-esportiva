(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = document.querySelector('.top'), hero = document.querySelector('.hero');
  const mb = document.querySelector('.menu-btn'), mm = document.getElementById('menu-m');
  mb.addEventListener('click', () => { const o = mm.hidden; mm.hidden = !o; mb.setAttribute('aria-expanded', o); });
  mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mm.hidden = true));
  const onScroll = () => top.classList.toggle('solid', scrollY > hero.offsetHeight * 0.8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // HERO: as letras gigantes descem um pouco mais devagar que a foto ao rolar (profundidade)
  const megas = hero.querySelectorAll('.mega');
  if (!reduce) addEventListener('scroll', () => { if (scrollY < hero.offsetHeight) megas.forEach(m => m.style.setProperty('--py', (scrollY * 0.16).toFixed(1) + 'px')); }, { passive: true });

  // painéis
  const mobile = () => innerWidth <= 760;
  const panels = [...document.querySelectorAll('.panel')];
  const on = p => { if (mobile()) return; panels.forEach(x => x.classList.toggle('on', x === p)); };
  panels.forEach(p => { p.addEventListener('mouseenter', () => on(p)); p.addEventListener('focus', () => on(p)); p.addEventListener('click', () => on(p)); });

  // zonas de treino (Karvonen + FCmáx de Tanaka)
  const Z = {
    1: ['Zona 1 · recuperação', [.5, .6], 'Caminhada rápida ou trote leve. Serve para soltar o corpo no dia seguinte a um treino forte.'],
    2: ['Zona 2 · base aeróbica', [.6, .7], 'Ritmo em que dá para conversar em frases curtas. É onde se constrói fôlego: a maior parte da semana deveria acontecer aqui.'],
    3: ['Zona 3 · ritmo', [.7, .8], 'Confortavelmente difícil. É o ritmo de prova longa, mas cansa mais do que parece se virar rotina.'],
    4: ['Zona 4 · limiar', [.8, .9], 'Respiração pesada, frases de duas palavras. Treinos de tiro e subidas, uma ou duas vezes por semana.'],
    5: ['Zona 5 · máximo', [.9, 1], 'Esforço de poucos minutos. Só com liberação cardiológica e com descanso de verdade depois.']
  };
  const idade = document.getElementById('idade'), rep = document.getElementById('rep');
  let z = 2;
  const zb = document.getElementById('zbar'); const cols = ['#9DB7CC', '#7FC6A4', '#F2C14E', '#FF8A4C', '#FF5B1F'];
  zb.innerHTML = [1, 2, 3, 4, 5].map(i => `<div style="background:${cols[i - 1]}" data-z="${i}"></div>`).join('');
  const upd = () => {
    const a = +idade.value, r = +rep.value; document.getElementById('o-idade').textContent = a; document.getElementById('o-rep').textContent = r;
    const max = Math.round(208 - .7 * a), res = max - r;
    const rng = i => Z[i][1].map(p => Math.round(r + p * res));
    zb.querySelectorAll('div').forEach(d => { const [lo, hi] = rng(+d.dataset.z); d.textContent = `${lo}–${hi}`; d.classList.toggle('on', +d.dataset.z === z); });
    const [lo, hi] = rng(z);
    document.getElementById('z-k').textContent = Z[z][0];
    document.getElementById('z-bpm').textContent = `${lo}–${hi}`;
    document.getElementById('z-d').textContent = Z[z][2];
    document.querySelector('.ecg').style.setProperty('--beat', (60 / ((lo + hi) / 2)).toFixed(2) + 's');
    const im = document.getElementById('z-img'), src = `assets/z${z}-700.webp`;
    if (!im.src.endsWith(src)) { im.style.opacity = 0; setTimeout(() => { im.src = src; im.srcset = `assets/z${z}-700.webp 700w, assets/z${z}-1200.webp 1200w`; im.onload = () => im.style.opacity = 1; }, reduce ? 0 : 180); }
  };
  document.querySelectorAll('.zbtn button').forEach(b => b.addEventListener('click', () => {
    z = +b.dataset.z; document.querySelectorAll('.zbtn button').forEach(x => x.setAttribute('aria-pressed', x === b)); upd();
  }));
  idade.addEventListener('input', upd); rep.addEventListener('input', upd); upd();

  if (!reduce && 'IntersectionObserver' in window) {
    const els = document.querySelectorAll('.sv-head, .board li, .tr-head, .split-txt, .zn-out, .doc, .eq-head');
    els.forEach(e => e.classList.add('reveal'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }
})();

/* TRANSIÇÕES v2 · Passada Medicina Esportiva · largada, ritmo e chegada
   Entradas de textos, imagens e cartões + traço de passagem entre seções, com assinatura própria do nicho.
   Só roda com JS e sem prefers-reduced-motion; o conteúdo nunca fica escondido sem JS. */
(() => {
  const C = {"step": 0.055, "settle": 2, "divider": "<svg viewBox=\"0 0 1200 28\"><path class=\"ln\" pathLength=\"1\" style=\"--ld:0.00s\" d=\"M0 5 H1200\"/><path class=\"ln\" pathLength=\"1\" style=\"--ld:0.12s\" d=\"M0 14 H1200\"/><path class=\"ln\" pathLength=\"1\" style=\"--ld:0.24s\" d=\"M0 23 H1200\"/></svg>", "words": false, wordDelay: (i) => i * .08, cardDelay: (n) => Math.min(n, 6) * .07};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const html = document.documentElement;
  html.classList.add('fx');
  const mob = matchMedia('(max-width: 760px)').matches;
  const SKIP = '.hero, body > header, nav, footer, .nav, .wa, .whats, .wpp, [class*="whatsapp"], canvas, video, iframe, [data-nofx], [class*="marquee"], [class*="ticker"], [aria-hidden="true"]' + (C.skip ? ', ' + C.skip : '');
  const pinned = el => { for (let p = el; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p).position; if (s === 'sticky' || s === 'fixed') return true; } return false; };
  const F0 = new Map();
  if (C.imgFilter) document.querySelectorAll('section img').forEach(i => F0.set(i, getComputedStyle(i).filter));
  const sections = [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section') && !s.matches(SKIP) && !s.closest(SKIP));

  // o sistema antigo de revelação (fade genérico) sai de cena fora da hero
  sections.forEach(s => s.querySelectorAll('.rv, .reveal').forEach(el => { el.classList.remove('rv', 'reveal'); el.style.transitionDelay = ''; }));
  sections.forEach(s => s.classList.remove('rv', 'reveal'));

  const items = []; // {el, kind}
  const taken = new Set();
  const isTaken = el => { for (const t of taken) if (t !== el && t.contains(el)) return true; return false; };

  sections.forEach(sec => {
    // 1. cartões: grupos de 3+ irmãos parecidos com imagem ou título
    const groups = [];
    sec.querySelectorAll('*').forEach(p => {
      const ch = [...p.children].filter(c => !['SCRIPT', 'TEMPLATE', 'BR'].includes(c.tagName));
      if (ch.length < 3 || p.closest(SKIP)) return;
      const sig = c => c.tagName + '.' + (c.classList[0] || '');
      const cnt = {}; ch.forEach(c => cnt[sig(c)] = (cnt[sig(c)] || 0) + 1);
      const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
      if (best[1] < 3 || best[1] < ch.length * .7) return;
      const cards = ch.filter(c => sig(c) === best[0]);
      if (!cards.every(c => c.querySelector('img, h3, h4, strong, summary, dt') && c.getBoundingClientRect().height > 50)) return;
      if (cards.some(c => pinned(c))) return;
      if (groups.some(g => g.some(c => c.contains(p)))) return;
      groups.push(cards);
    });
    groups.forEach(g => g.forEach((c, i) => { if (!isTaken(c)) { c.classList.add('fx-c'); c.style.setProperty('--n', i); taken.add(c); items.push({ el: c, kind: 'c', i }); } }));

    // 2. imagens soltas (fora de cartões, fundos fixos e áreas presas)
    sec.querySelectorAll('img').forEach(img => {
      if (img.closest(SKIP) || isTaken(img) || pinned(img)) return;
      let w = img.parentElement; if (w.tagName === 'PICTURE') w = w.parentElement;
      const ws = getComputedStyle(img);
      if (ws.position === 'absolute' && w === sec) return;
      const r = w.getBoundingClientRect(), rs = sec.getBoundingClientRect();
      if (r.width * r.height > rs.width * rs.height * .85) return; // foto de fundo da seção
      let target = w;
      if (w === sec || w.querySelector('h1, h2, h3, p, a, button') ) target = img;
      if (isTaken(target) || taken.has(target)) return;
      target.classList.add('fx-i'); if (target === img) target.classList.add('fx-self');
      if (getComputedStyle(target).clipPath !== 'none') target.classList.add('fx-noclip');
      taken.add(target); items.push({ el: target, kind: 'i' });
    });

    // 3. textos: títulos, parágrafos, listas de dados, botões e formulários, em cascata
    sec.querySelectorAll('h2, h3, h4, p, li, blockquote, dl, form, ' + (C.extraText || '.eyebrow') + ', a[class*="btn"], a[class*="cta"], button[class*="btn"]').forEach(el => {
      if (el.closest(SKIP) || isTaken(el) || taken.has(el) || pinned(el)) return;
      if (el.closest('form') && el.tagName !== 'FORM') return;
      if (!el.textContent.trim() && el.tagName !== 'FORM') return;
      if (el.tagName === 'H2' && C.words) splitWords(el);
      else el.classList.add('fx-t');
      taken.add(el); items.push({ el, kind: el.classList.contains('fx-ws') ? 'w' : 't' });
    });
  });

  function splitWords(h) {
    h.classList.add('fx-ws');
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(t => { if (!t) return; if (/^\s+$/.test(t)) frag.append(t); else { const s = document.createElement('span'); s.className = 'fx-w'; s.textContent = t; frag.append(s); } });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !/^(BR|SVG|IMG)$/i.test(n.tagName)) {
          const cs = getComputedStyle(n);
          if (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text' || cs.display === 'block') { n.classList.add('fx-w'); return; }
          walk(n);
        }
      });
    };
    walk(h);
    [...h.querySelectorAll('.fx-w')].forEach((w, i, all) => w.style.setProperty('--wd', C.wordDelay(i, all.length) + 's'));
  }

  // filtro de cor de cada foto preservado: a entrada soma o efeito ao filtro original
  if (C.imgFilter) document.querySelectorAll('.fx-i img, img.fx-i, .fx-c img').forEach(img => {
    const f = F0.get(img); img.style.setProperty('--f0', (f && f !== 'none' ? f + ' ' : '') + C.imgFilter);
  });

  // 4. traço de passagem entre seções
  let nDiv = 0;
  sections.forEach((sec, k) => {
    if (nDiv >= (C.maxDiv || 7) || k === 0 && C.skipFirstDiv) return;
    if (sec.matches(C.noDiv || '.fixo, .window, .janela, .sky')) return;
    if (!sec.querySelector('h2')) return;
    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
    const box = document.createElement('div');
    box.className = 'fx-div'; box.setAttribute('aria-hidden', 'true');
    box.innerHTML = C.divider;
    sec.prepend(box); nDiv++;
    items.push({ el: box, kind: 'd' });
  });

  // entrada: os elementos que chegam juntos entram em cascata, na ordem do texto
  const step = C.step * (mob ? .7 : 1);
  const show = (el, d) => {
    el.style.transitionDelay = d + 's';
    el.style.setProperty('--dl', d + 's');
    el.classList.add('fx-on');
    setTimeout(() => { el.classList.add('fx-done'); el.style.transitionDelay = ''; }, (d + C.settle) * 1000);
  };
  // elementos recortados (clip-path) são observados pelo pai, porque o recorte zera a área visível
  const proxyOf = el => ((el.classList.contains('fx-i') && !el.classList.contains('fx-noclip')) || (C.textClip && el.classList.contains('fx-t'))) ? el.parentElement : el;
  const watch = new Map();
  items.forEach(({ el }) => { const p = proxyOf(el); if (!watch.has(p)) watch.set(p, []); watch.get(p).push(el); });
  const io = new IntersectionObserver(es => {
    const ins = es.filter(e => e.isIntersecting).flatMap(e => { io.unobserve(e.target); return watch.get(e.target) || []; })
      .sort((a, b) => a.compareDocumentPosition(b) & 2 ? 1 : -1);
    ins.forEach((el, i) => {
      const n = el.classList.contains('fx-c') ? C.cardDelay(+el.style.getPropertyValue('--n') || 0) : Math.min(i, 7) * step;
      show(el, n);
    });
  }, { threshold: .14, rootMargin: '0px 0px -7% 0px' });
  watch.forEach((_, p) => io.observe(p));
  // quem chega por âncora já encontra o que ficou acima pronto
  requestAnimationFrame(() => watch.forEach((els, p) => { if (p.getBoundingClientRect().bottom < 0) { io.unobserve(p); els.forEach(el => show(el, 0)); } }));
})();
