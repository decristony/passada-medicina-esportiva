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
