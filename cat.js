// A Cheshire-ish black cat that lives in a different spot in each section.
// It vanishes body-first (eyes and grin linger) when you scroll on, appears
// eyes-first in the next spot, watches your cursor, and reacts to what you do.
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const S = 1.25; // px per svg unit

  // ---------- drawing ----------
  const DEFS = `<defs>
    <linearGradient id="catfur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262833"/><stop offset=".5" stop-color="#0d0e14"/><stop offset="1" stop-color="#050509"/></linearGradient>
    <radialGradient id="catiris" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#f6cf6a"/><stop offset=".65" stop-color="#cf9530"/><stop offset="1" stop-color="#7c5317"/></radialGradient>
  </defs>`;
  function head(cx, cy, tilt = 0) {
    const eye = (dx, rot) => {
      const x = cx + dx, y = cy - 1;
      return `<g class="eye-o" transform="rotate(${rot} ${x} ${y})">
        <path class="iris" d="M${x - 3.1} ${y} Q${x} ${y - 2.9} ${x + 3.1} ${y} Q${x} ${y + 2.7} ${x - 3.1} ${y} Z"/>
        <ellipse class="pupil" cx="${x}" cy="${y}" rx=".65" ry="2.15"/>
        <circle class="glint" cx="${x + .9}" cy="${y - .9}" r=".45"/></g>`;
    };
    const lid = (dx, up) => { const x = cx + dx, y = cy - .6;
      return up ? `M${x - 3} ${y + .6} Q${x} ${y - 1.6} ${x + 3} ${y + .6}` : `M${x - 3} ${y - .2} Q${x} ${y + 1.8} ${x + 3} ${y - .2}`; };
    return {
      body: `<g transform="rotate(${tilt} ${cx} ${cy})">
        <path d="M${cx - 10} ${cy - 2} L${cx - 9.6} ${cy - 17} Q${cx - 8.6} ${cy - 18} ${cx - 7.6} ${cy - 17} L${cx - 2.2} ${cy - 9.4} Z M${cx + 10} ${cy - 2} L${cx + 9.6} ${cy - 17} Q${cx + 8.6} ${cy - 18} ${cx + 7.6} ${cy - 17} L${cx + 2.2} ${cy - 9.4} Z" class="fur ear"/>
        <path class="inear" d="M${cx - 8.6} ${cy - 6} L${cx - 8.4} ${cy - 15} L${cx - 4} ${cy - 9} Z M${cx + 8.6} ${cy - 6} L${cx + 8.4} ${cy - 15} L${cx + 4} ${cy - 9} Z"/>
        <path class="fur" d="M${cx - 11} ${cy + 1} C${cx - 11} ${cy - 7} ${cx - 6} ${cy - 10.5} ${cx} ${cy - 10.5} C${cx + 6} ${cy - 10.5} ${cx + 11} ${cy - 7} ${cx + 11} ${cy + 1} C${cx + 11} ${cy + 6} ${cx + 6} ${cy + 9.5} ${cx} ${cy + 9.8} C${cx - 6} ${cy + 9.5} ${cx - 11} ${cy + 6} ${cx - 11} ${cy + 1} Z"/>
        <path class="nose" d="M${cx - 1.3} ${cy + 3.6} L${cx + 1.3} ${cy + 3.6} L${cx} ${cy + 5} Z"/>
        <path class="mouth" d="M${cx} ${cy + 5} L${cx} ${cy + 6} M${cx} ${cy + 6} Q${cx - 1.5} ${cy + 7.4} ${cx - 3} ${cy + 6.5} M${cx} ${cy + 6} Q${cx + 1.5} ${cy + 7.4} ${cx + 3} ${cy + 6.5}"/>
        <path class="whisk" d="M${cx - 3.5} ${cy + 4.6} Q${cx - 12} ${cy + 2.6} ${cx - 20} ${cy + 4} M${cx - 3.5} ${cy + 5.6} Q${cx - 12} ${cy + 5} ${cx - 19.5} ${cy + 7.5} M${cx - 3.5} ${cy + 6.4} Q${cx - 11} ${cy + 7.2} ${cx - 17.5} ${cy + 10.5} M${cx + 3.5} ${cy + 4.6} Q${cx + 12} ${cy + 2.6} ${cx + 20} ${cy + 4} M${cx + 3.5} ${cy + 5.6} Q${cx + 12} ${cy + 5} ${cx + 19.5} ${cy + 7.5} M${cx + 3.5} ${cy + 6.4} Q${cx + 11} ${cy + 7.2} ${cx + 17.5} ${cy + 10.5}"/>
      </g>`,
      face: `<g transform="rotate(${tilt} ${cx} ${cy})">
        <g class="eyes open">${eye(-4.8, 9)}${eye(4.8, -9)}</g>
        <g class="eyes shut"><path d="${lid(-4.8, 0)} ${lid(4.8, 0)}"/></g>
        <g class="eyes happy"><path d="${lid(-4.8, 1)} ${lid(4.8, 1)}"/></g>
        <path class="grin" d="M${cx - 8.5} ${cy + 3.5} Q${cx} ${cy + 13.5} ${cx + 8.5} ${cy + 3.5} Q${cx} ${cy + 8.5} ${cx - 8.5} ${cy + 3.5} Z"/>
      </g>`
    };
  }
  const POSES = {
    // sitting upright, tail laid around the front paws
    sit: (() => { const h = head(25, 17); return { w: 50, h: 64, svg:
      `<g class="body">
        <ellipse class="fur" cx="13.5" cy="52" rx="6.5" ry="9"/><ellipse class="fur" cx="36.5" cy="52" rx="6.5" ry="9"/>
        <path class="fur" d="M17 24 C13 31 11.5 41 12 49 C12.5 56 15 60.5 19 61 L31 61 C35 60.5 37.5 56 38 49 C38.5 41 37 31 33 24 Z"/>
        <path class="legline" d="M25 50 L25 61"/><path class="legline" d="M22.5 61.2 L22.5 62 M27.5 61.2 L27.5 62"/>
        <path class="fur tailf" d="M38 54 C47 56 46 63.6 34 63.6 C27 63.7 19 63.5 13.5 62.8 C20 62.2 29 62 34.5 61.2 C40 60.4 41 57.5 38 54 Z"/>
        ${h.body}</g><g class="face">${h.face}</g>` }; })(),
    // loaf, head turned a little towards you
    loaf: (() => { const h = head(19, 19, -4); return { w: 64, h: 40, svg:
      `<g class="body">
        <path class="fur" d="M9 38.5 C5 38 4.5 30 8.5 25 C13.5 19.5 25 17.5 36 17.5 C48 17.5 58 21.5 59.2 29 C60 35 57 38.5 52 38.5 Z"/>
        <path class="fur tailf" d="M57 34 C62 38 55 40.2 44 39.8 L39 39.2 C47.5 38.8 54 37.6 57 34 Z"/>
        <ellipse class="fur" cx="15" cy="38.6" rx="3.2" ry="1.4"/><ellipse class="fur" cx="23" cy="38.6" rx="3.2" ry="1.4"/>
        ${h.body}</g><g class="face">${h.face}</g>` }; })(),
    // curled up asleep, tail over the nose
    curl: (() => { const h = head(17, 26, -18); return { w: 60, h: 40, svg:
      `<g class="body">
        <path class="fur" d="M8 30 C6 18 18 9 32 9 C47 9 56 18 55 28 C54 36 46 39.5 30 39.5 C16 39.5 9 36 8 30 Z"/>
        ${h.body}
        <path class="fur tailf" d="M52 29 C50 38 36 40.4 22 38.6 C15.5 37.8 11.5 36 10.5 33.5 C16 36.4 30 37 40 35.3 C47 34.2 50.6 32.4 52 29 Z"/>
      </g><g class="face">${h.face}</g>` }; })(),
    // head and front paws over the edge of a card
    peek: (() => { const h = head(25, 20); return { w: 50, h: 34, svg:
      `<g class="body">${h.body}
        <path class="fur" d="M8.5 34 C8.5 29.6 17.5 29.6 17.5 34 Z M32.5 34 C32.5 29.6 41.5 29.6 41.5 34 Z"/>
        <path class="toe" d="M11.5 31.6 L11.5 33.6 M14.5 31.6 L14.5 33.6 M35.5 31.6 L35.5 33.6 M38.5 31.6 L38.5 33.6"/>
      </g><g class="face">${h.face}</g>` }; })()
  };

  // ---------- the cat ----------
  const cat = document.createElement('div');
  cat.className = 'cat gone';
  cat.setAttribute('role', 'img');
  cat.setAttribute('aria-label', 'A small black cat hiding somewhere in this section. Click it to pet it.');
  document.body.appendChild(cat);

  let hidden = false;
  try { hidden = localStorage.getItem('cat') === 'off'; } catch (e) {}
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'cattoggle';
  const foot = $('footer');
  if (foot) foot.appendChild(toggle);
  function setHidden(h) {
    hidden = h;
    cat.hidden = h;
    toggle.textContent = h ? 'bring the cat back' : 'hide the cat';
    try { localStorage.setItem('cat', h ? 'off' : 'on'); } catch (e) {}
  }
  toggle.addEventListener('click', () => setHidden(!hidden));
  setHidden(hidden);

  // where the cat lives in each section: anchor rect -> {x: centre, y: bottom}
  const textRect = el => { const r = document.createRange(); r.selectNodeContents(el.lastChild || el); return r.getBoundingClientRect(); };
  const SPOTS = {
    about: { pose: 'loaf', at() {
      const chips = $$('.stack li'); if (!chips.length) return null;
      const top = chips[0].getBoundingClientRect().top;
      const row1 = chips.filter(c => Math.abs(c.getBoundingClientRect().top - top) < 2);
      const r = row1[row1.length - 1].getBoundingClientRect();
      return { x: r.right - 26, y: r.top + 3 };
    } },
    experience: { pose: 'sit', at() {
      const h = $('#experience h2'); if (!h) return null;
      const r = textRect(h); return { x: r.right + 34, y: r.bottom - 4 };
    } },
    research: { pose: 'peek', at() {
      const c = $$('#research .row')[1]; if (!c) return null;
      const r = c.getBoundingClientRect(); return { x: r.right - 70, y: r.top + 3 };
    } },
    work: { pose: 'curl', at() {
      const c = $$('#work .row')[1]; if (!c) return null;
      const r = c.getBoundingClientRect(); return { x: r.left + 70, y: r.top + 4 };
    } },
    interests: { pose: 'sit', at() {
      const h = $('.langs h3'); if (!h) return null;
      const r = textRect(h); return { x: r.right + 34, y: r.bottom + 4 };
    } },
    contact: { pose: 'loaf', at() {
      const b = $$('#contact .btn'); if (!b.length) return null;
      const last = b[b.length - 1].getBoundingClientRect();
      if (last.right + 90 < document.documentElement.clientWidth) return { x: last.right + 52, y: last.bottom };
      const first = b[0].getBoundingClientRect(); return { x: first.left + 34, y: first.top + 3 };
    } }
  };

  let spot = null, pose = null, busy = false;
  function render(p) {
    pose = p;
    const P = POSES[p];
    cat.dataset.pose = p;
    cat.style.width = P.w * S + 'px';
    cat.style.height = P.h * S + 'px';
    cat.innerHTML = `<svg viewBox="0 0 ${P.w} ${P.h}" aria-hidden="true">${DEFS}${P.svg}</svg><span class="zzz"><i>z</i><i>z</i><i>z</i></span>`;
  }
  function place() {
    if (!spot) return;
    const a = SPOTS[spot].at(); if (!a) return;
    const P = POSES[pose];
    const w = P.w * S, h = P.h * S;
    const x = Math.min(Math.max(a.x - w / 2, 4), document.documentElement.clientWidth - w - 4);
    cat.style.left = x + scrollX + 'px';
    cat.style.top = a.y - h + scrollY + 'px';
  }

  // Cheshire move: body fades, then the face; then it re-forms eyes-first elsewhere
  function goTo(next) {
    if (next === spot || busy) return;
    busy = true;
    cat.classList.add('gone');
    setTimeout(() => {
      spot = next;
      if (!next) { busy = false; return; }
      render(SPOTS[next].pose);
      cat.dataset.state = SPOTS[next].pose === 'curl' ? 'sleep' : '';
      place();
      requestAnimationFrame(() => requestAnimationFrame(() => { cat.classList.remove('gone'); busy = false; check(); }));
    }, reduce ? 0 : 850);
  }

  const sections = $$('.wrap > section');
  function current() {
    let cur = null;
    for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * 0.45) cur = s.id;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max > 0 && scrollY >= max - 2) cur = sections[sections.length - 1].id;
    return SPOTS[cur] ? cur : null;
  }
  function check() { if (!hidden) goTo(current()); }
  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; check(); }); }, { passive: true });
  addEventListener('resize', () => { place(); });
  new ResizeObserver(() => place()).observe(document.body);
  setTimeout(check, 400);

  // ---------- reactions ----------
  // eyes follow the pointer
  addEventListener('pointermove', e => {
    if (!spot) return;
    const r = cat.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .4);
    const d = Math.hypot(dx, dy) || 1;
    cat.style.setProperty('--px', (dx / d * 1.1).toFixed(2));
    cat.style.setProperty('--py', (dy / d * .8).toFixed(2));
  }, { passive: true });

  function float(chars, cls) {
    const r = cat.getBoundingClientRect();
    chars.forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'catfloat ' + cls;
      s.textContent = ch;
      s.style.left = r.left + r.width / 2 + (i - (chars.length - 1) / 2) * 13 + scrollX + 'px';
      s.style.top = r.top + scrollY + 4 + 'px';
      s.style.animationDelay = i * .14 + 's';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1700);
    });
  }
  function flag(name, ms) { cat.classList.add(name); setTimeout(() => cat.classList.remove(name), ms); }

  // petting
  cat.addEventListener('click', () => {
    if (cat.dataset.state === 'sleep') { wake(); return; }
    flag('happy', 1400);
    float(['♥', '♥', '♥'], 'heart');
  });
  // Cheshire: hover long enough and only the grin is left
  let grinT = 0;
  cat.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') grinT = setTimeout(() => cat.classList.add('grin'), 650); });
  cat.addEventListener('pointerleave', () => { clearTimeout(grinT); cat.classList.remove('grin'); });

  // about: perks up at the skills
  $$('.stack li').forEach(li => li.addEventListener('pointerenter', () => { if (spot === 'about') flag('perk', 500); }));
  $$('.stack li').forEach(li => li.addEventListener('click', () => { if (spot === 'about') flag('happy', 900); }));

  // experience: ears up when you look at a role
  const expRows = $$('#experience .row');
  expRows.forEach((row, i) => row.addEventListener('pointerenter', () => {
    if (spot !== 'experience') return;
    flag('perk', 500);
  }));

  // research: ducks behind the paper when you come close, then peeks again
  let duckT = 0;
  addEventListener('pointermove', e => {
    if (spot !== 'research') return;
    const r = cat.getBoundingClientRect();
    const near = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 110;
    if (near && !cat.classList.contains('duck')) {
      cat.classList.add('duck');
      clearTimeout(duckT);
      duckT = setTimeout(() => cat.classList.remove('duck'), 1800);
    }
  }, { passive: true });

  // work: asleep on a card; hovering that card wakes it up
  let sleepT = 0;
  function wake() {
    if (spot !== 'work') return;
    cat.dataset.state = '';
    flag('perk', 500);
    clearTimeout(sleepT);
    sleepT = setTimeout(() => { if (spot === 'work') cat.dataset.state = 'sleep'; }, 2600);
  }
  const bed = $$('#work .row')[1];
  if (bed) bed.addEventListener('pointerenter', wake);

  // interests: perks up at the languages, music notes from the violin
  $$('.lang').forEach(b => {
    const perk1 = () => { if (spot === 'interests') flag('perk', 500); };
    b.addEventListener('pointerenter', perk1);
    b.addEventListener('focus', perk1);
  });
  const violin = $$('#interests .int')[0];
  if (violin) violin.addEventListener('pointerenter', () => { if (spot === 'interests') float(['♪', '♫', '♪'], 'note'); });

  // contact
  const mail = $('#contact .btn.main');
  if (mail) mail.addEventListener('pointerenter', () => { if (spot === 'contact') flag('happy', 1100); });
  const copy = $('#copymail');
  if (copy) copy.addEventListener('click', () => { if (spot === 'contact') flag('happy', 1300); });
})();
