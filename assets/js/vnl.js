/* ============================================================
   VNL 2025 — interactive figures
   Vanilla JS + SVG, no chart library. Data is embedded in the
   page as <script type="application/json" id="vnl-data">, so
   the charts work even opened straight from disk.
   ============================================================ */
(function () {
  var el = document.getElementById('vnl-data');
  if (!el) return;
  var DATA = JSON.parse(el.textContent);

  var C = { accent: '#5EE6A8', warn: '#F5A524', blue: '#7FB2F0',
            text: '#E8EAED', muted: '#A0A8B4', dim: '#6C7684',
            line: '#262C35', ink: '#0B0D10' };
  var NS = 'http://www.w3.org/2000/svg';

  function svg(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function sd(a) {
    if (a.length < 2) return 0;
    var m = a.reduce(function (x, y) { return x + y; }, 0) / a.length;
    return Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (a.length - 1));
  }
  // deterministic jitter so dots do not jump on redraw
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

  /* ---------------------------------------------------------
     1. THRESHOLD EXPLORER
     Drag the minimum-attacks slider and watch the spread
     collapse. This is the small-sample argument, felt.
     --------------------------------------------------------- */
  (function () {
    var host = document.getElementById('vnl-threshold');
    if (!host) return;
    var pts = DATA.players.filter(function (p) { return p.atk_n && p.atk != null; });
    var W = 860, H = 260, ML = 46, MR = 20, MT = 16, MB = 40;
    var box = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'vnl-svg', role: 'img',
                           'aria-label': 'Attack efficiency for every player, filtered by minimum attacks' });
    host.querySelector('.vnl-plot').appendChild(box);

    var x = function (v) { return ML + (v + 1) / 2 * (W - ML - MR); };

    function draw(min) {
      clear(box);
      // axis
      box.appendChild(svg('line', { x1: ML, x2: W - MR, y1: H - MB, y2: H - MB, stroke: C.line }));
      [-1, -0.5, 0, 0.5, 1].forEach(function (t) {
        box.appendChild(svg('line', { x1: x(t), x2: x(t), y1: MT, y2: H - MB, stroke: C.line, 'stroke-dasharray': t === 0 ? '' : '2 4' }));
        var lb = svg('text', { x: x(t), y: H - MB + 18, fill: C.dim, 'font-size': 11, 'text-anchor': 'middle' });
        lb.textContent = t.toFixed(1); box.appendChild(lb);
      });
      var ax = svg('text', { x: (ML + W - MR) / 2, y: H - 6, fill: C.muted, 'font-size': 12, 'text-anchor': 'middle' });
      ax.textContent = 'Attack efficiency'; box.appendChild(ax);

      var kept = [];
      pts.forEach(function (p) {
        var inc = p.atk_n >= min;
        if (inc) kept.push(p.atk);
        var cy = MT + 12 + (hash(p.name + p.team) % (H - MB - MT - 24));
        var c = svg('circle', { cx: x(Math.max(-1, Math.min(1, p.atk))), cy: cy, r: inc ? 3.4 : 2.2,
                                fill: inc ? C.accent : '#2A3038', opacity: inc ? 0.75 : 0.5 });
        var t = svg('title'); t.textContent = p.name + ' (' + p.team + ') · ' + p.atk_n + ' attacks · ' + (p.atk * 100).toFixed(1) + '%';
        c.appendChild(t); box.appendChild(c);
      });

      host.querySelector('[data-k=n]').textContent = kept.length;
      host.querySelector('[data-k=sd]').textContent = kept.length > 1 ? sd(kept).toFixed(3) : '--';
      host.querySelector('[data-k=rng]').textContent = kept.length
        ? Math.min.apply(null, kept).toFixed(2) + ' to ' + Math.max.apply(null, kept).toFixed(2) : '--';
      host.querySelector('[data-k=min]').textContent = min;
    }

    var slider = host.querySelector('input[type=range]');
    slider.addEventListener('input', function () { draw(+slider.value); });
    draw(+slider.value);
  })();

  /* ---------------------------------------------------------
     2. CIRCULARITY TOGGLE
     Switch between the original correlations and the honest
     ones. The dots move; Attack Points crosses zero.
     --------------------------------------------------------- */
  (function () {
    var host = document.getElementById('vnl-circular');
    if (!host) return;
    var rows = DATA.loo.slice().sort(function (a, b) { return b.circular - a.circular; });
    var W = 860, ML = 168, MR = 26, MT = 26, RH = 34;
    var H = MT + rows.length * RH + 34;
    var box = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'vnl-svg', role: 'img',
                           'aria-label': 'Correlation of each stat with player score, before and after removing it' });
    host.querySelector('.vnl-plot').appendChild(box);
    var x = function (v) { return ML + (v + 0.4) / 1.4 * (W - ML - MR); };
    var mode = 'circular';

    function draw() {
      clear(box);
      [-0.4, 0, 0.4, 0.8].forEach(function (t) {
        box.appendChild(svg('line', { x1: x(t), x2: x(t), y1: MT - 8, y2: H - 30,
                                      stroke: t === 0 ? '#3A434F' : C.line }));
        var lb = svg('text', { x: x(t), y: H - 12, fill: C.dim, 'font-size': 11, 'text-anchor': 'middle' });
        lb.textContent = t; box.appendChild(lb);
      });
      rows.forEach(function (r, i) {
        var y = MT + i * RH + 8;
        var lab = svg('text', { x: ML - 12, y: y + 4, fill: C.muted, 'font-size': 12, 'text-anchor': 'end' });
        lab.textContent = r.stat; box.appendChild(lab);
        var ghost = mode === 'circular' ? r.loo : r.circular;
        box.appendChild(svg('line', { x1: x(r.circular), x2: x(r.loo), y1: y, y2: y, stroke: '#2A3038', 'stroke-width': 2 }));
        box.appendChild(svg('circle', { cx: x(ghost), cy: y, r: 4, fill: 'none', stroke: '#3A434F' }));
        var v = mode === 'circular' ? r.circular : r.loo;
        var dot = svg('circle', { cx: x(v), cy: y, r: 6.5, fill: mode === 'circular' ? C.warn : C.accent });
        dot.style.transition = 'cx .45s cubic-bezier(.4,0,.2,1), fill .45s';
        box.appendChild(dot);
        var val = svg('text', { x: x(v) + 13, y: y + 4, fill: C.text, 'font-size': 11 });
        val.textContent = v.toFixed(2); box.appendChild(val);
      });
    }
    host.querySelectorAll('button[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.dataset.mode;
        host.querySelectorAll('button[data-mode]').forEach(function (o) { o.classList.toggle('on', o === b); });
        host.querySelector('[data-k=note]').textContent = mode === 'circular'
          ? 'Each stat scored against a total that already contains it. Attack Points looks like the biggest driver at 0.73.'
          : 'Each stat scored against a total rebuilt without it. Attack Points falls to -0.07. Spike Digs holds at 0.70.';
        draw();
      });
    });
    draw();
  })();

  /* ---------------------------------------------------------
     3. PLAYER EXPLORER
     Attacking against reception, by role. The point is that
     there is no relationship, so one score cannot rank both.
     --------------------------------------------------------- */
  (function () {
    var host = document.getElementById('vnl-explorer');
    if (!host) return;
    var all = DATA.players.filter(function (p) { return p.atk != null && p.rcv != null && p.atk_n >= 50; });
    var W = 860, H = 420, ML = 56, MR = 20, MT = 18, MB = 46;
    var box = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'vnl-svg', role: 'img',
                           'aria-label': 'Attack efficiency against reception efficiency for every qualified player' });
    host.querySelector('.vnl-plot').appendChild(box);
    var tip = host.querySelector('.vnl-tip');
    var x = function (v) { return ML + (v - 0) / 0.7 * (W - ML - MR); };
    var y = function (v) { return H - MB - (v - 0) / 0.6 * (H - MT - MB); };
    var COL = { Attacker: C.accent, Setter: C.warn, Libero: C.blue };
    var filter = 'All';

    function draw() {
      clear(box);
      [0, 0.2, 0.4, 0.6].forEach(function (t) {
        box.appendChild(svg('line', { x1: x(t), x2: x(t), y1: MT, y2: H - MB, stroke: C.line }));
        var l = svg('text', { x: x(t), y: H - MB + 18, fill: C.dim, 'font-size': 11, 'text-anchor': 'middle' });
        l.textContent = (t * 100) + '%'; box.appendChild(l);
      });
      [0, 0.2, 0.4, 0.6].forEach(function (t) {
        box.appendChild(svg('line', { x1: ML, x2: W - MR, y1: y(t), y2: y(t), stroke: C.line }));
        var l = svg('text', { x: ML - 10, y: y(t) + 4, fill: C.dim, 'font-size': 11, 'text-anchor': 'end' });
        l.textContent = (t * 100) + '%'; box.appendChild(l);
      });
      var xa = svg('text', { x: (ML + W - MR) / 2, y: H - 8, fill: C.muted, 'font-size': 12, 'text-anchor': 'middle' });
      xa.textContent = 'Attack efficiency'; box.appendChild(xa);
      var ya = svg('text', { x: 16, y: (MT + H - MB) / 2, fill: C.muted, 'font-size': 12, 'text-anchor': 'middle',
                             transform: 'rotate(-90 16 ' + (MT + H - MB) / 2 + ')' });
      ya.textContent = 'Reception efficiency'; box.appendChild(ya);

      all.forEach(function (p) {
        var on = filter === 'All' || p.role === filter;
        var c = svg('circle', { cx: x(p.atk), cy: y(p.rcv), r: on ? 5 : 3,
                                fill: on ? COL[p.role] : '#232931', opacity: on ? 0.85 : 0.4,
                                style: 'cursor:pointer' });
        c.addEventListener('mouseenter', function () {
          tip.hidden = false;
          tip.innerHTML = '<strong>' + p.name + '</strong> · ' + p.team + ' · ' + p.role +
            '<br>attack ' + (p.atk * 100).toFixed(1) + '% on ' + p.atk_n + ' swings' +
            '<br>reception ' + (p.rcv * 100).toFixed(1) + '%';
        });
        c.addEventListener('mouseleave', function () { tip.hidden = true; });
        box.appendChild(c);
      });
    }
    host.querySelectorAll('button[data-role]').forEach(function (b) {
      b.addEventListener('click', function () {
        filter = b.dataset.role;
        host.querySelectorAll('button[data-role]').forEach(function (o) { o.classList.toggle('on', o === b); });
        draw();
      });
    });
    draw();
  })();
})();
