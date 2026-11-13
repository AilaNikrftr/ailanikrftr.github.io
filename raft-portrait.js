(() => {
  /* =====================================================================
     My portrait, drawn by a live Raft cluster's network traffic.
     - ~2,000 nodes sit on the photo, each wired to its nearest neighbours.
       Those wires are the network, and they are what draws the picture:
       brighter parts of the photo get brighter wires.
     - 7 of the nodes are the voting servers (S1–S7). They hold elections and
       a leader needs 4 of 7 votes. Everyone else is a learner: it receives
       the log but never votes (how etcd and Consul add replicas).
     - Every message is routed hop by hop across the wires. Each heartbeat the
       leader's AppendEntries ripple out through the whole network and the
       replies come back, so the drawing never stops moving.
     - A client writes the portrait into the log, one band per entry. A node
       only draws its wires once that entry is committed on it.
     - Crash nodes and traffic routes around them. Cut the network and the
       side without 4 servers falls behind and its wires go pink.
     ===================================================================== */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.getElementById('hero'), ctx = cv.getContext('2d');
  const $ = id => document.getElementById(id);
  const DPR = Math.min(2, devicePixelRatio || 1);

  const NODES = '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';
  const VOTERS = 7, MAJ = 4;    // voting servers and the majority they need
  const BANDS = 30;             // the portrait is written as 30 log entries, top to bottom
  const HEARTBEAT = 650, FAST = 320;    // ms between AppendEntries rounds (idle / catching up)
  const MS_PER_PX = 1.35;       // how fast messages cross the wires
  const BATCH = 6;              // max entries per AppendEntries
  const ET_MIN = 2600, ET_MAX = 5000;   // election timeout (well above a network round trip)
  const BEHIND = 1500, NO_CONTACT = 3000;

  let W = 0, H = 0, S = 7, now = 0;
  const ASPECT = 0.7828, AREA = 0.681;   // shape of the portrait box, and how much of it the portrait fills
  let nodes = [], links = [], voters = [];
  let pulses = [], part = null, draft = null, tool = 'crash', brushing = false;
  let notes = [], lastNote = 0, preVote = true;
  const goals = { crashLeader: false, reelect: false, leaderMinority: false, twoLeaders: false, stepDown: false, noQuorum: false };
  const client = { band: [], writeAt: 0, pingAt: 0, retried: 0 };
  const et = () => ET_MIN + Math.random() * (ET_MAX - ET_MIN);
  const lastIdx = n => n.log.length - 1, lastTerm = n => n.log[n.log.length - 1].t;

  /* ---------------- min-heap for timed events ---------------- */
  const heap = [];
  function hpush(e) { heap.push(e); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p].t <= heap[i].t) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } }
  function hpop() { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l].t < heap[m].t) m = l; if (r < heap.length && heap[r].t < heap[m].t) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; }

  function size() {
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* ---------------- the network ---------------- */
  function build() {
    // node positions and brightness were computed once from my photo; only these numbers ship, never the photo
    const raw = atob(NODES), u8 = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
    const dv = new DataView(u8.buffer), count = u8.length / 6;
    const ih = H * 0.98, iw = ih * ASPECT, ox = (W - iw) / 2, oy = H - ih;
    S = Math.max(4, Math.sqrt(iw * ih * AREA / count));
    nodes = [];
    let top = Infinity, bot = -Infinity;
    for (let i = 0; i < count; i++) {
      const x = ox + dv.getUint16(i * 6, true) / 65535 * iw, y = oy + dv.getUint16(i * 6 + 2, true) / 65535 * ih, b = dv.getUint16(i * 6 + 4, true) / 65535;
      nodes.push({ id: i, hx: x, hy: y, x, y, b, ang: Math.random() * 6.283, voter: 0, adj: [], band: 0 });
      if (y < top) top = y; if (y > bot) bot = y;
    }
    for (const n of nodes) n.band = Math.min(BANDS - 1, Math.floor((n.hy - top) / (bot - top + 1) * BANDS));
    const cw = W, chh = H;
    const cell = S * 2.4, g = new Map();
    for (const n of nodes) { const k = ((n.x / cell) | 0) + ',' + ((n.y / cell) | 0); (g.get(k) || g.set(k, []).get(k)).push(n); }
    const seen = new Set(); links = [];
    for (const a of nodes) {
      const cx = (a.x / cell) | 0, cy = (a.y / cell) | 0, near = [];
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const m of g.get((cx + i) + ',' + (cy + j)) || []) {
        if (m === a) continue; const dd = (m.x - a.x) ** 2 + (m.y - a.y) ** 2; if (dd < cell * cell) near.push([dd, m]);
      }
      near.sort((p, q) => p[0] - q[0]);
      for (const [dd, m] of near.slice(0, 4)) {
        const id = a.id < m.id ? a.id + '-' + m.id : m.id + '-' + a.id;
        if (seen.has(id)) continue; seen.add(id);
        const L = { a, b: m, len: Math.sqrt(dd), w: Math.pow((a.b + m.b) / 2, 2.1), heat: 0 };
        links.push(L); a.adj.push([m, L]); m.adj.push([a, L]);
      }
    }
    const spots = [[.5, .1], [.2, .3], [.8, .3], [.18, .62], [.82, .62], [.35, .88], [.65, .88]];
    voters = spots.map(([fx, fy], i) => {
      let best = null, bd = 1e12;
      for (const n of nodes) { if (n.voter || n.adj.length < 2) continue; const dd = (n.hx - fx * cw) ** 2 + (n.hy - fy * chh) ** 2; if (dd < bd) { bd = dd; best = n; } }
      best.voter = i + 1; return best;
    });
  }

  const side = n => !part ? 0 : Math.sign((part.q[0] - part.p[0]) * (n.hy - part.p[1]) - (part.q[1] - part.p[1]) * (n.hx - part.p[0]));
  const usable = L => !L.a.down && !L.b.down && (!part || side(L.a) === side(L.b));

  // route from a node across live, uncut wires: arrival time and the wire used to reach each node.
  // wire costs get a little random jitter each time, so successive rounds take different paths.
  function route(src) {
    const t = new Float64Array(nodes.length).fill(Infinity), via = new Array(nodes.length), from = new Int32Array(nodes.length).fill(-1);
    const h = [[0, src.id]]; t[src.id] = 0;
    const push = e => { h.push(e); let i = h.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (h[p][0] <= h[i][0]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; } };
    const pop = () => { const top = h[0], last = h.pop(); if (h.length) { h[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < h.length && h[l][0] < h[m][0]) m = l; if (r < h.length && h[r][0] < h[m][0]) m = r; if (m === i) break; [h[m], h[i]] = [h[i], h[m]]; i = m; } } return top; };
    while (h.length) {
      const [tt, id] = pop(); if (tt > t[id]) continue;
      for (const [m, L] of nodes[id].adj) {
        if (!usable(L)) continue;
        const nt = tt + L.len * MS_PER_PX * (0.7 + Math.random() * 0.6);
        if (nt < t[m.id]) { t[m.id] = nt; via[m.id] = L; from[m.id] = id; push([nt, m.id]); }
      }
    }
    return { t, via, from };
  }
  // animate a message along the wires from src to dst using a route computed from src
  function trace(r, dst, t0, kind, back) {
    let id = dst.id;
    while (r.from[id] >= 0) {
      const p = r.from[id], L = r.via[id];
      if (back) pulses.push({ L, from: nodes[id], to: nodes[p], t0: t0 + r.t[dst.id] - r.t[id], t1: t0 + r.t[dst.id] - r.t[p], kind });
      else pulses.push({ L, from: nodes[p], to: nodes[id], t0: t0 + r.t[p], t1: t0 + r.t[id], kind });
      id = p;
    }
  }

  /* ---------------- Raft ---------------- */
  function reset() {
    now = performance.now();
    heap.length = 0; pulses = []; part = null; draft = null; notes = [];
    for (const n of nodes) Object.assign(n, { role: 'F', term: 0, voted: -1, log: [{ t: 0, d: -2 }], commit: 0, mask: 0, votes: 0, down: false,
      left: et(), lastHeard: now - ET_MIN, behind: 0, out: 0, nextI: null, matchI: null, lastSend: 0, dirty: false, lastCommitAt: now, flash: 0, x: n.hx, y: n.hy });
    for (const L of links) L.heat = 0;
    voters[Math.random() * VOTERS | 0].left = 500;
    client.band = Array.from({ length: BANDS }, () => ({ st: 0, at: 0 }));
    Object.assign(client, { writeAt: 0, pingAt: 0, retried: 0 });
    note(`7 voting servers and ${nodes.length - 7} learners booted. no leader yet`, true);
  }
  function note(s, force) { if (!force && now - lastNote < 500) return; lastNote = now; notes.unshift(s); notes = notes.slice(0, 3); }

  function stepDown(n, term) {
    if (term > n.term) { n.term = term; n.voted = -1; }
    if (n.role === 'L') { note(`S${n.voter} saw a newer term (${term}) and stepped down as leader`, true); if (!part && goals.twoLeaders) goals.stepDown = true; }
    if (n.role !== 'F') { n.role = 'F'; n.left = et(); }
  }
  function startElection(c) {
    c.role = 'C'; c.term++; c.voted = c.id; c.votes = 1; c.left = et();
    note(`term ${c.term} · S${c.voter} timed out and is asking the other servers for votes`);
    const r = route(c), li = lastIdx(c), lt = lastTerm(c);
    for (const v of voters) {
      if (v === c || !isFinite(r.t[v.id])) continue;      // unreachable: the vote request is lost
      trace(r, v, now, 'rv', false);
      hpush({ t: now + r.t[v.id], kind: 'RV', to: v, from: c, term: c.term, li, lt, rt: r.t[v.id], r });
    }
  }
  // PreVote: before bumping its term, a server asks whether it COULD win. others say no if they've
  // heard from a working leader recently, so a cut-off server can't inflate its term and disrupt
  // the cluster when the network heals. (etcd and other production Raft systems do this.)
  function startPreVote(c) {
    c.role = 'P'; c.pv = 1; c.left = et();
    note(`S${c.voter} hasn't heard from a leader. pre-vote: could it win term ${c.term + 1}?`);
    const r = route(c), li = lastIdx(c), lt = lastTerm(c);
    for (const v of voters) {
      if (v === c || !isFinite(r.t[v.id])) continue;
      trace(r, v, now, 'pv', false);
      hpush({ t: now + r.t[v.id], kind: 'PV', to: v, from: c, term: c.term + 1, li, lt, rt: r.t[v.id], r });
    }
  }
  function becomeLeader(c) {
    c.role = 'L';
    c.nextI = new Int32Array(nodes.length).fill(c.log.length);
    c.matchI = new Int32Array(nodes.length); c.matchI[c.id] = lastIdx(c);
    c.lastSend = 0; c.dirty = true; c.lastCommitAt = now;
    note(`term ${c.term} · S${c.voter} won ${c.votes} of 7 votes and is the leader`, true);
    if (goals.crashLeader) goals.reelect = true;
  }
  function applyTo(n, c) {
    for (let i = n.commit + 1; i <= c; i++) { const d = n.log[i].d; if (d >= 0) n.mask |= (1 << d); }
    if (c > n.commit) n.commit = c;
  }
  // a reply travels back along the same path it came in on
  function reply(e, m) { if (!e.to.down) hpush(Object.assign(m, { t: now + e.rt, to: e.from, from: e.to })); }

  function deliver(e) {
    const n = e.to;
    if (n.down) return;
    if (part && side(n) !== side(e.from)) return;          // the path was cut while the message was in flight
    if (e.kind === 'PV') {
      // a pre-vote changes nothing on the voter; it only answers "would I vote for you?"
      const ok = e.lt > lastTerm(n) || (e.lt === lastTerm(n) && e.li >= lastIdx(n));
      const heardLeader = n.role === 'L' || now - n.lastHeard < ET_MIN;
      trace(e.r, n, now - e.rt, 'pvr', true);
      reply(e, { kind: 'PVR', term: n.term, pvTerm: e.term, grant: ok && !heardLeader && e.term > n.term });
      return;
    }
    if (e.kind === 'PVR') {
      if (e.term > n.term) { stepDown(n, e.term); return; }
      if (n.role === 'P' && e.pvTerm === n.term + 1 && e.grant && ++n.pv >= MAJ) startElection(n);
      return;
    }
    if (e.kind === 'RV') {
      if (e.term > n.term) stepDown(n, e.term);
      const ok = e.lt > lastTerm(n) || (e.lt === lastTerm(n) && e.li >= lastIdx(n));
      let grant = false;
      if (e.term === n.term && (n.voted === -1 || n.voted === e.from.id) && ok) { grant = true; n.voted = e.from.id; n.left = et(); n.flash = now; }
      trace(e.r, n, now - e.rt, 'rvr', true);
      reply(e, { kind: 'RVR', term: n.term, grant });
    } else if (e.kind === 'RVR') {
      if (e.term > n.term) { stepDown(n, e.term); return; }
      if (n.role === 'C' && e.term === n.term && e.grant && ++n.votes >= MAJ) becomeLeader(n);
    } else if (e.kind === 'AE') {
      if (e.term < n.term) { reply(e, { kind: 'AER', term: n.term, ok: false, hint: 0 }); return; }
      stepDown(n, e.term);
      n.left = et(); n.lastHeard = now;
      if (e.pi > lastIdx(n) || n.log[e.pi].t !== e.pt) {
        let hint = Math.min(n.log.length, e.pi);
        if (e.pi <= lastIdx(n)) { const ct = n.log[e.pi].t; hint = e.pi; while (hint > 1 && n.log[hint - 1].t === ct) hint--; }
        reply(e, { kind: 'AER', term: n.term, ok: false, hint }); return;
      }
      for (let j = 0; j < e.es.length; j++) {
        const idx = e.pi + 1 + j;
        if (idx <= lastIdx(n)) { if (n.log[idx].t !== e.es[j].t) { n.log.length = idx; n.log.push(e.es[j]); } }
        else n.log.push(e.es[j]);
      }
      const last = e.pi + e.es.length;
      if (e.lc > n.commit) applyTo(n, Math.min(e.lc, last));
      reply(e, { kind: 'AER', term: n.term, ok: true, mi: last });
    } else if (e.kind === 'AER') {
      if (e.term > n.term) { stepDown(n, e.term); return; }
      if (n.role !== 'L' || e.term !== n.term) return;
      const i = e.from.id;
      if (e.ok) { if (e.mi > n.matchI[i]) n.matchI[i] = e.mi; n.nextI[i] = n.matchI[i] + 1; n.commitDirty = true; }
      else n.nextI[i] = Math.max(1, e.hint || n.nextI[i] - 1);
    }
  }
  // commit what a majority of the 7 servers has stored, but only directly for entries from this term
  function advanceCommit(L) {
    L.commitDirty = false; L.matchI[L.id] = lastIdx(L);
    const N = voters.map(v => L.matchI[v.id]).sort((a, b) => b - a)[MAJ - 1];
    if (N > L.commit && L.log[N].t === L.term) {
      for (let i = L.commit + 1; i <= N; i++) { const d = L.log[i].d; if (d >= 0) client.band[d].st = 2; }
      applyTo(L, N); L.lastCommitAt = now; L.dirty = true;
    }
  }
  // one AppendEntries round: a message to every reachable node, routed across the wires
  function leaderRound(L) {
    L.lastSend = now; L.dirty = false;
    const r = route(L);
    for (const n of nodes) {
      if (n === L) continue;
      const rt = r.t[n.id]; if (!isFinite(rt)) continue;
      const ni = L.nextI[n.id], pi = ni - 1, es = L.log.slice(ni, ni + BATCH);
      if (es.length) L.dirty = true;
      hpush({ t: now + rt, kind: 'AE', to: n, from: L, term: L.term, pi, pt: L.log[pi].t, es, lc: L.commit, rt });
      // the wave out along the wire into this node, and its reply's first hop back
      const L2 = r.via[n.id], p = nodes[r.from[n.id]];
      pulses.push({ L: L2, from: p, to: n, t0: now + r.t[p.id], t1: now + rt, kind: 'ae' });
      pulses.push({ L: L2, from: n, to: p, t0: now + rt, t1: now + rt + (rt - r.t[p.id]), kind: 'aer' });
    }
  }
  function clientTick() {
    let L = null;
    for (const v of voters) if (v.role === 'L' && !v.down && (!L || v.term > L.term)) L = v;
    if (!L || now < client.writeAt) return;
    const b = client.band.findIndex(x => x.st === 0 || (x.st === 1 && now - x.at > 3500));
    if (b >= 0) { if (client.band[b].st === 1) client.retried++; L.log.push({ t: L.term, d: b }); client.band[b] = { st: 1, at: now }; L.dirty = true; client.writeAt = now + 140; }
    else if (now > client.pingAt) { L.log.push({ t: L.term, d: -1 }); L.dirty = true; client.pingAt = now + 1200; }
  }

  function step(dt) {
    for (const v of voters) {
      if (v.down) continue;
      if (v.role === 'L') { v.lastHeard = now; if (v.commitDirty) advanceCommit(v); if (now - v.lastSend >= (v.dirty ? FAST : HEARTBEAT)) leaderRound(v); continue; }
      v.left -= dt; if (v.left <= 0) (preVote ? startPreVote(v) : startElection(v));
    }
    clientTick();
    while (heap.length && heap[0].t <= now) deliver(hpop());
    // pulses heat the wires they cross
    const keep = [];
    for (const p of pulses) { if (now >= p.t1) { p.L.heat = Math.min(1, p.L.heat + (p.kind === 'ae' ? 0.5 : 0.2)); continue; } keep.push(p); }
    pulses = keep;
    const decay = Math.exp(-dt / 2200);
    for (const L of links) L.heat *= decay;
    // out of touch: copy of the committed log is behind, or no leader heard from in a while
    let best = 0; for (const n of nodes) if (!n.down && n.commit > best) best = n.commit;
    for (const n of nodes) {
      if (n.down || n.role === 'L') { n.out = 0; continue; }
      if (n.commit < best) { if (!n.behind) n.behind = now; } else n.behind = 0;
      n.out = Math.max(0, n.behind ? now - n.behind - BEHIND : -1, now - n.lastHeard - NO_CONTACT);
      const off = Math.min(1, n.out / 2500);
      if (off > 0 && !reduce) n.ang += 0.03;
      const tx = n.hx + Math.cos(n.ang) * off * S * 1.6, ty = n.hy + Math.sin(n.ang * 1.3) * off * S * 1.6;
      n.x += (tx - n.x) * 0.12; n.y += (ty - n.y) * 0.12;
    }
    goalsTick(); hud();
  }

  /* ---------------- goals and readout ---------------- */
  const GOALS = [
    ['crashLeader', 'crash the leader'],
    ['reelect', 'watch a new leader get elected'],
    ['leaderMinority', 'cut the network so the leader ends up with fewer than 4 servers'],
    ['twoLeaders', 'see two leaders at once (only the newer one can commit)'],
    ['stepDown', 'heal the cut and watch the old leader step down'],
    ['noQuorum', 'crash 4 of the 7 servers and freeze the cluster']
  ];
  function goalsTick() {
    const leaders = voters.filter(v => v.role === 'L' && !v.down);
    if (leaders.length >= 2) goals.twoLeaders = true;
    if (part) for (const L of leaders) if (voters.filter(v => !v.down && side(v) === side(L)).length < MAJ) goals.leaderMinority = true;
    if (voters.filter(v => !v.down).length < MAJ) goals.noQuorum = true;
  }
  let hudAt = 0;
  function hud() {
    if (now - hudAt < 150) return; hudAt = now;
    const leaders = voters.filter(v => v.role === 'L' && !v.down).sort((a, b) => b.term - a.term), L = leaders[0];
    let lead = L ? `leader <span>S${L.voter}</span> (term ${L.term})` : `<span class="bad">no leader · writes are rejected</span>`;
    if (leaders.length > 1) lead += ` · <span class="bad">stale leader S${leaders[1].voter} (term ${leaders[1].term}) can't reach a majority</span>`;
    let alive = 0, out = 0; for (const n of nodes) if (!n.down) { alive++; if (n.out > 0) out++; }
    const vUp = voters.filter(v => !v.down).length, done = client.band.filter(b => b.st === 2).length;
    let l3 = `servers up <span class="${vUp < MAJ ? 'bad' : ''}">${vUp}/7</span> (majority is 4) · nodes up <span>${alive}/${nodes.length}</span> · out of touch <span class="${out ? 'bad' : ''}">${out}</span>`;
    if (part) { let a = 0, b = 0; for (const v of voters) if (!v.down) (side(v) > 0 ? a++ : b++); l3 += ` · cut splits servers <span>${Math.max(a, b)}</span> | <span>${Math.min(a, b)}</span>`; }
    $('stats').innerHTML = `${lead}<br>portrait committed <span>${done}/${BANDS}</span> entries · commit index <span>${L ? L.commit : '–'}</span> · client retries <span>${client.retried}</span><br>${l3}`;
    $('events').innerHTML = notes.map(e => `<div>${e}</div>`).join('');
    const got = GOALS.filter(([k]) => goals[k]).length;
    $('goals').innerHTML = `<div class="gh">try it · ${got}/${GOALS.length}</div>` + GOALS.map(([k, t]) => `<div class="${goals[k] ? 'ok' : ''}">${goals[k] ? '✓' : '○'} ${t}</div>`).join('');
  }

  /* ---------------- drawing ---------------- */
  const shown = n => !n.down && ((n.mask >> n.band) & 1);
  function draw() {
    ctx.clearRect(0, 0, W, H);
    // wires: drawn only between nodes that have committed their piece; brightness = photo x recent traffic
    const B = 8, white = Array.from({ length: B }, () => new Path2D()), pink = new Path2D();
    for (const L of links) {
      if (!shown(L.a) || !shown(L.b) || !usable(L)) continue;
      if (L.a.out > 0 || L.b.out > 0) { pink.moveTo(L.a.x, L.a.y); pink.lineTo(L.b.x, L.b.y); continue; }
      const a = L.w * (0.45 + 0.55 * L.heat);
      const k = Math.min(B - 1, a * B | 0); if (k < 0) continue;
      white[k].moveTo(L.a.x, L.a.y); white[k].lineTo(L.b.x, L.b.y);
    }
    ctx.lineWidth = 0.8;
    for (let k = 0; k < B; k++) { ctx.strokeStyle = `rgba(231,233,246,${0.02 + (k + 0.5) / B * 0.98})`; ctx.lineWidth = 0.55 + k * 0.1; ctx.stroke(white[k]); }
    ctx.strokeStyle = 'rgba(255,140,165,0.45)'; ctx.stroke(pink);
    // nodes that haven't got their piece yet, and crashed ones
    const dim = new Path2D(), dead = new Path2D();
    for (const n of nodes) {
      if (n.voter) continue;
      if (n.down) { dead.moveTo(n.x + 1.1, n.y); dead.arc(n.x, n.y, 1.1, 0, 6.283); }
      else if (!shown(n)) { dim.moveTo(n.x + 0.7, n.y); dim.arc(n.x, n.y, 0.7, 0, 6.283); }
    }
    ctx.fillStyle = 'rgba(142,153,191,0.35)'; ctx.fill(dim);
    ctx.fillStyle = 'rgba(255,107,138,0.5)'; ctx.fill(dead);
    // the cut
    if (part || draft) {
      const p = (part || draft).p, q = (part || draft).q, dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1, ext = (W + H) / len;
      ctx.setLineDash([6, 5]); ctx.lineWidth = 1.5; ctx.strokeStyle = part ? 'rgba(255,107,138,0.85)' : 'rgba(255,107,138,0.45)';
      ctx.beginPath(); ctx.moveTo(p[0] - dx * ext, p[1] - dy * ext); ctx.lineTo(p[0] + dx * ext, p[1] + dy * ext); ctx.stroke(); ctx.setLineDash([]);
    }
    // messages moving along the wires
    const col = { ae: 'rgba(169,139,255,0.95)', aer: 'rgba(111,211,193,0.7)', rv: 'rgba(255,107,138,0.95)', rvr: 'rgba(255,190,205,0.85)', pv: 'rgba(255,196,120,0.95)', pvr: 'rgba(255,224,170,0.8)' };
    const ps = { ae: new Path2D(), aer: new Path2D(), rv: new Path2D(), rvr: new Path2D(), pv: new Path2D(), pvr: new Path2D() };
    for (const p of pulses) {
      if (now < p.t0) continue;
      const e = Math.min(1, (now - p.t0) / Math.max(1, p.t1 - p.t0)), e0 = Math.max(0, e - 0.6);
      const path = ps[p.kind];
      path.moveTo(p.from.x + (p.to.x - p.from.x) * e0, p.from.y + (p.to.y - p.from.y) * e0);
      path.lineTo(p.from.x + (p.to.x - p.from.x) * e, p.from.y + (p.to.y - p.from.y) * e);
    }
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.6; ctx.strokeStyle = col.ae; ctx.stroke(ps.ae);
    ctx.lineWidth = 1.1; ctx.strokeStyle = col.aer; ctx.stroke(ps.aer);
    ctx.lineWidth = 2; ctx.strokeStyle = col.rv; ctx.stroke(ps.rv); ctx.strokeStyle = col.rvr; ctx.stroke(ps.rvr);
    ctx.lineWidth = 1.6; ctx.strokeStyle = col.pv; ctx.stroke(ps.pv); ctx.strokeStyle = col.pvr; ctx.stroke(ps.pvr);
    ctx.lineCap = 'butt';
    // the 7 servers
    ctx.font = '500 10px "IBM Plex Mono", monospace'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    for (const v of voters) {
      const lab = 'S' + v.voter;
      if (v.down) {
        ctx.strokeStyle = '#ff6b8a'; ctx.lineWidth = 1.6; ctx.beginPath();
        ctx.moveTo(v.x - 5, v.y - 5); ctx.lineTo(v.x + 5, v.y + 5); ctx.moveTo(v.x + 5, v.y - 5); ctx.lineTo(v.x - 5, v.y + 5); ctx.stroke();
        ctx.fillStyle = '#ff6b8a'; ctx.fillText(lab, v.x + 9, v.y); continue;
      }
      if (v.role === 'L') {
        const stuck = now - v.lastCommitAt > 2500 && v.commit < lastIdx(v);
        ctx.fillStyle = '#a98bff'; ctx.beginPath(); ctx.arc(v.x, v.y, 6, 0, 6.283); ctx.fill();
        ctx.strokeStyle = stuck ? 'rgba(255,107,138,0.9)' : 'rgba(169,139,255,0.6)'; ctx.lineWidth = 1.3;
        if (stuck) ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(v.x, v.y, 11, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#a98bff'; ctx.fillText(lab + (stuck ? ' leader · no majority' : ' leader'), v.x + 14, v.y); continue;
      }
      const c = v.role === 'C' ? '#ff6b8a' : v.role === 'P' ? '#ffc478' : v.out > 0 ? '#ff96af' : '#e7e9f6';
      ctx.fillStyle = v.role === 'C' ? c : '#0b1226'; ctx.strokeStyle = c; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(v.x, v.y, 5, 0, 6.283); ctx.fill(); ctx.stroke();
      if (now - v.flash < 400) { ctx.strokeStyle = 'rgba(111,211,193,0.9)'; ctx.beginPath(); ctx.arc(v.x, v.y, 8, 0, 6.283); ctx.stroke(); }
      ctx.fillStyle = c; ctx.fillText(lab + (v.role === 'C' ? ' candidate' : v.role === 'P' ? ' pre-vote' : ''), v.x + 9, v.y);
    }
  }

  /* ---------------- interaction ---------------- */
  const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  function nearest(p, r) { let best = null, bd = r * r; for (const n of nodes) { const d = (n.x - p[0]) ** 2 + (n.y - p[1]) ** 2 - (n.voter ? 60 : 0); if (d < bd) { bd = d; best = n; } } return best; }
  function crash(n) {
    if (n.down) return;
    if (n.role === 'L') { goals.crashLeader = true; note(`leader S${n.voter} crashed. the other servers will stop hearing heartbeats`, true); }
    else if (n.voter) note(`server S${n.voter} crashed`, true);
    n.down = true; n.role = 'F';
  }
  function restart(n) {
    // term, vote and log survive a restart (they're on disk); the commit index doesn't
    n.down = false; n.role = 'F'; n.commit = 0; n.mask = 0; n.left = et(); n.lastHeard = now;
    note(`${n.voter ? 'S' + n.voter : 'node ' + n.id} restarted. it kept its log but has to relearn what's committed`);
  }
  function setTool(t) {
    tool = t;
    for (const b of document.querySelectorAll('.tool')) b.setAttribute('aria-pressed', b.dataset.tool === t);
    $('hint').textContent = t === 'crash' ? 'click a node to crash it, or drag to crash a whole area and watch traffic route around it. click a crashed one to restart it.' : 'drag a line across the portrait to cut the network in two.';
  }
  cv.style.cursor = 'crosshair';
  cv.addEventListener('pointerdown', e => {
    const p = pt(e); cv.setPointerCapture(e.pointerId);
    if (tool === 'partition') { draft = { p, q: p }; return; }
    const n = nearest(p, 12); brushing = true;
    if (n) { if (n.down) { restart(n); brushing = false; } else crash(n); }
  });
  cv.addEventListener('pointermove', e => {
    const p = pt(e);
    if (tool === 'partition' && draft) { draft.q = p; return; }
    if (tool === 'crash' && brushing) for (const n of nodes) if (!n.down && (n.x - p[0]) ** 2 + (n.y - p[1]) ** 2 < 110) crash(n);
  });
  const up = () => {
    brushing = false;
    if (draft) { if (Math.hypot(draft.q[0] - draft.p[0], draft.q[1] - draft.p[1]) > 25) { part = draft; note('the network is cut. no message can cross the line', true); } draft = null; }
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  for (const b of document.querySelectorAll('.tool')) b.addEventListener('click', () => setTool(b.dataset.tool));
  $('heal').addEventListener('click', () => { if (part) { part = null; note('the network is healed. both sides can talk again', true); } });
  $('revive').addEventListener('click', () => { for (const n of nodes) if (n.down) restart(n); note('every crashed node restarted', true); });
  $('replay').addEventListener('click', () => reset());
  $('prevote').addEventListener('click', e => {
    preVote = !preVote; e.currentTarget.setAttribute('aria-pressed', preVote); e.currentTarget.textContent = 'pre-vote: ' + (preVote ? 'on' : 'off');
    note(preVote ? 'pre-vote is on. cut-off servers can no longer disrupt the cluster when it heals' : 'pre-vote is off. this is plain Raft: try a long cut, then heal it', true);
  });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); build(); reset(); }, 200); });

  let last = 0;
  function loop(t) {
    const dt = Math.min(50, t - (last || t)); last = t; now = t;
    if (nodes.length) { step(dt); draw(); }
    requestAnimationFrame(loop);
  }
  size(); build(); reset(); setTool('crash');
  requestAnimationFrame(loop);
})();
