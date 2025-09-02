// l-aurora-modal.js - Modal cu efecte de aurora boreală și fundal fluid
class LAuroraModal extends HTMLElement {
  static ENTER_MS = 600;
  static EXIT_MS  = 400;

  static get observedAttributes() {
    return [
      'open', 'size', 'aurora-intensity', 'aurora-speed', 'color-palette',
      'backdrop-blur', 'close-on-backdrop', 'particle-count', 
      'animation-type', 'glow-intensity', 'entrance-animation'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Configuration
    this.config = {
      open: false,
      size: 'medium', // small, medium, large, fullscreen
      auroraIntensity: 1.0,
      auroraSpeed: 1.0,
      colorPalette: 'arctic', // arctic, cosmic, forest, sunset, ocean
      backdropBlur: true,
      closeOnBackdrop: true,
      particleCount: 20,
      animationType: 'fluid', // fluid, waves, spiral
      glowIntensity: 1.0
    };
    
    // State
    this.state = {
      isAnimating: false,
      auroraLayers: [],
      particles: [],
      wavePhase: 0,
      mouseX: 0,
      mouseY: 0
    };
    
    // DOM elements
    this.elements = {};
    
    // Animation
    this.animationId = null;
    this.openTimeout = null;
    this.closeTimeout = null;
    
    // Color palettes
    this.colorPalettes = {
      arctic: ['#00ffff', '#0080ff', '#8000ff', '#ff00ff'],
      cosmic: ['#ff00ff', '#8000ff', '#0080ff', '#00ffff'],
      forest: ['#00ff80', '#80ff00', '#ffff00', '#ff8000'],
      sunset: ['#ff8000', '#ff4000', '#ff0080', '#8000ff'],
      ocean: ['#0080ff', '#00ffff', '#00ff80', '#80ff00']
    };
    
    // Cleanup
    this.cleanup = [];
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
    this.initializeElements();
    this.attachEventListeners();
    this.initializeAurora();
    this.startAnimation();
    
    // If open attribute is set, show modal
    if (this.config.open) {
      this.show();
    }
  }

  disconnectedCallback() {
    this.stopAnimation();
    this.cleanup.forEach(fn => fn());
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    // Keep config in sync
    if (name === 'open') {
      this.parseAttributes();
      if (this.hasAttribute('open')) this.show(); else this.hide();
      return;
    }

    if (name === 'animation-type') {
      this.config.animationType = newValue || this.config.animationType;
      const r = this.shadowRoot || this;
      const canvas  = r.getElementById('auroraCanvas');
      const overlay = r.getElementById('auroraOverlay');
      const useFluid = this._shouldUseFluid ? this._shouldUseFluid() : false;
      if (canvas)  canvas.style.display  = useFluid ? '' : 'none';
      if (overlay) overlay.style.display = useFluid ? 'none' : '';
      if (useFluid) this.startAnimation(); else this.stopAnimation();
      return;
    }

    if (name === 'aurora-intensity') {
      const v = parseFloat(newValue);
      if (!Number.isNaN(v)) this.config.auroraIntensity = v;
      const overlay = (this.shadowRoot || this).getElementById('auroraOverlay');
      if (overlay && this.state && Array.isArray(this.state.auroraLayers)) {
        Array.from(overlay.children).forEach((el, i) => {
          const base = (this.state.auroraLayers[i] && this.state.auroraLayers[i].opacity) || 1;
          el.style.setProperty('--opacity', base * (this.config.auroraIntensity || 1));
        });
      }
      return;
    }

    if (name === 'color-palette') {
      this.config.colorPalette = newValue || this.config.colorPalette;
      this.initializeAurora();
      return;
    }

    if (name === 'backdrop-blur') {
      this.config.backdropBlur = this.getAttribute('backdrop-blur') !== 'false';
      const backdrop = (this.shadowRoot || this).getElementById('modalBackdrop');
      if (backdrop) {
        backdrop.style.backdropFilter = this.config.backdropBlur ? 'blur(8px)' : 'none';
      }
      return;
    }

    if (name === 'entrance-animation') {
      // only store; show() will read it
      this._entranceAnimation = newValue;
      return;
    }

    // Fallback to existing heavy update for other attributes
    this.parseAttributes();
    this.updateStyling();
  }

  render() {
    const { size, colorPalette, backdropBlur } = this.config;
    const colors = this.colorPalettes[colorPalette] || this.colorPalettes.arctic;
    
    // Size configurations
    const sizes = {
      small: { width: '400px', height: '300px' },
      medium: { width: '600px', height: '400px' },
      large: { width: '800px', height: '600px' },
      fullscreen: { width: '95vw', height: '90vh' }
    };
    
    const sizeConfig = sizes[size] || sizes.medium;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        
        :host(.show) {
          opacity: 1;
          pointer-events: all;
        }
        
        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          ${backdropBlur ? 'backdrop-filter: blur(8px);' : ''}
          cursor: pointer;
        }
        
        .aurora-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        
        .particle-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }
        
        .modal-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${sizeConfig.width};
          height: ${sizeConfig.height};
          background: rgba(10, 15, 30, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          overflow: hidden;
          z-index: 10;
        }
        
        .aurora-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.6;
          pointer-events: none;
          z-index: 5;
          border-radius: 16px;
          overflow: hidden;
        }
        
        .aurora-layer {
          position: absolute;
          width: 120%;
          height: 120%;
          top: -10%;
          left: -10%;
          background: linear-gradient(
            var(--angle),
            transparent 0%,
            var(--color1) 20%,
            var(--color2) 40%,
            transparent 60%,
            var(--color3) 80%,
            transparent 100%
          );
          animation: auroraFlow linear infinite;
          animation-duration: var(--duration);
          filter: blur(8px);
          opacity: var(--opacity);
        }
        
        @keyframes auroraFlow {
          0% { transform: translate(-10%, -10%) rotate(0deg); }
          50% { transform: translate(10%, 10%) rotate(180deg); }
          100% { transform: translate(-10%, -10%) rotate(360deg); }
        }
        
        .glow-effect {
          position: absolute;
          inset: -20% -10% -10% -20%;
          background: radial-gradient(
            circle at var(--mx, 50%) var(--my, 50%),
            rgba(255, 255, 255, 0.25) 0%,
            rgba(255, 255, 255, 0) 40%
          );
          filter: blur(18px);
          mix-blend-mode: screen;
          opacity: ${Math.min(0.9, this.config.glowIntensity)};
          z-index: 6;
        }
        
        .modal-content { position: relative; z-index: 20; color: #e7ecff; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,.08); }
        .modal-title { margin: 0; font-size: 18px; font-weight: 600; color: #f1f5ff; }
        .modal-close {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.06); cursor: pointer; position: relative;
        }
        .modal-close::before, .modal-close::after {
          content: ""; position: absolute; top: 7px; left: 15px; width: 2px; height: 18px; background: #fff; border-radius: 2px;
        }
        .modal-close::before { transform: rotate(45deg); }
        .modal-close::after  { transform: rotate(-45deg); }
        .modal-body { padding: 16px 20px; max-height: calc(100% - 60px); overflow: auto; }

        /* Entrance animations */
        .entrance-fade   { animation: modalFadeIn ${this.constructor.ENTER_MS}ms both ease; }
        .entrance-slide  { animation: modalSlideIn ${this.constructor.ENTER_MS}ms both ease; }
        .entrance-zoom   { animation: modalZoomIn ${this.constructor.ENTER_MS}ms both ease; }

        @keyframes modalFadeIn { from { opacity: 0; transform: translate(-50%, -52%);} to { opacity: 1; transform: translate(-50%,-50%);} }
        @keyframes modalSlideIn { from { opacity: 0; transform: translate(-50%, -40%);} to { opacity: 1; transform: translate(-50%,-50%);} }
        @keyframes modalZoomIn  { from { opacity: 0; transform: translate(-50%,-50%) scale(.96);} to { opacity: 1; transform: translate(-50%,-50%) scale(1);} }
      </style>
      
      <div class="modal-backdrop" id="modalBackdrop"></div>
      
      <canvas class="aurora-canvas" id="auroraCanvas"></canvas>
      
      <div class="particle-layer" id="particleLayer"></div>
      
      <div class="modal-container" id="modalContainer">
        <div class="aurora-overlay" id="auroraOverlay"></div>
        <div class="glow-effect" id="glowEffect"></div>
        
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title" id="modalTitle">
              <slot name="title">Modal Title</slot>
            </h2>
            <button class="modal-close" id="modalClose"></button>
          </div>
          
          <div class="modal-body">
            <slot name="content">
              <p>Modal content goes here...</p>
            </slot>
          </div>
        </div>
      </div>
    `;

    // After render, cache animated elements if needed
  }

  initializeElements() {
    this.elements = {
      backdrop: this.shadowRoot.getElementById('modalBackdrop'),
      canvas: this.shadowRoot.getElementById('auroraCanvas'),
      particleLayer: this.shadowRoot.getElementById('particleLayer'),
      container: this.shadowRoot.getElementById('modalContainer'),
      auroraOverlay: this.shadowRoot.getElementById('auroraOverlay'),
      glowEffect: this.shadowRoot.getElementById('glowEffect'),
      closeButton: this.shadowRoot.getElementById('modalClose'),
      title: this.shadowRoot.getElementById('modalTitle')
    };
    
    // Setup canvas
    this.setupCanvas();
    
    // ARIA setup
    this._setupAria && this._setupAria();
    
    // Sync visibility of canvas/overlay based on animation-type
    const useFluid = this._shouldUseFluid ? this._shouldUseFluid() : (this.getAttribute('animation-type')||'').toLowerCase()==='fluid';
    if (this.elements.canvas)  this.elements.canvas.style.display  = useFluid ? '' : 'none';
    if (this.elements.auroraOverlay) this.elements.auroraOverlay.style.display = useFluid ? 'none' : '';
  }

  _setupAria() {
    const r = this.shadowRoot || this;
    const container = r.getElementById('modalContainer');
    const closeBtn  = r.getElementById('modalClose');
    const titleEl   = r.getElementById('modalTitle');
    if (container) {
      container.setAttribute('role','dialog');
      container.setAttribute('aria-modal','true');
      if (titleEl) {
        if (!titleEl.id) titleEl.id = `modalTitle-${Math.random().toString(36).slice(2)}`;
        container.setAttribute('aria-labelledby', titleEl.id);
      }
      if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex','-1');
    }
    if (closeBtn && !closeBtn.hasAttribute('aria-label')) {
      closeBtn.setAttribute('aria-label','Close modal');
    }
  }

  attachEventListeners() {
    // Close button
    const handleClose = (e) => {
      e.stopPropagation();
      this.hide();
    };
    
    // Backdrop click
    const handleBackdropClick = (e) => {
      if (this.config.closeOnBackdrop && e.target === this.elements.backdrop) {
        this.hide();
      }
    };
    
    // Mouse move glow
    const handleMouseMove = (e) => {
      const rect = this.elements.container.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      this.elements.glowEffect.style.setProperty('--mx', mx + '%');
      this.elements.glowEffect.style.setProperty('--my', my + '%');
    };

    // Esc to close (global safeguard)
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        if (this.getAttribute('close-on-backdrop') !== 'false') this.hide();
      }
    };
    
    this.elements.closeButton.addEventListener('click', handleClose);
    this.elements.backdrop.addEventListener('click', handleBackdropClick);
    this.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeydown);
    
    this.cleanup.push(() => {
      this.elements.closeButton.removeEventListener('click', handleClose);
      this.elements.backdrop.removeEventListener('click', handleBackdropClick);
      this.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeydown);
    });
  }

  setupCanvas() {
    const canvas = this.elements.canvas;
    this.ctx = canvas.getContext('2d');
    
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    this.cleanup.push(() => {
      window.removeEventListener('resize', updateCanvasSize);
    });
  }

  initializeAurora() {
    const colors = this.colorPalettes[this.config.colorPalette] || this.colorPalettes.arctic;
    
    // Create aurora layers
    this.state.auroraLayers = [];
    for (let i = 0; i < 4; i++) {
      const layer = {
        color1: colors[i % colors.length],
        color2: colors[(i + 1) % colors.length],
        color3: colors[(i + 2) % colors.length],
        speed: 0.5 + Math.random() * 1.5,
        angle: Math.random() * 360,
        opacity: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      };
      this.state.auroraLayers.push(layer);
    }
    
    // Create HTML aurora layers
    this.createAuroraLayers();
    
    // Initialize particles
    this.initializeParticles();
  }

  createAuroraLayers() {
    const overlay = this.elements.auroraOverlay;
    overlay.innerHTML = '';
    
    this.state.auroraLayers.forEach((layer, index) => {
      const layerEl = document.createElement('div');
      layerEl.className = 'aurora-layer';
      layerEl.style.setProperty('--color1', layer.color1 + '40');
      layerEl.style.setProperty('--color2', layer.color2 + '60');
      layerEl.style.setProperty('--color3', layer.color3 + '30');
      layerEl.style.setProperty('--angle', layer.angle + 'deg');
      layerEl.style.setProperty('--duration', (20 / (layer.speed * this.config.auroraSpeed)) + 's');
      layerEl.style.setProperty('--opacity', layer.opacity * this.config.auroraIntensity);
      
      overlay.appendChild(layerEl);
    });
  }

  initializeParticles() {
    const particleLayer = this.elements.particleLayer;
    particleLayer.innerHTML = '';
    
    const colors = this.colorPalettes[this.config.colorPalette] || this.colorPalettes.arctic;
    
    for (let i = 0; i < this.config.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 2 + 1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const speed = Math.random() * 0.5 + 0.2;
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        opacity: 0.5;
        filter: blur(1px);
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        transform: translate(-50%, -50%);
      `;
      particle.dataset.speed = speed;
      particleLayer.appendChild(particle);
    }
  }

  startAnimation() {
    if (this._shouldUseFluid && !this._shouldUseFluid()) return;
    if (this.animationId) return;
    const animate = () => {
      this.renderFluidAurora();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = null;
    }
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  }

  renderFluidAurora() {
    const ctx = this.ctx;
    const canvas = this.elements.canvas;
    if (!ctx || !canvas) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update + draw layers as flowing ribbons
    const t = performance.now() * 0.001 * this.config.auroraSpeed;
    this.state.auroraLayers.forEach((layer, i) => {
      layer.phase += 0.002 * layer.speed * this.config.auroraSpeed;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0.0, this.hexToRgba(layer.color1, 0.25 * this.config.auroraIntensity));
      gradient.addColorStop(0.5, this.hexToRgba(layer.color2, 0.18 * this.config.auroraIntensity));
      gradient.addColorStop(1.0, this.hexToRgba(layer.color3, 0.25 * this.config.auroraIntensity));

      ctx.fillStyle = gradient;
      ctx.beginPath();

      const amp = 60 + 30 * Math.sin(layer.phase + i);
      const yBase = canvas.height * (0.3 + 0.15 * i);
      const k = 0.8 + 0.2 * Math.cos(layer.phase);

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

    // Particles drift
    const particles = this.elements.particleLayer?.children || [];
    for (const p of particles) {
      const s = parseFloat(p.dataset.speed || '0.3');
      const x = (parseFloat(p.style.left) || 50) + s * 0.05;
      const y = (parseFloat(p.style.top) || 50) + Math.sin(t * 0.5) * 0.02;
      p.style.left = (x % 100) + '%';
      p.style.top  = (y % 100) + '%';
    }
  }

  updateInteractiveEffects(e) {
    // placeholder for future advanced interactions
  }

  parseAttributes() {
    const boolAttr = (name, def=true) => {
      const v = this.getAttribute(name);
      if (v === null) return def; // not present
      if (v === '' || v === 'true') return true;
      if (v === 'false') return false;
      return def;
    };

    this.config.open           = this.hasAttribute('open');
    this.config.size           = this.getAttribute('size') || this.config.size;
    this.config.auroraIntensity= parseFloat(this.getAttribute('aurora-intensity')) || this.config.auroraIntensity;
    this.config.auroraSpeed    = parseFloat(this.getAttribute('aurora-speed')) || this.config.auroraSpeed;
    this.config.colorPalette   = this.getAttribute('color-palette') || this.config.colorPalette;
    this.config.backdropBlur   = boolAttr('backdrop-blur', this.config.backdropBlur);
    this.config.closeOnBackdrop= boolAttr('close-on-backdrop', this.config.closeOnBackdrop);
    this.config.particleCount  = parseInt(this.getAttribute('particle-count') || this.config.particleCount, 10);
    this.config.animationType  = this.getAttribute('animation-type') || this.config.animationType;
    this.config.glowIntensity  = parseFloat(this.getAttribute('glow-intensity')) || this.config.glowIntensity;
  }

  updateCanvasSize() {
    const canvas = this.elements.canvas;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  show(entranceType = (this.getAttribute('entrance-animation') || 'fade')) {
    if (this.state.isAnimating) return;
    // Remember last active element
    this._lastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    
    this.state.isAnimating = true;
    this.config.open = true;
    this.setAttribute('open', '');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add entrance animation class
    this.elements.container.classList.add(`entrance-${entranceType}`);
    
    // Show modal
    this.classList.add('show');
    
    // Start fluid loop conditionally
    if (this._shouldUseFluid && this._shouldUseFluid()) this.startAnimation();
    // Enable focus trap
    this._enableFocusTrap && this._enableFocusTrap();
    
    this.openTimeout = setTimeout(() => {
      this.state.isAnimating = false;
      this.elements.container.classList.remove(`entrance-${entranceType}`);
    }, this.constructor.ENTER_MS || 600);
    
    // Emit open event
    this.dispatchEvent(new CustomEvent('modal-open', {
      detail: { modal: this }
    }));
  }

  hide() {
    if (this.state.isAnimating || !this.config.open) return;
    
    this.state.isAnimating = true;
    this.config.open = false;
    this.removeAttribute('open');
    
    // Hide modal
    this.classList.remove('show');
    
    // Stop fluid loop and remove focus trap
    this.stopAnimation && this.stopAnimation();
    this._disableFocusTrap && this._disableFocusTrap();
    
    this.closeTimeout = setTimeout(() => {
      this.state.isAnimating = false;
      document.body.style.overflow = '';
    }, this.constructor.EXIT_MS || 400);
    
    // Restore focus to opener
    if (this._lastActiveElement && document.contains(this._lastActiveElement)) {
      this._lastActiveElement.focus({ preventScroll: true });
    }
    this._lastActiveElement = null;
    
    // Emit close event
    this.dispatchEvent(new CustomEvent('modal-close', {
      detail: { modal: this }
    }));
  }

  updateStyling() {
    // Re-render pentru actualizare styling
    this.render();
    this.initializeElements();
    this.attachEventListeners();
    this.initializeAurora();
  }

  // Utility functions
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
      '0, 255, 255';
  }

  hexToRgba(hex, alpha) {
    const rgb = this.hexToRgb(hex).split(',').map(v => parseInt(v.trim(), 10));
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
  }

  setTitle(title) {
    const titleSlot = this.querySelector('[slot="title"]');
    if (titleSlot) titleSlot.textContent = title;
  }

  setContent(content) {
    const contentSlot = this.querySelector('[slot="content"]');
    if (contentSlot) {
      if (typeof content === 'string') {
        contentSlot.innerHTML = content;
      } else {
        contentSlot.innerHTML = '';
        contentSlot.appendChild(content);
      }
    }
  }

  // ——— A11y: focus trap + restore
  _lastActiveElement = null;
  _focusTrapHandler = null;

  _getFocusable() {
    const root = this.shadowRoot || this;
    const sel = [
      'a[href]','area[href]','button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])','textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])','[contenteditable]'
    ].join(',');
    return Array.from(root.querySelectorAll(sel))
      .filter(el => el.offsetParent !== null || el.getClientRects().length);
  }

  _enableFocusTrap() {
    const nodes = this._getFocusable();
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    queueMicrotask(() => {
      this.elements?.container?.setAttribute?.('tabindex','-1');
      this.elements?.container?.focus?.({ preventScroll: true });
    });
    this._focusTrapHandler = (ev) => {
      if (ev.key === 'Tab') {
        const active = this.shadowRoot?.activeElement || document.activeElement;
        if (!ev.shiftKey && active === last) { ev.preventDefault(); first.focus(); }
        else if (ev.shiftKey && active === first) { ev.preventDefault(); last.focus(); }
      } else if (ev.key === 'Escape') {
        if (this.getAttribute('close-on-backdrop') !== 'false') this.hide?.();
      }
    };
    (this.shadowRoot || this).addEventListener('keydown', this._focusTrapHandler, true);
  }

  _disableFocusTrap() {
    if (this._focusTrapHandler) {
      (this.shadowRoot || this).removeEventListener('keydown', this._focusTrapHandler, true);
      this._focusTrapHandler = null;
    }
  }

  _shouldUseFluid() {
    return (this.config?.animationType || (this.getAttribute('animation-type')||'')).toLowerCase() === 'fluid';
  }
}

customElements.define('l-aurora-modal', LAuroraModal);
