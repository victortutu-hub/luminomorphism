// l-aurora-modal.js - Modal cu efecte de aurora boreală și fundal fluid
class LAuroraModal extends HTMLElement {
  static get observedAttributes() {
    return [
      'open', 'size', 'aurora-intensity', 'aurora-speed', 'color-palette',
      'backdrop-blur', 'close-on-backdrop', 'particle-count', 
      'animation-type', 'glow-intensity'
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
    if (oldValue !== newValue) {
      this.parseAttributes();
      if (name === 'open') {
        if (this.config.open) {
          this.show();
        } else {
          this.hide();
        }
      } else {
        this.updateStyling();
      }
    }
  }

  parseAttributes() {
    this.config.open = this.hasAttribute('open');
    this.config.size = this.getAttribute('size') || 'medium';
    this.config.auroraIntensity = parseFloat(this.getAttribute('aurora-intensity')) || 1.0;
    this.config.auroraSpeed = parseFloat(this.getAttribute('aurora-speed')) || 1.0;
    this.config.colorPalette = this.getAttribute('color-palette') || 'arctic';
    this.config.backdropBlur = this.getAttribute('backdrop-blur') !== 'false';
    this.config.closeOnBackdrop = this.getAttribute('close-on-backdrop') !== 'false';
    this.config.particleCount = parseInt(this.getAttribute('particle-count')) || 20;
    this.config.animationType = this.getAttribute('animation-type') || 'fluid';
    this.config.glowIntensity = parseFloat(this.getAttribute('glow-intensity')) || 1.0;
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
          pointer-events: none;
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
          transform: translate(-50%, -50%) scale(0.7);
          width: ${sizeConfig.width};
          height: ${sizeConfig.height};
          max-width: 95vw;
          max-height: 90vh;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 10;
          cursor: default;
        }
        
        :host(.show) .modal-container {
          transform: translate(-50%, -50%) scale(1);
        }
        
        .modal-content {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0.8) 50%,
            rgba(0, 0, 0, 0.9) 100%);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          overflow: hidden;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 80px rgba(${this.hexToRgb(colors[0])}, 0.2),
            inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }
        
        .modal-header {
          position: relative;
          padding: 24px 24px 0;
          z-index: 20;
        }
        
        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          background: linear-gradient(135deg, ${colors[0]}, ${colors[1]});
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .modal-close {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 20;
        }
        
        .modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
          box-shadow: 0 0 20px ${colors[0]}60;
        }
        
        .modal-close::before,
        .modal-close::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 2px;
          background: #ffffff;
          border-radius: 1px;
        }
        
        .modal-close::before {
          transform: rotate(45deg);
        }
        
        .modal-close::after {
          transform: rotate(-45deg);
        }
        
        .modal-body {
          position: relative;
          padding: 24px;
          height: calc(100% - 80px);
          overflow-y: auto;
          z-index: 20;
          color: #ffffff;
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
        
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: ${colors[0]};
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.8;
          animation: particleFloat linear infinite;
          box-shadow: 0 0 6px currentColor;
        }
        
        .glow-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 16px;
          opacity: 0;
          pointer-events: none;
          z-index: 15;
          transition: opacity 0.3s ease;
        }
        
        .glow-effect.active {
          opacity: 1;
          box-shadow: 
            0 0 40px ${colors[0]}40,
            0 0 80px ${colors[1]}30,
            0 0 120px ${colors[2]}20;
        }
        
        @keyframes auroraFlow {
          0% { 
            transform: translateX(-50%) translateY(-50%) rotate(0deg);
          }
          100% { 
            transform: translateX(-50%) translateY(-50%) rotate(360deg);
          }
        }
        
        @keyframes particleFloat {
          0% {
            transform: translate(0, 100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translate(0, 90vh) scale(1);
          }
          90% {
            opacity: 1;
            transform: translate(var(--drift), 10vh) scale(1);
          }
          100% {
            transform: translate(var(--drift), 0) scale(0);
            opacity: 0;
          }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .modal-container {
            width: 95vw;
            height: 80vh;
            margin: 10px;
          }
          
          .modal-header,
          .modal-body {
            padding: 16px;
          }
          
          .modal-title {
            font-size: 1.3rem;
          }
        }
        
        /* Animation entrance effects */
        .modal-container.entrance-fade {
          animation: fadeInScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .modal-container.entrance-slide {
          animation: slideInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .modal-container.entrance-zoom {
          animation: zoomIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes slideInUp {
          0% {
            opacity: 0;
            transform: translate(-50%, -30%) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes zoomIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.1);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
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
    
    // Mouse movement for interactive effects
    const handleMouseMove = (e) => {
      this.state.mouseX = e.clientX;
      this.state.mouseY = e.clientY;
      this.updateInteractiveEffects();
    };
    
    // Keyboard events
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.hide();
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
      particle.style.left = Math.random() * 100 + '%';
      particle.style.color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDuration = (8 + Math.random() * 12) + 's';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.setProperty('--drift', (Math.random() - 0.5) * 200 + 'px');
      
      particleLayer.appendChild(particle);
    }
  }

  updateInteractiveEffects() {
    if (!this.config.open) return;
    
    // Create glow effect based on mouse position
    const rect = this.getBoundingClientRect();
    const mouseX = this.state.mouseX - rect.left;
    const mouseY = this.state.mouseY - rect.top;
    
    // Activate glow effect when mouse is over modal
    if (mouseX > 0 && mouseX < rect.width && mouseY > 0 && mouseY < rect.height) {
      this.elements.glowEffect.classList.add('active');
    } else {
      this.elements.glowEffect.classList.remove('active');
    }
  }

  renderFluidAurora() {
    if (!this.ctx || !this.config.open) return;
    
    const { canvas, ctx } = this;
    const { auroraIntensity, auroraSpeed } = this.config;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get colors
    const colors = this.colorPalettes[this.config.colorPalette] || this.colorPalettes.arctic;
    
    // Create fluid aurora waves
    const layers = 3;
    for (let layer = 0; layer < layers; layer++) {
      ctx.save();
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const color1 = colors[layer % colors.length];
      const color2 = colors[(layer + 1) % colors.length];
      
      gradient.addColorStop(0, this.hexToRgba(color1, 0));
      gradient.addColorStop(0.3, this.hexToRgba(color1, 0.3 * auroraIntensity));
      gradient.addColorStop(0.7, this.hexToRgba(color2, 0.2 * auroraIntensity));
      gradient.addColorStop(1, this.hexToRgba(color2, 0));
      
      ctx.fillStyle = gradient;
      
      // Create wavy path
      ctx.beginPath();
      const waveHeight = 100 + layer * 50;
      const frequency = 0.01 + layer * 0.005;
      const phase = this.state.wavePhase + layer * Math.PI / 3;
      
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = canvas.height / 2 + 
          Math.sin(x * frequency + phase) * waveHeight +
          Math.sin(x * frequency * 2 + phase * 1.5) * (waveHeight / 3);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
    
    this.state.wavePhase += 0.02 * auroraSpeed;
  }

  startAnimation() {
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
    }
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
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
    const rgb = this.hexToRgb(hex);
    return `rgba(${rgb}, ${alpha})`;
  }

  // Public API
  show(entranceType = 'fade') {
    if (this.state.isAnimating) return;
    
    this.state.isAnimating = true;
    this.config.open = true;
    this.setAttribute('open', '');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add entrance animation class
    this.elements.container.classList.add(`entrance-${entranceType}`);
    
    // Show modal
    this.classList.add('show');
    
    this.openTimeout = setTimeout(() => {
      this.state.isAnimating = false;
      this.elements.container.classList.remove(`entrance-${entranceType}`);
    }, 600);
    
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
    
    this.closeTimeout = setTimeout(() => {
      this.state.isAnimating = false;
      document.body.style.overflow = '';
    }, 400);
    
    // Emit close event
    this.dispatchEvent(new CustomEvent('modal-close', {
      detail: { modal: this }
    }));
  }

  toggle() {
    if (this.config.open) {
      this.hide();
    } else {
      this.show();
    }
  }

  isOpen() {
    return this.config.open;
  }

  setTitle(title) {
    const titleSlot = this.querySelector('[slot="title"]');
    if (titleSlot) {
      titleSlot.textContent = title;
    }
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
}

customElements.define('l-aurora-modal', LAuroraModal);