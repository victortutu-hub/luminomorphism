// l-quantum-toggle.js - Toggle switch cu efecte de superpoziție cuantică
class LQuantumToggle extends HTMLElement {
  static get observedAttributes() {
    return [
      'checked', 'disabled', 'size', 'color-on', 'color-off', 
      'quantum-mode', 'transition-speed', 'particle-count', 
      'superposition-enabled', 'label', 'glow-intensity'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Configuration
    this.config = {
      checked: false,
      disabled: false,
      size: 'medium', // small, medium, large
      colorOn: '#00ff80',
      colorOff: '#ff4444',
      quantumMode: true,
      transitionSpeed: 1.0,
      particleCount: 8,
      superpositionEnabled: true,
      label: '',
      glowIntensity: 1.0
    };
    
    // State
    this.state = {
      isTransitioning: false,
      superpositionPhase: 0,
      particles: [],
      quantumField: 0,
      waveFunctions: []
    };
    
    // DOM elements
    this.elements = {};
    
    // Animation
    this.animationId = null;
    this.transitionTimeout = null;
    
    // Cleanup
    this.cleanup = [];
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
    this.initializeElements();
    this.attachEventListeners();
    this.initializeQuantumField();
    this.startAnimation();
  }

  disconnectedCallback() {
    this.stopAnimation();
    this.cleanup.forEach(fn => fn());
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.parseAttributes();
      if (name === 'checked') {
        this.updateToggleState();
      } else {
        this.updateStyling();
      }
    }
  }

  parseAttributes() {
    this.config.checked = this.hasAttribute('checked');
    this.config.disabled = this.hasAttribute('disabled');
    this.config.size = this.getAttribute('size') || 'medium';
    this.config.colorOn = this.getAttribute('color-on') || '#00ff80';
    this.config.colorOff = this.getAttribute('color-off') || '#ff4444';
    this.config.quantumMode = this.getAttribute('quantum-mode') !== 'false';
    this.config.transitionSpeed = parseFloat(this.getAttribute('transition-speed')) || 1.0;
    this.config.particleCount = parseInt(this.getAttribute('particle-count')) || 8;
    this.config.superpositionEnabled = this.getAttribute('superposition-enabled') !== 'false';
    this.config.label = this.getAttribute('label') || '';
    this.config.glowIntensity = parseFloat(this.getAttribute('glow-intensity')) || 1.0;
  }

  render() {
    const { size, colorOn, colorOff, label, disabled } = this.config;
    
    // Size mappings
    const sizes = {
      small: { width: '40px', height: '20px', thumb: '16px' },
      medium: { width: '60px', height: '30px', thumb: '24px' },
      large: { width: '80px', height: '40px', thumb: '32px' }
    };
    
    const sizeConfig = sizes[size] || sizes.medium;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          opacity: ${disabled ? '0.6' : '1'};
          user-select: none;
        }
        
        .toggle-label {
          font-size: 0.9rem;
          color: #ffffff;
          opacity: 0.9;
          font-weight: 500;
        }
        
        .toggle-container {
          position: relative;
          width: ${sizeConfig.width};
          height: ${sizeConfig.height};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
        }
        
        .toggle-track {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            rgba(255,68,68,0.3) 0%, 
            rgba(0,255,128,0.3) 100%);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: ${parseInt(sizeConfig.height) / 2}px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        
        .toggle-track.on {
          background: linear-gradient(90deg, 
            ${colorOn}40 0%, 
            ${colorOn}20 100%);
          border-color: ${colorOn}60;
          box-shadow: 
            0 0 20px ${colorOn}30,
            inset 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .toggle-track.off {
          background: linear-gradient(90deg, 
            ${colorOff}40 0%, 
            ${colorOff}20 100%);
          border-color: ${colorOff}60;
          box-shadow: 
            0 0 20px ${colorOff}30,
            inset 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .quantum-field {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background: radial-gradient(circle, transparent 40%, rgba(255,255,255,0.05) 100%);
          border-radius: ${parseInt(sizeConfig.height) / 2 + 10}px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .quantum-field.active {
          opacity: 1;
          animation: quantumPulse 2s ease-in-out infinite;
        }
        
        .toggle-thumb {
          position: absolute;
          top: 50%;
          left: 3px;
          width: ${sizeConfig.thumb};
          height: ${sizeConfig.thumb};
          background: linear-gradient(135deg, #ffffff, #f0f0f0);
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 50%;
          transform: translateY(-50%);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 
            0 4px 12px rgba(0,0,0,0.15),
            0 2px 4px rgba(0,0,0,0.1);
          z-index: 10;
        }
        
        .toggle-thumb.on {
          left: calc(100% - ${sizeConfig.thumb} - 3px);
          background: linear-gradient(135deg, ${colorOn}, ${colorOn}cc);
          border-color: ${colorOn};
          box-shadow: 
            0 4px 16px rgba(0,0,0,0.2),
            0 0 24px ${colorOn}60,
            inset 0 1px 2px rgba(255,255,255,0.3);
        }
        
        .toggle-thumb.off {
          left: 3px;
          background: linear-gradient(135deg, ${colorOff}, ${colorOff}cc);
          border-color: ${colorOff};
          box-shadow: 
            0 4px 16px rgba(0,0,0,0.2),
            0 0 24px ${colorOff}60,
            inset 0 1px 2px rgba(255,255,255,0.3);
        }
        
        .toggle-thumb.superposition {
          animation: superpositionFlicker 0.8s ease-in-out;
          background: linear-gradient(135deg, 
            ${colorOff} 0%, 
            #ffffff 30%,
            ${colorOn} 60%,
            #ffffff 100%);
          box-shadow: 
            0 4px 20px rgba(0,0,0,0.25),
            0 0 30px rgba(255,255,255,0.6),
            0 0 40px ${colorOn}40,
            0 0 40px ${colorOff}40;
        }
        
        .quantum-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #ffffff;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
          z-index: 5;
        }
        
        .wave-function {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255,255,255,0.6) 50%, 
            transparent 100%);
          transform: translateY(-50%);
          opacity: 0;
          pointer-events: none;
          z-index: 3;
        }
        
        .wave-function.active {
          opacity: 1;
          animation: waveMotion 1s ease-in-out;
        }
        
        .transition-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, 
            rgba(255,255,255,0.8) 0%, 
            transparent 70%);
          border-radius: ${parseInt(sizeConfig.height) / 2}px;
          opacity: 0;
          pointer-events: none;
          z-index: 8;
        }
        
        .transition-effect.active {
          opacity: 1;
          animation: transitionFlash 0.6s ease-out;
        }
        
        @keyframes quantumPulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.3; 
          }
          50% { 
            transform: scale(1.05) rotate(180deg); 
            opacity: 0.6; 
          }
        }
        
        @keyframes superpositionFlicker {
          0% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 50% 0%; }
          75% { background-position: 50% 100%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes waveMotion {
          0% { 
            transform: translateY(-50%) scaleX(0); 
            opacity: 0; 
          }
          50% { 
            transform: translateY(-50%) scaleX(1); 
            opacity: 1; 
          }
          100% { 
            transform: translateY(-50%) scaleX(0); 
            opacity: 0; 
          }
        }
        
        @keyframes transitionFlash {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(2); }
        }
        
        @keyframes particleFloat {
          0% { 
            opacity: 0; 
            transform: translate(0, 0) scale(0.5); 
          }
          50% { 
            opacity: 1; 
            transform: translate(var(--dx), var(--dy)) scale(1); 
          }
          100% { 
            opacity: 0; 
            transform: translate(var(--dx2), var(--dy2)) scale(0.3); 
          }
        }
        
        /* Hover effects */
        .toggle-container:hover .toggle-thumb {
          transform: translateY(-50%) scale(1.05);
        }
        
        .toggle-container:hover .quantum-field {
          opacity: 0.8;
        }
        
        /* Focus styles */
        :host(:focus-within) .toggle-track {
          outline: 2px solid rgba(255,255,255,0.5);
          outline-offset: 2px;
        }
        
        /* Disabled state */
        :host([disabled]) .toggle-track {
          filter: grayscale(1);
          opacity: 0.6;
        }
        
        :host([disabled]) .toggle-thumb {
          filter: grayscale(1);
        }
      </style>
      
      <div class="toggle-container" id="toggleContainer">
        <div class="quantum-field" id="quantumField"></div>
        <div class="toggle-track ${this.config.checked ? 'on' : 'off'}" id="toggleTrack">
          <div class="wave-function" id="waveFunction"></div>
          <div class="transition-effect" id="transitionEffect"></div>
        </div>
        <div class="toggle-thumb ${this.config.checked ? 'on' : 'off'}" id="toggleThumb"></div>
      </div>
      
      ${label ? `<span class="toggle-label">${label}</span>` : ''}
    `;
  }

  initializeElements() {
    this.elements = {
      container: this.shadowRoot.getElementById('toggleContainer'),
      track: this.shadowRoot.getElementById('toggleTrack'),
      thumb: this.shadowRoot.getElementById('toggleThumb'),
      quantumField: this.shadowRoot.getElementById('quantumField'),
      waveFunction: this.shadowRoot.getElementById('waveFunction'),
      transitionEffect: this.shadowRoot.getElementById('transitionEffect')
    };
    
    // Make focusable
    this.setAttribute('tabindex', '0');
  }

  attachEventListeners() {
    const handleClick = (e) => this.handleClick(e);
    const handleKeydown = (e) => this.handleKeydown(e);
    const handleFocus = (e) => this.handleFocus(e);
    const handleBlur = (e) => this.handleBlur(e);
    
    this.addEventListener('click', handleClick);
    this.addEventListener('keydown', handleKeydown);
    this.addEventListener('focus', handleFocus);
    this.addEventListener('blur', handleBlur);
    
    this.cleanup.push(() => {
      this.removeEventListener('click', handleClick);
      this.removeEventListener('keydown', handleKeydown);
      this.removeEventListener('focus', handleFocus);
      this.removeEventListener('blur', handleBlur);
    });
  }

  handleClick(e) {
    if (this.config.disabled) return;
    
    e.preventDefault();
    this.toggle();
  }

  handleKeydown(e) {
    if (this.config.disabled) return;
    
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.toggle();
    }
  }

  handleFocus(e) {
    if (this.config.quantumMode) {
      this.elements.quantumField.classList.add('active');
    }
  }

  handleBlur(e) {
    this.elements.quantumField.classList.remove('active');
  }

  toggle() {
    if (this.state.isTransitioning) return;
    
    this.config.checked = !this.config.checked;
    
    if (this.config.checked) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
    
    this.performQuantumTransition();
    
    // Emit change event
    this.dispatchEvent(new CustomEvent('change', {
      detail: { checked: this.config.checked },
      bubbles: true
    }));
  }

  performQuantumTransition() {
    if (!this.config.quantumMode) {
      this.updateToggleState();
      return;
    }
    
    this.state.isTransitioning = true;
    
    // Start superposition effect
    if (this.config.superpositionEnabled) {
      this.enterSuperposition();
    }
    
    // Trigger wave function collapse
    this.triggerWaveCollapse();
    
    // Create quantum particles
    this.createQuantumParticles();
    
    // Transition effect
    this.elements.transitionEffect.classList.add('active');
    setTimeout(() => {
      this.elements.transitionEffect.classList.remove('active');
    }, 600);
    
    // Complete transition
    const transitionDuration = 800 / this.config.transitionSpeed;
    this.transitionTimeout = setTimeout(() => {
      this.completeTransition();
    }, transitionDuration);
  }

  enterSuperposition() {
    this.elements.thumb.classList.add('superposition');
    
    // Quantum field activation
    this.elements.quantumField.classList.add('active');
    
    setTimeout(() => {
      this.elements.thumb.classList.remove('superposition');
      this.elements.quantumField.classList.remove('active');
    }, 800 / this.config.transitionSpeed);
  }

  triggerWaveCollapse() {
    this.elements.waveFunction.classList.add('active');
    
    setTimeout(() => {
      this.elements.waveFunction.classList.remove('active');
    }, 1000 / this.config.transitionSpeed);
  }

  createQuantumParticles() {
    const container = this.elements.container;
    const particleCount = this.config.particleCount;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'quantum-particle';
      
      // Random starting position within toggle
      const startX = Math.random() * container.offsetWidth;
      const startY = Math.random() * container.offsetHeight;
      
      // Random movement vectors
      const dx = (Math.random() - 0.5) * 40;
      const dy = (Math.random() - 0.5) * 40;
      const dx2 = dx * 2;
      const dy2 = dy * 2;
      
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      particle.style.setProperty('--dx2', `${dx2}px`);
      particle.style.setProperty('--dy2', `${dy2}px`);
      particle.style.background = this.config.checked ? this.config.colorOn : this.config.colorOff;
      particle.style.animation = `particleFloat ${1.5 / this.config.transitionSpeed}s ease-out`;
      
      container.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, (1.5 * 1000) / this.config.transitionSpeed);
    }
  }

  completeTransition() {
    this.updateToggleState();
    this.state.isTransitioning = false;
  }

  updateToggleState() {
    const { thumb, track } = this.elements;
    
    if (this.config.checked) {
      thumb.classList.remove('off');
      thumb.classList.add('on');
      track.classList.remove('off');
      track.classList.add('on');
    } else {
      thumb.classList.remove('on');
      thumb.classList.add('off');
      track.classList.remove('on');
      track.classList.add('off');
    }
  }

  updateStyling() {
    // Re-render pentru actualizare styling
    this.render();
    this.initializeElements();
    this.attachEventListeners();
    this.updateToggleState();
  }

  initializeQuantumField() {
    if (!this.config.quantumMode) return;
    
    // Initialize wave functions
    this.state.waveFunctions = Array.from({ length: 3 }, (_, i) => ({
      amplitude: Math.random() * 0.5 + 0.3,
      frequency: (i + 1) * 0.1,
      phase: Math.random() * Math.PI * 2
    }));
  }

  startAnimation() {
    if (!this.config.quantumMode) return;
    
    const animate = () => {
      this.state.quantumField += 0.02;
      
      // Update quantum field visualization
      if (this.elements.quantumField.classList.contains('active')) {
        const intensity = Math.sin(this.state.quantumField) * 0.3 + 0.7;
        this.elements.quantumField.style.opacity = intensity * this.config.glowIntensity;
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }
  }

  // Public API
  check() {
    if (!this.config.checked) {
      this.toggle();
    }
  }

  uncheck() {
    if (this.config.checked) {
      this.toggle();
    }
  }

  isChecked() {
    return this.config.checked;
  }

  enable() {
    this.config.disabled = false;
    this.removeAttribute('disabled');
    this.style.opacity = '1';
    this.style.cursor = 'pointer';
  }

  disable() {
    this.config.disabled = true;
    this.setAttribute('disabled', '');
    this.style.opacity = '0.6';
    this.style.cursor = 'not-allowed';
  }
}

customElements.define('l-quantum-toggle', LQuantumToggle);