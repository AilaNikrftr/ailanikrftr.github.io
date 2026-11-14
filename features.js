// Small interactive touches for the sections below the hero.
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* 1. scroll progress + nav highlight */
  const bar = document.createElement('div');
  bar.className = 'progress';
  document.body.appendChild(bar);
  const navLinks = $$('.links a');
  const sections = $$('main section, .wrap > section');
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    let cur = null;
    for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * 0.35) cur = s.id;
    if (max > 0 && scrollY >= max - 2) cur = sections[sections.length - 1].id; // bottom of page: last section
    navLinks.forEach(a => a.classList.toggle('here', a.getAttribute('href') === '#' + cur));
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 2. section pills light up, timeline entries commit as they scroll into view */
  const rows = $$('#experience .row');
  if (reduce || !('IntersectionObserver' in window)) {
    sections.forEach(s => s.classList.add('seen'));
    rows.forEach(r => r.classList.add('committed'));
  } else {
    const seen = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('seen'); seen.unobserve(e.target); }
    }), { rootMargin: '0px 0px -30% 0px' });
    sections.forEach(s => seen.observe(s));
    // entries commit in order, like a replicated log
    let next = 0;
    const commit = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) e.target.dataset.reached = '1'; });
      (function step() {
        if (next < rows.length && rows[next].dataset.reached) {
          rows[next].classList.add('committed');
          next++;
          setTimeout(step, 260);
        }
      })();
    }, { rootMargin: '0px 0px -25% 0px' });
    rows.forEach(r => commit.observe(r));
  }

  /* 3. work filters */
  const work = $('#work');
  const cards = $$('#work .row');
  const LABELS = { all: 'all', python: 'python', pytorch: 'pytorch', go: 'go', typescript: 'typescript', csharp: 'c#', java: 'java' };
  const filters = document.createElement('div');
  filters.className = 'filters';
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filter projects by skill');
  filters.innerHTML = Object.entries(LABELS).map(([k, v]) =>
    '<button type="button" data-f="' + k + '" aria-pressed="' + (k === 'all') + '">' + v + '</button>').join('') +
    '<span class="count" aria-live="polite"></span>';
  $('h2', work).after(filters);
  const count = $('.count', filters);
  function filter(skill) {
    let n = 0;
    cards.forEach(c => {
      const hit = skill === 'all' || (c.dataset.skills || '').split(' ').includes(skill);
      c.classList.toggle('dim', !hit);
      if (hit) n++;
    });
    $$('button', filters).forEach(b => b.setAttribute('aria-pressed', b.dataset.f === skill));
    count.textContent = skill === 'all' ? cards.length + ' projects' : n + ' of ' + cards.length;
  }
  filters.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) { clearSkill(); filter(b.dataset.f); }
  });
  filter('all');

  /* 4. skill chips light up everything that uses them */
  const chips = $$('.stack li[data-skill]');
  const tagged = $$('.row[data-skills]');
  chips.forEach(li => {
    const n = tagged.filter(r => r.dataset.skills.split(' ').includes(li.dataset.skill)).length;
    if (!n) { li.removeAttribute('data-skill'); return; }
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-pressed', 'false');
    li.insertAdjacentHTML('beforeend', '<span class="n">' + n + '</span>');
  });
  let active = null;
  function clearSkill() {
    active = null;
    chips.forEach(c => { c.classList.remove('on'); c.setAttribute('aria-pressed', 'false'); });
    tagged.forEach(r => r.classList.remove('lit'));
  }
  function pick(li) {
    const skill = li.dataset.skill;
    if (!skill) return;
    if (active === skill) { clearSkill(); return; }
    clearSkill();
    active = skill;
    li.classList.add('on');
    li.setAttribute('aria-pressed', 'true');
    const hits = tagged.filter(r => r.dataset.skills.split(' ').includes(skill));
    hits.forEach(r => r.classList.add('lit'));
    if (LABELS[skill]) filter(skill); else filter('all');
    hits[0].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }
  chips.forEach(li => {
    li.addEventListener('click', () => pick(li));
    li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(li); } });
  });

  /* 5. contact: copy address + local time */
  const copy = $('#copymail');
  if (copy) copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(copy.dataset.mail); copy.textContent = 'copied ✓'; }
    catch { copy.textContent = copy.dataset.mail; }
    copy.classList.add('done');
    setTimeout(() => { copy.textContent = 'copy address'; copy.classList.remove('done'); }, 1800);
  });
  const clock = $('#clock');
  function tick() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { timeZone: 'America/Vancouver', hour: 'numeric', minute: '2-digit' }).toLowerCase();
    const h = +now.toLocaleString('en-US', { timeZone: 'America/Vancouver', hour: 'numeric', hour12: false }) % 24;
    let note, away = false;
    if (h < 7) { note = 'probably asleep. I\'ll reply in the morning'; away = true; }
    else if (h < 9) { note = 'probably on my first coffee'; }
    else if (h < 18) { note = 'a good time to reach me'; }
    else if (h < 23) { note = 'evening here, still checking email'; }
    else { note = 'winding down. I\'ll reply tomorrow'; away = true; }
    clock.innerHTML = '<span class="dot' + (away ? ' away' : '') + '"></span><span>it\'s <b>' + time + '</b> in Victoria, BC · ' + note + '</span>';
  }
  if (clock) { tick(); setInterval(tick, 30000); }
})();
