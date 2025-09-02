// l-aurora-modal.js — Aurora doar ÎN INTERIORUL modalului + a11y + perf
class LAuroraModal extends HTMLElement {
  // timpi animații intrare/ieșire
  static get ENTER_MS() { return 600 }
  static get EXIT_MS()  { return 400 }

  static get observedAttributes() {
    return [
      'open', 'size',
      'color-palette', 'aurora-intensity', 'aurora-speed',
      'animation-type', 'glow-intensity',
      'particle-count', 'backdrop-blur', 'close-on-backdrop',
      'entrance-animation'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // config implicit
    this.config = {
      open: false,
      size: 'medium',                   // small | medium | large | fullscreen
      colorPalette: 'arctic',           // arctic | cosmic | forest | sunset | ocean
      auroraIntensity: 1.0,             // 0..2 (intern normalizat)
      auroraSpeed: 1.0,                 // 0.1..3
      animationType: 'fluid',           // fluid | waves | spiral (overlay)
      glowIntensity: 0.6,               // 0..1 (slider 0..100 acceptat)
      particleCount: 20,
      backdropBlur: true,
      closeOnBackdrop: true
    };

    // stare internă
    this.state = {
      isAnimating: false,
      auroraLayers: [],
      particles: []
    };

    this.elements = {};
    this._raf = null;
    this._lastActiveElement = null;
    this._focusTrapHandler = null;

    // palete
    this.colorPalettes = {
      arctic: ['#00e5ff', '#0094ff', '#6d3cff', '#ff00f0'],
      cosmic: ['#ff00f0', '#8a2be2', '#00d0ff', '#00ffa6'],
      forest: ['#00ffa6', '#8cff00', '#ffe500', '#ff9a00'],
      sunset: ['#ff9a00', '#ff3b3b', '#ff0096', '#7b2cff'],
      ocean:  ['#0094ff', '#00e5ff', '#00ffa6', '#9dff00']
    };
  }

  /* ========================= lifecycle ========================= */

  connectedCallback() {
    this._parseAttributes();
    this._render();
    this._cacheEls();
    this._setupAria();
    this._initAurora();
    this._attachEvents();

    // start bucla (particule tot timpul; canvas doar la fluid)
    this._startLoop();

    if (this.config.open) this.show();
  }

  disconnectedCallback() {
    this._stopLoop();
    this._teardownEvents?.();
  }

  attributeChangedCallback(name, oldV, newV) {
    if (oldV === newV) return;

    switch (name) {
      case 'open':
        this._parseAttributes();
        this.config.open ? this.show() : this.hide();
        return;

      case 'animation-type':
        this.config.animationType = (newV || 'fluid').toLowerCase();
        this._updateAuroraVisibility();
        return;

      case 'color-palette':
        this.config.colorPalette = (newV || 'arctic').toLowerCase();
        this._initAurora(); // refacem numai layere + particule (ieftin)
        return;

      case 'aurora-intensity': {
        const v = this._normNumber(newV, this.config.auroraIntensity);
        this.config.auroraIntensity = v;
        this._updateOverlayIntensity();
        return;
      }

      case 'aurora-speed': {
        const v = this._normNumber(newV, this.config.auroraSpeed);
        this.config.auroraSpeed = v;
        this._updateOverlayDurations();
        return;
      }

      case 'glow-intensity': {
        const v = this._norm01(newV, this.config.glowIntensity);
        this.config.glowIntensity = v;
        this._applyGlow();
        return;
      }

      case 'particle-count': {
        const n = Math.max(0, parseInt(newV || this.config.particleCount, 10) || 0);
        this.config.particleCount = n;
        this._initParticles();
        return;
      }

      case 'backdrop-blur':
        this.config.backdropBlur = this._boolAttr('backdrop-blur', this.config.backdropBlur);
        if (this.elements.backdrop) {
          this.elements.backdrop.style.backdropFilter = this.config.backdropBlur ? 'blur(8px)' : 'none';
        }
        return;

      case 'size':
        this.config.size = (newV || 'medium').toLowerCase();
        this._applySize(); // fără re-render complet
        return;

      case 'entrance-animation':
        // doar memorăm; show() îl citește
        this._entranceAnimation = newV;
        return;
    }
  }

  /* ========================= render ========================= */

  _render() {
    const sizes = {
      small: { w: '400px', h: '300px' },
      medium: { w: '600px', h: '420px' },
      large: { w: '800px', h: '600px' },
      fullscreen: { w: '95vw', h: '90vh' }
    };
    const s = sizes[this.config.size] || sizes.medium;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed; inset: 0; z-index: 9999;
          pointer-events: none; opacity: 0; transition: opacity .4s ease;
        }
        :host(.show) { opacity: 1; pointer-events: all; }

        .modal-backdrop {
          position:absolute; inset:0; background: rgba(0,0,0,.4);
          ${this.config.backdropBlur ? 'backdrop-filter: blur(8px);' : ''}
          cursor: pointer; z-index: 0;
        }

        /* Particule full-screen în spate */
        .particle-layer { position:absolute; inset:0; pointer-events:none; z-index:1; }

        /* Container modal */
        .modal-container {
          position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
          width:${s.w}; height:${s.h}; border-radius:16px;
          background: rgba(10,15,30,.85); border:1px solid rgba(255,255,255,.08);
          box-shadow: 0 10px 40px rgba(0, 0, 0, .45);
          backdrop-filter: blur(10px); overflow:hidden; z-index: 10;
        }

        /* Canvas DOAR ÎN INTERIORUL MODALULUI */
        .aurora-canvas {
          position:absolute; inset:0; width:100%; height:100%;
          border-radius: inherit; pointer-events:none; z-index:4;
        }

        /* Overlay CSS — folosit când animation-type ≠ fluid */
        .aurora-overlay {
          position:absolute; inset:0; border-radius:inherit;
          pointer-events:none; z-index:5; opacity:.6;
        }
        .aurora-layer {
          position:absolute; top:-10%; left:-10%; width:120%; height:120%;
          background: linear-gradient(
            var(--angle),
            transparent 0%,
            var(--color1) 18%,
            var(--color2) 40%,
            transparent 60%,
            var(--color3) 80%,
            transparent 100%
          );
          filter: blur(8px); opacity: var(--opacity);
          animation: auroraFlow linear infinite; animation-duration: var(--duration);
        }
        @keyframes auroraFlow {
          0%   { transform: translate(-10%,-10%) rotate(0deg);   }
          50%  { transform: translate( 10%, 10%) rotate(180deg); }
          100% { transform: translate(-10%,-10%) rotate(360deg); }
        }

        /* Glow reactiv în interior */
        .glow-effect {
          position:absolute; inset:-20% -10% -10% -20%;
          background: radial-gradient(circle at var(--mx,50%) var(--my,50%),
            rgba(255,255,255,.25) 0%, rgba(255,255,255,0) 42%);
          filter: blur(18px); mix-blend-mode: screen;
          z-index:6; opacity: 0.6;
        }

        /* Conținut */
        .modal-content { position:relative; z-index:20; color:#e7ecff; }
        .modal-header  { display:flex; align-items:center; justify-content:space-between;
                         padding:16px 20px; border-bottom:1px solid rgba(255,255,255,.08); }
        .modal-title   { margin:0; font-size:18px; font-weight:600; color:#f1f5ff; }
        .modal-close   { width:32px; height:32px; border-radius:8px; border:1px solid rgba(255,255,255,.1);
                         background: rgba(255,255,255,.06); cursor:pointer; position:relative; }
        .modal-close::before, .modal-close::after {
          content:""; position:absolute; top:7px; left:15px; width:2px; height:18px;
          background:#fff; border-radius:2px;
        }
        .modal-close::before { transform: rotate(45deg);  }
        .modal-close::after  { transform: rotate(-45deg); }
        .modal-body    { padding:16px 20px; max-height:calc(100% - 60px); overflow:auto; }

        /* Intrări */
        .entrance-fade  { animation: modalFadeIn ${this.constructor.ENTER_MS}ms both ease; }
        .entrance-slide { animation: modalSlideIn ${this.constructor.ENTER_MS}ms both ease; }
        .entrance-zoom  { animation: modalZoomIn ${this.constructor.ENTER_MS}ms both ease; }
        @keyframes modalFadeIn { from{ opacity:0; transform:translate(-50%,-52%);} to{ opacity:1; transform:translate(-50%,-50%);} }
        @keyframes modalSlideIn{ from{ opacity:0; transform:translate(-50%,-40%);} to{ opacity:1; transform:translate(-50%,-50%);} }
        @keyframes modalZoomIn { from{ opacity:0; transform:translate(-50%,-50%) scale(.96);} to{ opacity:1; transform:translate(-50%,-50%) scale(1);} }
      </style>

      <div class="modal-backdrop" id="modalBackdrop"></div>
      <div class="particle-layer" id="particleLayer"></div>

      <div class="modal-container" id="modalContainer">
        <canvas class="aurora-canvas" id="auroraCanvas"></canvas>
        <div class="aurora-overlay" id="auroraOverlay"></div>
        <div class="glow-effect" id="glowEffect"></div>

        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title" id="modalTitle"><slot name="title">Modal Title</slot></h2>
            <button class="modal-close" id="modalClose"></button>
          </div>
          <div class="modal-body">
            <slot name="content"><p>Modal content goes here...</p></slot>
          </div>
        </div>
      </div>
    `;
  }

  _cacheEls() {
    const $ = (id) => this.shadowRoot.getElementById(id);
    this.elements = {
      backdrop: $('modalBackdrop'),
      particleLayer: $('particleLayer'),
      container: $('modalContainer'),
      canvas: $('auroraCanvas'),
      overlay: $('auroraOverlay'),
      glow: $('glowEffect'),
      close: $('modalClose'),
      title: $('modalTitle')
    };

    // canvas interior dimensionat la container
    this._setupInnerCanvas();
    // vizibilitate corectă pentru canvas/overlay
    this._updateAuroraVisibility();
    // aplică opacitatea glow la mount
    this._applyGlow();
  }

  _setupInnerCanvas() {
    const c = this.elements.canvas;
    if (!c) return;
    this.ctx = c.getContext('2d');

    const size = () => {
      const r = this.elements.container.getBoundingClientRect();
      c.width  = Math.max(1, Math.floor(r.width));
      c.height = Math.max(1, Math.floor(r.height));
    };
    size();

    // urmărește redimensionarea containerului
    const ro = new ResizeObserver(size);
    ro.observe(this.elements.container);
    this._teardownCanvasResize = () => { try { ro.disconnect(); } catch {} };
  }

  _setupAria() {
    const box = this.elements.container;
    const btn = this.elements.close;
    const title = this.elements.title;
    if (box) {
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      if (title) {
        if (!title.id) title.id = `modalTitle-${Math.random().toString(36).slice(2)}`;
        box.setAttribute('aria-labelledby', title.id);
      }
      if (!box.hasAttribute('tabindex')) box.setAttribute('tabindex', '-1');
    }
    if (btn && !btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', 'Close modal');
  }

  _attachEvents() {
    const onClose = (e) => { e.stopPropagation(); this.hide(); };
    const onBackdrop = (e) => { if (this.config.closeOnBackdrop && e.target === this.elements.backdrop) this.hide(); };
    const onMove = (e) => {
      const r = this.elements.container.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      this.elements.glow.style.setProperty('--mx', mx + '%');
      this.elements.glow.style.setProperty('--my', my + '%');
    };
    const onKey = (e) => { if (e.key === 'Escape' && this.getAttribute('close-on-backdrop') !== 'false') this.hide(); };

    this.elements.close.addEventListener('click', onClose);
    this.elements.backdrop.addEventListener('click', onBackdrop);
    this.addEventListener('mousemove', onMove);
    document.addEventListener('keydown', onKey);

    this._teardownEvents = () => {
      this.elements.close.removeEventListener('click', onClose);
      this.elements.backdrop.removeEventListener('click', onBackdrop);
      this.removeEventListener('mousemove', onMove);
      document.removeEventListener('keydown', onKey);
      this._teardownCanvasResize?.();
    };
  }

  /* ========================= aurora & particles ========================= */

  _initAurora() {
    // layere overlay (CSS) + setări pentru canvas
    const colors = this.colorPalettes[this.config.colorPalette] || this.colorPalettes.arctic;

    // descriere layere
    this.state.auroraLayers = [];
    for (let i = 0; i < 4; i++) {
      this.state.auroraLayers.push({
        color1: colors[i % colors.length],
        color2: colors[(i + 1) % colors.length],
        color3: colors[(i + 2) % colors.length],
        speed: 0.5 + Math.random() * 1.5,
        angle: Math.random() * 360,
        opacity: 0.30 + Math.random() * 0.40,
        phase: Math.random() * Math.PI * 2
      });
    }

    // (re)construiește overlay
    const overlay = this.elements.overlay;
    overlay.innerHTML = '';
    this.state.auroraLayers.forEach((L) => {
      const el = document.createElement('div');
      el.className = 'aurora-layer';
      el.style.setProperty('--color1', this._withAlpha(L.color1, 0.25));
      el.style.setProperty('--color2', this._withAlpha(L.color2, 0.40));
      el.style.setProperty('--color3', this._withAlpha(L.color3, 0.25));
      el.style.setProperty('--angle', `${L.angle}deg`);
      el.style.setProperty('--duration', `${20 / (L.speed * this.config.auroraSpeed)}s`);
      el.style.setProperty('--opacity', (L.opacity * this.config.auroraIntensity).toString());
      overlay.appendChild(el);
    });

    this._initParticles();
  }

  _initParticles() {
    const layer = this.elements.particleLayer;
    layer.innerHTML = '';
    const colors = this.colorPalettes[this.config.colorPalette] || this.colorPalettes.arctic;

    for (let i = 0; i < this.config.particleCount; i++) {
      const dot = document.createElement('div');
      const size = 1 + Math.random() * 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const speed = 0.2 + Math.random() * 0.5;
      dot.style.cssText = `
        position:absolute; width:${size}px; height:${size}px;
        background:${color}; border-radius:50%;
        opacity:.50; filter: blur(1px);
        left:${Math.random() * 100}%; top:${Math.random() * 100}%;
        transform: translate(-50%, -50%);
      `;
      dot.dataset.speed = String(speed);
      layer.appendChild(dot);
    }
  }

  _updateAuroraVisibility() {
    const fluid = this._shouldUseFluid();
    if (this.elements.canvas)  this.elements.canvas.style.display  = fluid ? '' : 'none';
    if (this.elements.overlay) this.elements.overlay.style.display = fluid ? 'none' : '';
  }

  _updateOverlayIntensity() {
    const overlay = this.elements.overlay;
    if (!overlay) return;
    const children = overlay.children;
    for (let i = 0; i < children.length; i++) {
      const base = this.state.auroraLayers[i]?.opacity ?? 1;
      children[i].style.setProperty('--opacity', (base * this.config.auroraIntensity).toString());
    }
  }

  _updateOverlayDurations() {
    const overlay = this.elements.overlay;
    if (!overlay) return;
    for (let i = 0; i < overlay.children.length; i++) {
      const L = this.state.auroraLayers[i];
      if (!L) continue;
      overlay.children[i].style.setProperty('--duration', `${20 / (L.speed * this.config.auroraSpeed)}s`);
    }
  }

  /* ========================= RAF loop ========================= */

  _startLoop() {
    if (this._raf) return;
    const step = (t) => {
      // canvas fluid — doar în interiorul modalului
      if (this._shouldUseFluid()) this._renderFluidAurora(t);
      // particule pe fundal — mereu
      this._driftParticles(t);
      this._raf = requestAnimationFrame(step);
    };
    this._raf = requestAnimationFrame(step);
  }

  _stopLoop() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  }

  _renderFluidAurora(time) {
    const canvas = this.elements.canvas;
    const ctx = this.ctx;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const t = (time ?? performance.now()) * 0.001 * this.config.auroraSpeed;
    this.state.auroraLayers.forEach((L, i) => {
      L.phase += 0.002 * L.speed * this.config.auroraSpeed;

      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0.0, this._rgba(L.color1, 0.25 * this.config.auroraIntensity));
      g.addColorStop(0.5, this._rgba(L.color2, 0.18 * this.config.auroraIntensity));
      g.addColorStop(1.0, this._rgba(L.color3, 0.25 * this.config.auroraIntensity));

      ctx.fillStyle = g;
      ctx.beginPath();

      const amp = 60 + 30 * Math.sin(L.phase + i);
      const yBase = canvas.height * (0.30 + 0.15 * i);
      const k = 0.8 + 0.2 * Math.cos(L.phase);

      ctx.moveTo(0, yBase);
      for (let x = 0; x <= canvas.width; x += 24) {
        const y = yBase + Math.sin(x * 0.004 * k + t + i) * amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();
    });
  }

  _driftParticles(time) {
    const t = (time ?? performance.now()) * 0.001;
    const nodes = this.elements.particleLayer?.children || [];
    for (const p of nodes) {
      const s = parseFloat(p.dataset.speed || '0.3');
      const x = (parseFloat(p.style.left) || 50) + s * 0.05;
      const y = (parseFloat(p.style.top) || 50) + Math.sin(t * 0.5) * 0.02;
      p.style.left = (x % 100) + '%';
      p.style.top  = (y % 100) + '%';
    }
  }

  /* ========================= helpers ========================= */

  _parseAttributes() {
    const get = (name, fallback) => this.getAttribute(name) ?? fallback;

    this.config.open            = this.hasAttribute('open');
    this.config.size            = (get('size', this.config.size) || 'medium').toLowerCase();
    this.config.colorPalette    = (get('color-palette', this.config.colorPalette) || 'arctic').toLowerCase();
    this.config.auroraIntensity = this._normNumber(get('aurora-intensity', this.config.auroraIntensity), this.config.auroraIntensity);
    this.config.auroraSpeed     = this._normNumber(get('aurora-speed', this.config.auroraSpeed), this.config.auroraSpeed);
    this.config.animationType   = (get('animation-type', this.config.animationType) || 'fluid').toLowerCase();
    this.config.glowIntensity   = this._norm01(get('glow-intensity', this.config.glowIntensity), this.config.glowIntensity);
    this.config.particleCount   = Math.max(0, parseInt(get('particle-count', this.config.particleCount), 10) || 0);
    this.config.backdropBlur    = this._boolAttr('backdrop-blur', this.config.backdropBlur);
    this.config.closeOnBackdrop = this._boolAttr('close-on-backdrop', this.config.closeOnBackdrop);
  }

  _applySize() {
    const sizes = {
      small: { w: '400px', h: '300px' },
      medium: { w: '600px', h: '420px' },
      large: { w: '800px', h: '600px' },
      fullscreen: { w: '95vw', h: '90vh' }
    };
    const s = sizes[this.config.size] || sizes.medium;
    const el = this.elements.container;
    if (el) { el.style.width = s.w; el.style.height = s.h; }
    // redimensionează canvas-ul interior
    this._setupInnerCanvas();
  }

  _applyGlow() {
    const g = this.elements.glow;
    if (!g) return;
    const o = Math.max(0, Math.min(0.95, this.config.glowIntensity));
    g.style.opacity = String(o);
  }

  _withAlpha(hex, a) { // #rrggbb + alpha → rgba()
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return `rgba(0,255,255,${a})`;
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  _rgba(hex, a) { return this._withAlpha(hex, a); }

  _normNumber(v, fallback=1) {
    if (v == null) return fallback;
    const n = parseFloat(v);
    if (Number.isNaN(n)) return fallback;
    return n;
  }
  _norm01(v, fallback=0.6) {
    if (v == null) return fallback;
    let n = parseFloat(v);
    if (Number.isNaN(n)) return fallback;
    // dacă vine dintr-un slider 0..100, îl normalizăm la 0..1
    if (n > 1) n = n / 100;
    return Math.max(0, Math.min(1, n));
  }
  _boolAttr(name, def=true) {
    const v = this.getAttribute(name);
    if (v === null) return def;
    if (v === '' || v === 'true') return true;
    if (v === 'false') return false;
    return def;
  }

  _shouldUseFluid() {
    return (this.getAttribute('animation-type') || this.config.animationType || '').toLowerCase() === 'fluid';
  }

  /* ========================= public API ========================= */

  show(entranceType = (this.getAttribute('entrance-animation') || 'fade')) {
    if (this.state.isAnimating) return;

    // memorează opener
    this._lastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    this.state.isAnimating = true;
    this.config.open = true;
    this.setAttribute('open', '');

    document.body.style.overflow = 'hidden';
    this.elements.container.classList.add(`entrance-${entranceType}`);
    this.classList.add('show');

    // focus trap
    this._enableFocusTrap();

    setTimeout(() => {
      this.state.isAnimating = false;
      this.elements.container.classList.remove(`entrance-${entranceType}`);
    }, this.constructor.ENTER_MS);

    this.dispatchEvent(new CustomEvent('modal-open', { detail: { modal: this }}));
  }

  hide() {
    if (this.state.isAnimating || !this.config.open) return;

    this.state.isAnimating = true;
    this.config.open = false;
    this.removeAttribute('open');

    this.classList.remove('show');
    this._disableFocusTrap();

    setTimeout(() => {
      this.state.isAnimating = false;
      document.body.style.overflow = '';
    }, this.constructor.EXIT_MS);

    // return focus
    if (this._lastActiveElement && document.contains(this._lastActiveElement)) {
      this._lastActiveElement.focus({ preventScroll: true });
    }
    this._lastActiveElement = null;

    this.dispatchEvent(new CustomEvent('modal-close', { detail: { modal: this }}));
  }

  /* ========================= a11y focus trap ========================= */

  _getFocusable() {
    const root = this.shadowRoot || this;
    const sel = [
      'a[href]','area[href]','button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])','select:not([disabled])','textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])','[contenteditable]'
    ].join(',');
    return Array.from(root.querySelectorAll(sel))
      .filter(el => el.offsetParent !== null || el.getClientRects().length);
  }

  _enableFocusTrap() {
    const nodes = this._getFocusable();
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];

    queueMicrotask(() => this.elements.container?.focus?.({ preventScroll: true }));

    this._focusTrapHandler = (ev) => {
      if (ev.key === 'Tab') {
        const active = this.shadowRoot?.activeElement || document.activeElement;
        if (!ev.shiftKey && active === last) { ev.preventDefault(); first.focus(); }
        else if (ev.shiftKey && active === first) { ev.preventDefault(); last.focus(); }
      } else if (ev.key === 'Escape') {
        if (this.config.closeOnBackdrop) this.hide();
      }
    };
    (this.shadowRoot || this).addEventListener('keydown', this._focusTrapHandler, true);
  }

  _disableFocusTrap() {
    if (!this._focusTrapHandler) return;
    (this.shadowRoot || this).removeEventListener('keydown', this._focusTrapHandler, true);
    this._focusTrapHandler = null;
  }
}

customElements.define('l-aurora-modal', LAuroraModal);
