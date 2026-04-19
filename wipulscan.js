/**
 * WiPulScan Pro – Spatial WiFi Signal Scanner
 * ============================================
 * Echte Messdaten via:
 *   - Network Information API (navigator.connection)
 *   - navigator.onLine
 *   - Latenz-Messung via fetch() Timing
 *   - Performance Resource Timing API
 *   - Throughput-Berechnung via fetch()
 *   - Web Audio API für WAV-Analyse
 *   - navigator.userAgent / connection
 */

'use strict';

// ══════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════
const State = {
  scanning: false,
  sessionStart: null,
  measurements: [],       // { ts, latency, downlink, rtt, effectiveType, type, online, quality, throughput }
  spatialPoints: [],      // { x, y, quality, latency, downlink, ts }
  latencyHistory: [],     // rolling 60 samples
  throughputHistory: [],  // rolling 60 samples
  scanInterval: null,
  rttInterval: null,
  sessionTimer: null,
  wavLoaded: false,
  introFinished: false,
  currentView: 'dashboard',
};

// ══════════════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════════════
const $ = id => document.getElementById(id);
const fmt = (v, unit = '') => v === null || v === undefined ? '—' : `${v}${unit}`;
const fmtMs = v => v === null ? '—' : `${Math.round(v)} ms`;
const fmtMbps = v => v === null ? '—' : `${parseFloat(v).toFixed(1)} Mbps`;
const now = () => Date.now();
const ts = () => new Date().toLocaleTimeString('de-DE', { hour12: false });

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

function qualityScore(lat, dl, effectiveType) {
  // Scoring based on real measured values
  let score = 100;
  // Latency penalty
  if (lat !== null) {
    if      (lat < 20)  score -= 0;
    else if (lat < 50)  score -= 10;
    else if (lat < 100) score -= 20;
    else if (lat < 200) score -= 35;
    else if (lat < 500) score -= 55;
    else                score -= 75;
  } else { score -= 30; }
  // Downlink penalty
  if (dl !== null) {
    if      (dl >= 10)  score -= 0;
    else if (dl >= 5)   score -= 5;
    else if (dl >= 2)   score -= 15;
    else if (dl >= 0.5) score -= 25;
    else                score -= 40;
  } else { score -= 20; }
  // Effective type penalty
  const typePenalty = { '4g': 0, '3g': 15, '2g': 35, 'slow-2g': 60 };
  score -= (typePenalty[effectiveType] ?? 0);
  return clamp(Math.round(score), 0, 100);
}

function qualityColor(score) {
  if (score >= 80) return '#00ff88';
  if (score >= 60) return '#88ff00';
  if (score >= 40) return '#ffcc00';
  if (score >= 20) return '#ff6600';
  return '#ff0044';
}

function estimateDbm(effectiveType, quality) {
  // Heuristic mapping – not hardware-based but calibrated estimate
  const base = { '4g': -55, '3g': -75, '2g': -90, 'slow-2g': -100 };
  const b = base[effectiveType] ?? -80;
  const offset = Math.round((quality - 50) / 5);
  return clamp(b + offset, -100, -30);
}

function showToast(msg, duration = 3000) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), duration);
}

function addLog(category, message) {
  const log = $('log-output');
  if (!log) return;
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.dataset.cat = category;
  entry.innerHTML = `
    <span class="log-ts">${ts()}</span>
    <span class="log-cat ${category}">[${category.toUpperCase()}]</span>
    <span class="log-msg">${message}</span>
  `;
  log.prepend(entry);
  // Keep max 500 entries
  while (log.children.length > 500) log.removeChild(log.lastChild);
}

// ══════════════════════════════════════════════════
//  INTRO SCREEN
// ══════════════════════════════════════════════════
const Intro = {
  canvas: null,
  ctx: null,
  particles: [],
  animFrame: null,
  audio: null,
  analyser: null,
  audioCtx: null,
  dataArray: null,
  audioConnected: false,

  init() {
    this.canvas = $('intro-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.spawnParticles();
    this.animate();
    this.runBootSequence();
    this.setupWavModal();
  },

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  spawnParticles() {
    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? '#00d4ff' : '#00ff88',
      });
    }
  },

  animate() {
    const { ctx, canvas } = this;
    ctx.fillStyle = 'rgba(7,11,20,0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(26,51,85,0.3)';
    ctx.lineWidth = 0.5;
    const gs = 40;
    for (let x = 0; x < canvas.width; x += gs) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gs) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Audio-reactive waveform
    if (this.audioConnected && this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      const W = canvas.width, H = canvas.height;
      const sliceW = W / this.dataArray.length;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0,212,255,0.6)';
      ctx.lineWidth = 2;
      let px = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        const v = this.dataArray[i] / 255;
        const py = H * 0.75 - v * 120;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        px += sliceW;
      }
      ctx.stroke();

      // Mirror
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0,255,136,0.3)';
      ctx.lineWidth = 1;
      px = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        const v = this.dataArray[i] / 255;
        const py = H * 0.75 + v * 60;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        px += sliceW;
      }
      ctx.stroke();
    }

    // Particles
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Scanning lines
    const t = Date.now() / 1000;
    for (let i = 0; i < 3; i++) {
      const y = ((t * 60 * (i + 1) * 0.7) % (canvas.height + 40)) - 20;
      const grad = ctx.createLinearGradient(0, y - 2, 0, y + 2);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, `rgba(0,212,255,${0.08 - i * 0.02})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - 2, canvas.width, 4);
    }

    this.animFrame = requestAnimationFrame(() => this.animate());
  },

  runBootSequence() {
    const bootLines = document.querySelectorAll('.boot-line');
    const fill    = $('intro-progress-fill');
    const label   = $('intro-progress-label');
    const delays  = [300, 700, 1200, 1700, 2300, 2900];
    const totalMs = 3800;

    // Animate progress bar
    const startT = Date.now();
    const progressAnim = setInterval(() => {
      const elapsed = Date.now() - startT;
      const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
      fill.style.width = pct + '%';
      label.textContent = pct + '%';
      if (pct >= 100) clearInterval(progressAnim);
    }, 50);

    // Show boot lines
    bootLines.forEach((line, i) => {
      setTimeout(() => line.classList.add('visible'), delays[i]);
    });

    // Show enter button
    setTimeout(() => {
      $('btn-enter').classList.remove('hidden');
    }, totalMs + 200);

    // Enter button
    $('btn-enter').addEventListener('click', () => this.enter());
  },

  enter() {
    cancelAnimationFrame(this.animFrame);
    const screen = $('intro-screen');
    screen.classList.add('fade-out');
    setTimeout(() => {
      screen.classList.add('hidden');
      $('app').classList.remove('hidden');
      State.introFinished = true;
      App.init();
    }, 800);
  },

  // WAV Modal
  setupWavModal() {
    // Show WAV modal option in intro
    const wavBtn = document.createElement('button');
    wavBtn.innerHTML = '<i class="fa-solid fa-music"></i> WAV-Datei laden';
    wavBtn.className = 'btn-sm-ghost';
    wavBtn.style.cssText = 'font-size:0.75rem;padding:0.3rem 0.8rem;background:transparent;border:1px solid rgba(0,212,255,0.3);color:rgba(0,212,255,0.6);border-radius:6px;cursor:pointer;';
    wavBtn.onclick = () => $('wav-modal').classList.remove('hidden');
    $('intro-content').appendChild(wavBtn);

    // File input handler
    $('btn-load-wav').addEventListener('click', () => {
      const file = $('wav-file-input').files[0];
      if (!file) { showToast('⚠️ Bitte zuerst eine WAV-Datei auswählen'); return; }
      this.loadWavFile(file);
      $('wav-modal').classList.add('hidden');
    });
  },

  loadWavFile(file) {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const reader = new FileReader();
      reader.onload = e => {
        this.audioCtx.decodeAudioData(e.target.result, buffer => {
          const source = this.audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
          source.start(0);
          this.audioConnected = true;
          State.wavLoaded = true;
          addLog('info', `WAV-Datei geladen: ${file.name} (${(file.size/1024).toFixed(1)} KB)`);
          showToast(`🎵 WAV geladen: ${file.name}`);
        }, err => {
          addLog('error', `WAV decode Fehler: ${err}`);
          showToast('❌ WAV-Datei konnte nicht dekodiert werden');
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      addLog('error', `Web Audio API Fehler: ${err.message}`);
      showToast('❌ Web Audio API nicht verfügbar');
    }
  }
};

// ══════════════════════════════════════════════════
//  NETWORK MEASUREMENT ENGINE
// ══════════════════════════════════════════════════
const Measure = {
  // ── Real Network Information API ──
  getConnectionInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return { available: false };
    return {
      available: true,
      type:          conn.type          || null,
      effectiveType: conn.effectiveType || null,
      downlink:      conn.downlink      || null,   // Mbps
      rtt:           conn.rtt           || null,   // ms
      saveData:      conn.saveData      || false,
    };
  },

  // ── Real Latency via fetch() timing ──
  async measureLatency() {
    const targets = [
      'https://www.google.com/generate_204',
      'https://connectivitycheck.gstatic.com/generate_204',
      'https://www.cloudflare.com/cdn-cgi/trace',
    ];
    const results = [];
    for (const url of targets) {
      try {
        const t0 = performance.now();
        await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
          signal: AbortSignal.timeout(4000),
        });
        const t1 = performance.now();
        results.push(t1 - t0);
      } catch (_) {
        // timeout or blocked – try next
      }
    }
    if (results.length === 0) return null;
    // Return minimum (best measured RTT)
    return Math.min(...results);
  },

  // ── Real Throughput via fetch() ──
  async measureThroughput() {
    // Download a small payload from a CDN and measure real speed
    const testUrls = [
      { url: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js', label: 'jsdelivr' },
      { url: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',  label: 'cdnjs'    },
    ];
    for (const { url } of testUrls) {
      try {
        const t0 = performance.now();
        const resp = await fetch(url, {
          cache: 'no-store',
          signal: AbortSignal.timeout(6000),
        });
        const buf = await resp.arrayBuffer();
        const t1  = performance.now();
        const bytes = buf.byteLength;
        const secs  = (t1 - t0) / 1000;
        const mbps  = (bytes * 8) / secs / 1e6;
        return parseFloat(mbps.toFixed(2));
      } catch (_) { /* try next */ }
    }
    return null;
  },

  // ── Performance Resource Timing ──
  getResourceTimingStats() {
    const entries = performance.getEntriesByType('navigation');
    if (!entries.length) return null;
    const nav = entries[0];
    return {
      dns:        Math.round(nav.domainLookupEnd  - nav.domainLookupStart),
      tcp:        Math.round(nav.connectEnd        - nav.connectStart),
      ttfb:       Math.round(nav.responseStart     - nav.requestStart),
      total:      Math.round(nav.loadEventEnd      - nav.startTime),
      protocol:   nav.nextHopProtocol || 'unknown',
    };
  },

  // ── Combined snapshot ──
  async snapshot() {
    const conn = this.getConnectionInfo();
    const lat  = await this.measureLatency();
    const throughput = await this.measureThroughput();
    const quality = qualityScore(
      lat,
      conn.downlink,
      conn.effectiveType
    );
    return {
      ts:           Date.now(),
      latency:      lat,
      downlink:     conn.downlink,
      rtt:          conn.rtt,
      effectiveType:conn.effectiveType,
      type:         conn.type,
      saveData:     conn.saveData,
      online:       navigator.onLine,
      quality,
      throughput,
      dbm:          estimateDbm(conn.effectiveType, quality),
      connAvailable:conn.available,
    };
  }
};

// ══════════════════════════════════════════════════
//  CHARTS
// ══════════════════════════════════════════════════
const Charts = {
  latency:    null,
  throughput: null,
  histogram:  null,
  radar:      null, // canvas-drawn

  chartDefaults: {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f1c30',
        borderColor: '#1a3355',
        borderWidth: 1,
        titleColor: '#00d4ff',
        bodyColor: '#c8e0ff',
      }
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        grid:  { color: 'rgba(26,51,85,0.5)' },
        ticks: { color: '#5a7a9a', font: { family: 'Share Tech Mono', size: 10 } }
      }
    }
  },

  init() {
    Chart.defaults.color = '#5a7a9a';

    // Latency chart
    this.latency = new Chart($('latency-chart').getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          data: [],
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0,212,255,0.07)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointBackgroundColor: '#00d4ff',
        }]
      },
      options: {
        ...this.chartDefaults,
        scales: {
          ...this.chartDefaults.scales,
          y: { ...this.chartDefaults.scales.y, title: { display: true, text: 'ms', color: '#5a7a9a' } }
        }
      }
    });

    // Throughput chart
    this.throughput = new Chart($('throughput-chart').getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          data: [],
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0,255,136,0.07)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointBackgroundColor: '#00ff88',
        }]
      },
      options: {
        ...this.chartDefaults,
        scales: {
          ...this.chartDefaults.scales,
          y: { ...this.chartDefaults.scales.y, title: { display: true, text: 'Mbps', color: '#5a7a9a' } }
        }
      }
    });

    // Histogram
    this.histogram = new Chart($('histogram-chart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['0-20', '20-50', '50-100', '100-200', '200-500', '500+'],
        datasets: [{
          label: 'Messungen',
          data: [0,0,0,0,0,0],
          backgroundColor: ['#00ff88','#88ff00','#ffcc00','#ff7700','#ff3366','#cc0033'],
          borderRadius: 4,
        }]
      },
      options: {
        ...this.chartDefaults,
        scales: {
          ...this.chartDefaults.scales,
          y: { ...this.chartDefaults.scales.y, title: { display: true, text: 'Anzahl', color: '#5a7a9a' } }
        }
      }
    });
  },

  pushLatency(val) {
    if (val === null) return;
    const ds = this.latency.data;
    ds.labels.push(ts());
    ds.datasets[0].data.push(Math.round(val));
    if (ds.labels.length > 60) { ds.labels.shift(); ds.datasets[0].data.shift(); }
    this.latency.update();
  },

  pushThroughput(val) {
    if (val === null) return;
    const ds = this.throughput.data;
    ds.labels.push(ts());
    ds.datasets[0].data.push(val);
    if (ds.labels.length > 60) { ds.labels.shift(); ds.datasets[0].data.shift(); }
    this.throughput.update();
  },

  updateHistogram() {
    const buckets = [0,0,0,0,0,0];
    for (const m of State.measurements) {
      if (m.latency === null) continue;
      const l = m.latency;
      if      (l < 20)  buckets[0]++;
      else if (l < 50)  buckets[1]++;
      else if (l < 100) buckets[2]++;
      else if (l < 200) buckets[3]++;
      else if (l < 500) buckets[4]++;
      else              buckets[5]++;
    }
    this.histogram.data.datasets[0].data = buckets;
    this.histogram.update();
  }
};

// ══════════════════════════════════════════════════
//  RADAR CANVAS
// ══════════════════════════════════════════════════
const Radar = {
  canvas: null, ctx: null,
  angle: 0,
  dots: [],
  animFrame: null,

  init() {
    this.canvas = $('radar-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.animate();
  },

  addDot(quality) {
    const r = Math.random() * (this.canvas.width / 2 - 20);
    const a = Math.random() * Math.PI * 2;
    this.dots.push({
      x: this.canvas.width  / 2 + Math.cos(a) * r,
      y: this.canvas.height / 2 + Math.sin(a) * r,
      color: qualityColor(quality),
      alpha: 1,
      r: 4,
    });
    if (this.dots.length > 30) this.dots.shift();
  },

  animate() {
    const c = this.canvas, ctx = this.ctx;
    const cx = c.width / 2, cy = c.height / 2;
    const maxR = Math.min(cx, cy) - 10;

    ctx.clearRect(0, 0, c.width, c.height);

    // Background circles
    ctx.strokeStyle = 'rgba(0,212,255,0.15)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (maxR / 4) * i, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Cross lines
    ctx.beginPath();
    ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
    ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
    ctx.stroke();

    // Draw sweep arc
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.angle);
    const sweepGrad = ctx.createLinearGradient(0, -maxR, maxR, 0);
    sweepGrad.addColorStop(0, 'rgba(0,212,255,0)');
    sweepGrad.addColorStop(1, 'rgba(0,212,255,0.4)');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxR, -Math.PI / 2, 0, false);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();
    ctx.restore();

    // Sweep line
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(maxR, 0);
    ctx.strokeStyle = 'rgba(0,255,136,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Dots (real scan points)
    for (const d of this.dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.globalAlpha = d.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
      d.alpha = Math.max(0, d.alpha - 0.005);
    }

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#00d4ff';
    ctx.fill();

    this.angle += 0.025;
    this.animFrame = requestAnimationFrame(() => this.animate());
  }
};

// ══════════════════════════════════════════════════
//  SPATIAL MAP
// ══════════════════════════════════════════════════
const SpatialMap = {
  canvas: null, ctx: null,

  init() {
    this.canvas = $('spatial-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    const container = $('spatial-container');
    container.addEventListener('click', e => this.handleClick(e));
    $('btn-spatial-clear').addEventListener('click', () => this.clear());
  },

  resize() {
    const container = $('spatial-container');
    this.canvas.width  = container.clientWidth;
    this.canvas.height = container.clientHeight;
    this.redraw();
  },

  async handleClick(e) {
    if (!State.scanning) {
      showToast('⚠️ Bitte zuerst den Scanner starten');
      return;
    }
    const rect = $('spatial-container').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Use latest measurement
    const latest = State.measurements[State.measurements.length - 1];
    if (!latest) { showToast('⚠️ Noch keine Messdaten'); return; }

    const point = {
      x, y,
      quality:  latest.quality,
      latency:  latest.latency,
      downlink: latest.downlink,
      ts:       Date.now(),
      id:       State.spatialPoints.length + 1,
    };
    State.spatialPoints.push(point);
    this.redraw();
    this.updateSidebar();
    this.updateStats();
    addLog('network', `Messpunkt #${point.id} gesetzt – Qualität: ${point.quality}, Latenz: ${fmtMs(point.latency)}`);
  },

  redraw() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height);

    for (const p of State.spatialPoints) {
      // Heatmap glow
      const r = 50;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      const col = qualityColor(p.quality);
      // Convert hex to rgba for gradient
      const hexToRgba = (hex, a) => {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${a})`;
      };
      grad.addColorStop(0, hexToRgba(col, 0.35));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Center dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Share Tech Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`#${p.id}`, p.x, p.y - 14);
      ctx.fillText(`${p.quality}`, p.x, p.y + 22);
    }
  },

  clear() {
    State.spatialPoints = [];
    this.redraw();
    this.updateSidebar();
    this.updateStats();
    showToast('🗺️ Messpunkte gelöscht');
  },

  updateSidebar() {
    const list = $('spatial-points-list');
    const empty = $('spatial-empty');
    if (!State.spatialPoints.length) {
      list.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    list.innerHTML = State.spatialPoints.map(p => `
      <div class="point-item" style="border-left-color:${qualityColor(p.quality)}">
        <span>#${p.id}</span>
        <span style="color:${qualityColor(p.quality)}">${p.quality}/100</span>
        <span style="color:#5a7a9a">${fmtMs(p.latency)}</span>
      </div>
    `).join('');
  },

  updateStats() {
    const pts = State.spatialPoints;
    $('sp-count').textContent = pts.length;
    if (!pts.length) {
      ['sp-best','sp-worst','sp-avg','sp-zone'].forEach(id => $(id).textContent = '—');
      return;
    }
    const qs = pts.map(p => p.quality);
    const best  = Math.max(...qs);
    const worst = Math.min(...qs);
    const avg   = Math.round(qs.reduce((a,b) => a+b, 0) / qs.length);
    const bestPt = pts.find(p => p.quality === best);
    $('sp-best').textContent  = `${best}/100`;
    $('sp-worst').textContent = `${worst}/100`;
    $('sp-avg').textContent   = `${avg}/100`;
    $('sp-zone').textContent  = bestPt ? `#${bestPt.id}` : '—';
  }
};

// ══════════════════════════════════════════════════
//  UI UPDATER
// ══════════════════════════════════════════════════
const UI = {
  updateKPIs(m) {
    // Signal strength
    const dbm = m.dbm ?? '—';
    $('val-signal').textContent   = m.connAvailable ? `${dbm}` : '—';

    // Quality
    const q = m.quality;
    $('val-quality').textContent  = q;
    $('bar-quality').style.width  = q + '%';
    $('bar-quality').style.background =
      `linear-gradient(90deg, ${qualityColor(q)}, ${qualityColor(Math.min(100, q + 20))})`;

    // Latency
    $('val-latency').textContent  = fmtMs(m.latency);

    // Downlink
    $('val-downlink').textContent = fmtMbps(m.downlink);

    // Type
    $('val-type').textContent     = m.effectiveType ?? m.type ?? '—';

    // Throughput
    $('val-throughput').textContent = fmtMbps(m.throughput);

    // Badge
    const badge = $('connection-badge');
    const dot   = badge.querySelector('.badge-dot');
    if (!m.online) {
      badge.className = 'badge-offline';
      $('badge-label').textContent = 'Offline';
    } else if (State.scanning) {
      badge.className = 'badge-scanning';
      $('badge-label').textContent = 'Scanning …';
    } else {
      badge.className = 'badge-online';
      $('badge-label').textContent = m.effectiveType ?? 'Online';
    }
  },

  updateStats(m) {
    const conn = Measure.getConnectionInfo();
    $('st-nettype').textContent   = conn.type          ?? '—';
    $('st-efftype').textContent   = conn.effectiveType  ?? '—';
    $('st-downlink').textContent  = fmtMbps(conn.downlink);
    $('st-rtt').textContent       = fmtMs(conn.rtt);
    $('st-datasaver').textContent = conn.saveData ? 'Ja' : 'Nein';
    $('st-online').textContent    = navigator.onLine ? '✅ Online' : '❌ Offline';
    $('st-mlatency').textContent  = fmtMs(m.latency);
    $('st-ua').textContent        = navigator.userAgent.substring(0, 60) + '…';
    $('st-proto').textContent     = Measure.getResourceTimingStats()?.protocol ?? '—';

    // Running stats
    const lats = State.measurements.map(x => x.latency).filter(x => x !== null);
    if (lats.length) {
      $('st-minlat').textContent  = fmtMs(Math.min(...lats));
      $('st-maxlat').textContent  = fmtMs(Math.max(...lats));
      $('st-avglat').textContent  = fmtMs(lats.reduce((a,b)=>a+b,0)/lats.length);
    }
    $('st-throughput').textContent = fmtMbps(m.throughput);
    $('st-count').textContent      = State.measurements.length;
  },

  updateAnalysis() {
    const ms = State.measurements;
    if (ms.length < 3) return;
    const lats = ms.map(m => m.latency).filter(x => x !== null);
    if (!lats.length) return;

    // Jitter = std deviation of latency
    const avg  = lats.reduce((a,b) => a+b, 0) / lats.length;
    const jitter = Math.sqrt(lats.reduce((s,v) => s + (v-avg)**2, 0) / lats.length);
    $('ana-val-jitter').textContent = `${jitter.toFixed(1)} ms`;

    // Stability = inverse of coefficient of variation
    const stability = clamp(Math.round(100 - (jitter / avg) * 100), 0, 100);
    $('ana-val-stability').textContent = `${stability}/100`;
    $('ana-bar-stability').style.width  = stability + '%';
    $('ana-bar-stability').style.background = qualityColor(stability);

    // Packet loss estimate (timeouts)
    const total   = ms.length;
    const timeouts = ms.filter(m => m.latency === null || m.latency > 2000).length;
    const pl = ((timeouts / total) * 100).toFixed(1);
    $('ana-val-packetloss').textContent = `${pl} %`;

    // Overall score
    const qs = ms.map(m => m.quality);
    const overallScore = Math.round(qs.reduce((a,b) => a+b,0) / qs.length);
    $('ana-val-score').textContent = overallScore;
    $('ana-val-score').style.color = qualityColor(overallScore);

    // Rating text
    let rating;
    if (overallScore >= 85)      rating = '🏆 Exzellente Verbindung';
    else if (overallScore >= 70) rating = '✅ Gute Verbindung';
    else if (overallScore >= 50) rating = '⚠️ Mittelmäßige Verbindung';
    else if (overallScore >= 30) rating = '❗ Schlechte Verbindung';
    else                          rating = '🚨 Kritisch schlechte Verbindung';
    $('ana-rating').textContent = rating;

    // Histogram
    Charts.updateHistogram();

    // Recommendations
    this.updateRecommendations(overallScore, avg, jitter, parseFloat(pl));

    // Session info
    $('session-count').textContent  = ms.length;
    $('session-points').textContent = lats.length;
  },

  updateRecommendations(score, avgLat, jitter, pl) {
    const recs = [];
    if (avgLat > 100) recs.push({ type:'warn', icon:'fa-circle-exclamation', text:'Hohe Latenz erkannt. Überprüfe ob andere Anwendungen Bandbreite belegen.' });
    if (jitter > 30)  recs.push({ type:'warn', icon:'fa-wave-square', text:'Hoher Jitter. Die Verbindung ist instabil – WLAN-Kanal wechseln könnte helfen.' });
    if (pl > 2)       recs.push({ type:'bad',  icon:'fa-triangle-exclamation', text:`${pl}% geschätzter Paketverlust. Näher am Router positionieren oder Router neu starten.` });
    if (score >= 80)  recs.push({ type:'good', icon:'fa-circle-check', text:'Verbindungsqualität ist ausgezeichnet. Optimale Position.' });
    if (score < 40)   recs.push({ type:'bad',  icon:'fa-ban', text:'Sehr schlechte Verbindung. Netzwerkadapter, WLAN-Kanal oder Hardware prüfen.' });
    if (!recs.length) recs.push({ type:'good', icon:'fa-circle-check', text:'Verbindung ist stabil. Keine Maßnahmen erforderlich.' });

    $('recommendations').innerHTML = recs.map(r => `
      <div class="rec-item ${r.type}">
        <i class="fa-solid ${r.icon}"></i>
        <span>${r.text}</span>
      </div>
    `).join('');
  },

  updateDeviceInfo() {
    const conn  = Measure.getConnectionInfo();
    const tim   = Measure.getResourceTimingStats();
    const rows  = [
      ['Browser',    navigator.userAgent.split(')')[0].split('(')[1] ?? 'Unbekannt'],
      ['Plattform',  navigator.platform || 'Unbekannt'],
      ['Sprache',    navigator.language || '—'],
      ['CPU-Kerne',  navigator.hardwareConcurrency || '—'],
      ['Device RAM', navigator.deviceMemory ? `${navigator.deviceMemory} GB` : '—'],
      ['Protokoll',  tim?.protocol ?? '—'],
      ['DNS',        tim ? `${tim.dns} ms` : '—'],
      ['TCP',        tim ? `${tim.tcp} ms` : '—'],
      ['TTFB',       tim ? `${tim.ttfb} ms` : '—'],
      ['Conn-API',   conn.available ? '✅' : '❌ (nicht unterstützt)'],
    ];
    $('device-info-table').innerHTML = rows.map(([k,v]) =>
      `<div class="stat-row"><span>${k}</span><span class="truncate">${v}</span></div>`
    ).join('');
  },

  updateRadarInfo(m) {
    $('radar-freq').textContent = m.effectiveType ? `Typ: ${m.effectiveType.toUpperCase()}` : 'Typ: —';
    $('radar-rtt').textContent  = `RTT: ${fmtMs(m.rtt ?? m.latency)}`;
  },

  updateSession() {
    if (!State.sessionStart) return;
    const elapsed = Math.floor((Date.now() - State.sessionStart) / 1000);
    const m = Math.floor(elapsed / 60), s = elapsed % 60;
    $('session-duration').textContent = `${m}m ${s}s`;
  }
};

// ══════════════════════════════════════════════════
//  SCAN ENGINE
// ══════════════════════════════════════════════════
const Scanner = {
  async runCycle() {
    const m = await Measure.snapshot();
    State.measurements.push(m);

    // Limit to last 500 measurements in memory
    if (State.measurements.length > 500) State.measurements.shift();

    // Update rolling history
    State.latencyHistory.push(m.latency);
    State.throughputHistory.push(m.throughput);
    if (State.latencyHistory.length   > 60) State.latencyHistory.shift();
    if (State.throughputHistory.length > 60) State.throughputHistory.shift();

    // Update UI
    UI.updateKPIs(m);
    UI.updateStats(m);
    UI.updateAnalysis();
    UI.updateRadarInfo(m);

    // Charts
    Charts.pushLatency(m.latency);
    Charts.pushThroughput(m.throughput);

    // Radar dot
    Radar.addDot(m.quality);

    // Log
    addLog('latency',  `Latenz: ${fmtMs(m.latency)} | RTT-API: ${fmtMs(m.rtt)} | Typ: ${m.effectiveType ?? '—'}`);
    addLog('network',  `Downlink: ${fmtMbps(m.downlink)} | Throughput: ${fmtMbps(m.throughput)} | Qualität: ${m.quality}/100`);

    // Persist to Table API
    await Storage.saveSnapshot(m);
  },

  start() {
    if (State.scanning) return;
    State.scanning = true;
    State.sessionStart = Date.now();
    $('session-start').textContent = new Date().toLocaleTimeString('de-DE');

    $('btn-scan-toggle').innerHTML = '<i class="fa-solid fa-stop"></i> Scan stoppen';
    $('btn-scan-toggle').classList.add('scanning');

    addLog('info', '▶ Scanner gestartet');
    showToast('🔍 Scan gestartet – messe echte Netzwerkdaten …');

    // Immediate first run
    this.runCycle();

    // Interval: every 8 seconds (fetch + throughput take time)
    State.scanInterval = setInterval(() => this.runCycle(), 8000);

    // Session timer
    State.sessionTimer = setInterval(() => UI.updateSession(), 1000);
  },

  stop() {
    if (!State.scanning) return;
    State.scanning = false;
    clearInterval(State.scanInterval);
    clearInterval(State.sessionTimer);

    $('btn-scan-toggle').innerHTML = '<i class="fa-solid fa-play"></i> Scan starten';
    $('btn-scan-toggle').classList.remove('scanning');

    addLog('info', '■ Scanner gestoppt');
    showToast('⏹ Scan gestoppt');

    // Update badge
    $('connection-badge').className = 'badge-online';
    $('badge-label').textContent = 'Online';
  },

  toggle() {
    if (State.scanning) this.stop(); else this.start();
  }
};

// ══════════════════════════════════════════════════
//  STORAGE (Table API)
// ══════════════════════════════════════════════════
const Storage = {
  TABLE: 'wifi_scans',

  async saveSnapshot(m) {
    try {
      await fetch(`tables/${this.TABLE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ts:            new Date(m.ts).toISOString(),
          latency_ms:    m.latency    ? Math.round(m.latency) : null,
          downlink_mbps: m.downlink,
          rtt_ms:        m.rtt,
          effective_type: m.effectiveType,
          conn_type:     m.type,
          throughput_mbps: m.throughput,
          quality_score: m.quality,
          dbm_est:       m.dbm,
          online:        m.online,
        })
      });
    } catch (_) { /* Table API might not be configured – silently fail */ }
  },

  async loadAll() {
    try {
      const resp = await fetch(`tables/${this.TABLE}?limit=500&sort=created_at`);
      if (!resp.ok) return [];
      const data = await resp.json();
      return data.data || [];
    } catch (_) { return []; }
  }
};

// ══════════════════════════════════════════════════
//  EXPORT
// ══════════════════════════════════════════════════
function exportData() {
  if (!State.measurements.length) { showToast('⚠️ Keine Daten zum Exportieren'); return; }
  const csv = [
    'Zeitstempel,Latenz_ms,Downlink_Mbps,RTT_ms,EffektTyp,Typ,Throughput_Mbps,Qualitaet,dBm,Online',
    ...State.measurements.map(m => [
      new Date(m.ts).toISOString(),
      m.latency   ?? '',
      m.downlink  ?? '',
      m.rtt       ?? '',
      m.effectiveType ?? '',
      m.type      ?? '',
      m.throughput ?? '',
      m.quality,
      m.dbm       ?? '',
      m.online,
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `wipulscan_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Daten als CSV exportiert');
  addLog('info', `Export: ${State.measurements.length} Messungen`);
}

// ══════════════════════════════════════════════════
//  TAB NAVIGATION
// ══════════════════════════════════════════════════
function switchTab(tabId) {
  document.querySelectorAll('.tab-view').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const view = $(`tab-${tabId}`);
  if (view) { view.classList.remove('hidden'); view.classList.add('active'); }
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.dataset.tab === tabId) b.classList.add('active');
  });
  State.currentView = tabId;

  // Resize spatial canvas when switching to spatial tab
  if (tabId === 'spatial') {
    setTimeout(() => SpatialMap.resize(), 100);
  }
}

// ══════════════════════════════════════════════════
//  LOG FILTER
// ══════════════════════════════════════════════════
function applyLogFilter() {
  const val = $('log-filter').value;
  document.querySelectorAll('.log-entry').forEach(el => {
    const cat = el.dataset.cat;
    el.style.display = (val === 'all' || cat === val) ? '' : 'none';
  });
}

// ══════════════════════════════════════════════════
//  APP INIT
// ══════════════════════════════════════════════════
const App = {
  init() {
    Charts.init();
    Radar.init();
    SpatialMap.init();
    UI.updateDeviceInfo();

    // Network change listener
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      conn.addEventListener('change', () => {
        addLog('network', `Netzwerk geändert → Typ: ${conn.effectiveType}, Downlink: ${fmtMbps(conn.downlink)}`);
        showToast(`🔄 Netzwerk geändert: ${conn.effectiveType ?? 'unbekannt'}`);
        if (State.scanning) Scanner.runCycle();
      });
    }

    // Online/offline events
    window.addEventListener('online',  () => {
      addLog('network', '✅ Verbindung wiederhergestellt');
      showToast('✅ Verbindung wiederhergestellt');
    });
    window.addEventListener('offline', () => {
      addLog('warn', '⚠️ Verbindung unterbrochen!');
      showToast('⚠️ Verbindung unterbrochen!', 5000);
      $('connection-badge').className = 'badge-offline';
      $('badge-label').textContent = 'Offline';
    });

    // Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Scan toggle
    $('btn-scan-toggle').addEventListener('click', () => Scanner.toggle());

    // Export
    $('btn-export').addEventListener('click', exportData);

    // Log filter
    $('log-filter').addEventListener('change', applyLogFilter);
    $('btn-clear-log').addEventListener('click', () => {
      $('log-output').innerHTML = '';
      showToast('🗑️ Log gelöscht');
    });

    // WAV from main app
    document.addEventListener('keydown', e => {
      if (e.key === 'w' && e.ctrlKey) { e.preventDefault(); $('wav-modal').classList.toggle('hidden'); }
    });
    $('btn-load-wav').addEventListener('click', () => {
      const file = $('wav-file-input').files[0];
      if (!file) { showToast('⚠️ Bitte WAV-Datei auswählen'); return; }
      Intro.loadWavFile(file);
      $('wav-modal').classList.add('hidden');
    });

    // Initial log
    addLog('info', `WiPulScan Pro v3.1.4 initialisiert`);
    addLog('info', `Network API: ${navigator.connection ? '✅ verfügbar' : '❌ nicht unterstützt'}`);
    addLog('info', `Online: ${navigator.onLine ? 'Ja' : 'Nein'}`);
    addLog('info', `User Agent: ${navigator.userAgent.substring(0,80)}`);

    const conn2 = Measure.getConnectionInfo();
    if (conn2.available) {
      addLog('network', `Verbindung: ${conn2.effectiveType ?? '—'} | Downlink: ${fmtMbps(conn2.downlink)} | RTT: ${fmtMs(conn2.rtt)}`);
    } else {
      addLog('warn', 'Network Information API nicht verfügbar – nur Latenz-Messungen möglich');
    }

    showToast('🚀 WiPulScan Pro bereit. Scanner starten um Messung zu beginnen.');
  }
};

// ══════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  Intro.init();
});
