// l-morphic-slider.js - Slider cu efecte magnetice și urmă luminoasă
class LMorphicSlider extends HTMLElement {
  static get observedAttributes() {
    return [
      'value', 'min', 'max', 'step', 'disabled', 
      'color', 'track-deform', 'trail-enabled', 'magnetic-strength',
      'glow-intensity', 'orientation', 'label'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Configuration
    this.config = {
      value: 50,
      min: 0,
      max: 100,
      step: 1,
      disabled: false,
      color: '#00ffff',
      trackDeform: true,
      trailEnabled: true,
      magneticStrength: 0.3,
      glowIntensity: 1.0,
      orientation: 'horizontal',
      label: ''
    };
    
    // State
    this.state = {
      isDragging: false,
      mouseX: 0,
      mouseY: 0,
      thumbPosition: 0,
      trackDeformation: { points: [], intensity: 0 },
      trail: []
    };
    
    // DOM references
    this.elements = {};
    
    // Animation
    this.animationId = null;
    this.trailCleanupTimeout = null;
    
    // Cleanup tracking
    this.cleanup = [];
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
    this.initializeElements();
    this.attachEventListeners();
    this.updateSlider();
    this.startAnimation();
  }

  disconnectedCallback() {
    this.stopAnimation();
    this.cleanup.forEach(fn => fn());
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.parseAttributes();
      this.updateSlider();
      
      if (name === 'color') {
        this.updateColors();
      }
    }
  }

  parseAttributes() {
    this.config.value = parseFloat(this.getAttribute('value')) || 50;
    this.config.min = parseFloat(this.getAttribute('min')) || 0;
    this.config.max = parseFloat(this.getAttribute('max')) || 100;
    this.config.step = parseFloat(this.getAttribute('step')) || 1;
    this.config.disabled = this.hasAttribute('disabled');
    this.config.color = this.getAttribute('color') || '#00ffff';
    this.config.trackDeform = this.getAttribute('track-deform') !== 'false';
    this.config.trailEnabled = this.getAttribute('trail-enabled') !== 'false';
    this.config.magneticStrength = parseFloat(this.getAttribute('magnetic-strength')) || 0.3;
    this.config.glowIntensity = parseFloat(this.getAttribute('glow-intensity')) || 1.0;
    this.config.orientation = this.getAttribute('orientation') || 'horizontal';
    this.config.label = this.getAttribute('label') || '';
  }

  render() {
    const { color, orientation, label, disabled } = this.config;
    const isVertical = orientation === 'vertical';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: ${isVertical ? '60px' : '300px'};
          height: ${isVertical ? '300px' : '60px'};
          position: relative;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          opacity: ${disabled ? '0.5' : '1'};
          user-select: none;
        }
        
        .slider-container {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: ${isVertical ? 'column' : 'row'};
        }
        
        .slider-label {
          position: absolute;
          ${isVertical ? 'bottom: -25px' : 'top: -25px'};
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.8rem;
          color: ${color};
          font-weight: 500;
          opacity: 0.8;
        }
        
        .track-container {
          position: relative;
          width: ${isVertical ? '8px' : '100%'};
          height: ${isVertical ? '100%' : '8px'};
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          overflow: visible;
        }
        
        .track-svg {
          position: absolute;
          top: -10px;
          left: -10px;
          width: calc(100% + 20px);
          height: calc(100% + 20px);
          pointer-events: none;
          z-index: 1;
        }
        
        .track-path {
          fill: none;
          stroke: rgba(255,255,255,0.1);
          stroke-width: 8;
          transition: stroke 0.3s ease;
        }
        
        .track-active {
          fill: none;
          stroke: ${color};
          stroke-width: 8;
          filter: drop-shadow(0 0 6px ${color}40);
          transition: all 0.3s ease;
        }
        
        .thumb {
          position: absolute;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, ${color}, ${color}cc);
          border: 2px solid #fff;
          border-radius: 50%;
          cursor: ${disabled ? 'not-allowed' : 'grab'};
          z-index: 10;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 
            0 4px 12px rgba(0,0,0,0.3),
            0 0 20px ${color}60,
            inset 0 1px 1px rgba(255,255,255,0.2);
        }
        
        .thumb:hover {
          transform: scale(1.1);
          box-shadow: 
            0 6px 20px rgba(0,0,0,0.4),
            0 0 30px ${color}80,
            inset 0 1px 1px rgba(255,255,255,0.3);
        }
        
        .thumb.dragging {
          transform: scale(1.2);
          cursor: grabbing;
          box-shadow: 
            0 8px 25px rgba(0,0,0,0.5),
            0 0 40px ${color},
            inset 0 1px 1px rgba(255,255,255,0.4);
        }
        
        .trail-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: ${color};
          border-radius: 50%;
          pointer-events: none;
          z-index: 5;
          animation: trail-fade 1s ease-out forwards;
        }
        
        .value-display {
          position: absolute;
          ${isVertical ? 'right: -50px' : 'bottom: -30px'};
          ${isVertical ? 'top: 50%' : 'left: 50%'};
          transform: ${isVertical ? 'translateY(-50%)' : 'translateX(-50%)'};
          font-size: 0.9rem;
          color: ${color};
          font-weight: 600;
          background: rgba(0,0,0,0.7);
          padding: 4px 8px;
          border-radius: 12px;
          border: 1px solid ${color}40;
          backdrop-filter: blur(4px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .value-display.show {
          opacity: 1;
        }
        
        .magnetic-indicator {
          position: absolute;
          width: 8px;
          height: 8px;
          background: ${color};
          border-radius: 50%;
          opacity: 0;
          pointer-events: none;
          z-index: 3;
          box-shadow: 0 0 15px ${color};
          animation: magnetic-pulse 1s ease-in-out infinite;
        }
        
        @keyframes trail-fade {
          0% { 
            opacity: 0.8; 
            transform: scale(1); 
          }
          100% { 
            opacity: 0; 
            transform: scale(0.3); 
          }
        }
        
        @keyframes magnetic-pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.6; 
          }
          50% { 
            transform: scale(1.5); 
            opacity: 0.2; 
          }
        }
        
        /* Vertical orientation adjustments */
        .vertical .track-container {
          width: 8px;
          height: 100%;
        }
        
        /* Accessibility */
        :host(:focus-within) .track-active {
          stroke-width: 10;
          filter: drop-shadow(0 0 8px ${color}60);
        }
        
        /* Disabled state */
        :host([disabled]) .thumb {
          cursor: not-allowed;
          filter: grayscale(1);
        }
        
        :host([disabled]) .track-active {
          filter: grayscale(1);
        }
      </style>
      
      <div class="slider-container ${orientation}">
        ${label ? `<div class="slider-label">${label}</div>` : ''}
        
        <div class="track-container" id="trackContainer">
          <svg class="track-svg" id="trackSvg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path class="track-path" id="trackPath"></path>
            <path class="track-active" id="trackActive"></path>
          </svg>
          
          <div class="thumb" id="thumb"></div>
          <div class="magnetic-indicator" id="magneticIndicator"></div>
        </div>
        
        <div class="value-display" id="valueDisplay">${Math.round(this.config.value)}</div>
      </div>
    `;
  }

  initializeElements() {
    this.elements = {
      container: this.shadowRoot.querySelector('.slider-container'),
      trackContainer: this.shadowRoot.getElementById('trackContainer'),
      trackSvg: this.shadowRoot.getElementById('trackSvg'),
      trackPath: this.shadowRoot.getElementById('trackPath'),
      trackActive: this.shadowRoot.getElementById('trackActive'),
      thumb: this.shadowRoot.getElementById('thumb'),
      magneticIndicator: this.shadowRoot.getElementById('magneticIndicator'),
      valueDisplay: this.shadowRoot.getElementById('valueDisplay')
    };
  }

  attachEventListeners() {
    const { trackContainer, thumb } = this.elements;
    
    // Mouse events
    const handleMouseDown = (e) => this.handleMouseDown(e);
    const handleMouseMove = (e) => this.handleMouseMove(e);
    const handleMouseUp = (e) => this.handleMouseUp(e);
    
    // Touch events
    const handleTouchStart = (e) => this.handleTouchStart(e);
    const handleTouchMove = (e) => this.handleTouchMove(e);
    const handleTouchEnd = (e) => this.handleTouchEnd(e);
    
    // Keyboard events
    const handleKeyDown = (e) => this.handleKeyDown(e);
    
    // Attach listeners
    trackContainer.addEventListener('mousedown', handleMouseDown);
    trackContainer.addEventListener('mousemove', (e) => {
      if (!this.config.disabled) this.updateMagneticEffect(e);
    });
    trackContainer.addEventListener('mouseleave', () => this.clearMagneticEffect());
    
    thumb.addEventListener('mousedown', handleMouseDown);
    thumb.addEventListener('touchstart', handleTouchStart, { passive: false });
    thumb.addEventListener('keydown', handleKeyDown);
    thumb.setAttribute('tabindex', '0');
    
    // Global listeners pentru dragging
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    // Cleanup
    this.cleanup.push(() => {
      trackContainer.removeEventListener('mousedown', handleMouseDown);
      thumb.removeEventListener('mousedown', handleMouseDown);
      thumb.removeEventListener('touchstart', handleTouchStart);
      thumb.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    });
  }

  handleMouseDown(e) {
    if (this.config.disabled) return;
    
    e.preventDefault();
    this.state.isDragging = true;
    this.elements.thumb.classList.add('dragging');
    this.elements.valueDisplay.classList.add('show');
    
    // Dacă click-ul e pe track, mută thumb-ul acolo
    if (e.target === this.elements.trackContainer || e.target.closest('.track-svg')) {
      this.updateValueFromEvent(e);
    }
    
    this.dispatchEvent(new CustomEvent('slide-start', {
      detail: { value: this.config.value }
    }));
  }

  handleMouseMove(e) {
    if (!this.state.isDragging) return;
    
    this.updateValueFromEvent(e);
    this.createTrailParticle();
  }

  handleMouseUp(e) {
    if (!this.state.isDragging) return;
    
    this.state.isDragging = false;
    this.elements.thumb.classList.remove('dragging');
    this.elements.valueDisplay.classList.remove('show');
    
    this.dispatchEvent(new CustomEvent('slide-end', {
      detail: { value: this.config.value }
    }));
  }

  handleTouchStart(e) {
    if (this.config.disabled) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    this.handleMouseDown(touch);
  }

  handleTouchMove(e) {
    if (!this.state.isDragging) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    this.handleMouseMove(touch);
  }

  handleTouchEnd(e) {
    this.handleMouseUp(e);
  }

  handleKeyDown(e) {
    if (this.config.disabled) return;
    
    const { min, max, step } = this.config;
    let newValue = this.config.value;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(max, this.config.value + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(min, this.config.value - step);
        break;
      case 'Home':
        newValue = min;
        break;
      case 'End':
        newValue = max;
        break;
      default:
        return;
    }
    
    e.preventDefault();
    this.setValue(newValue);
    this.createTrailParticle();
  }

  updateValueFromEvent(e) {
    const rect = this.elements.trackContainer.getBoundingClientRect();
    const { min, max, step, orientation } = this.config;
    
    let percentage;
    if (orientation === 'vertical') {
      percentage = 1 - (e.clientY - rect.top) / rect.height;
    } else {
      percentage = (e.clientX - rect.left) / rect.width;
    }
    
    percentage = Math.max(0, Math.min(1, percentage));
    
    let newValue = min + percentage * (max - min);
    
    // Snap to step
    if (step > 0) {
      newValue = Math.round(newValue / step) * step;
    }
    
    this.setValue(newValue);
  }

  updateMagneticEffect(e) {
    if (!this.config.trackDeform) return;
    
    const rect = this.elements.trackContainer.getBoundingClientRect();
    this.state.mouseX = e.clientX - rect.left;
    this.state.mouseY = e.clientY - rect.top;
    
    // Arată magnetic indicator
    const indicator = this.elements.magneticIndicator;
    indicator.style.left = `${this.state.mouseX - 4}px`;
    indicator.style.top = `${this.state.mouseY - 4}px`;
    indicator.style.opacity = '0.6';
  }

  clearMagneticEffect() {
    this.elements.magneticIndicator.style.opacity = '0';
    this.state.trackDeformation.intensity = 0;
  }

  createTrailParticle() {
    if (!this.config.trailEnabled) return;
    
    const thumbRect = this.elements.thumb.getBoundingClientRect();
    const containerRect = this.elements.trackContainer.getBoundingClientRect();
    
    const particle = document.createElement('div');
    particle.className = 'trail-particle';
    particle.style.left = `${thumbRect.left - containerRect.left + 8}px`;
    particle.style.top = `${thumbRect.top - containerRect.top + 8}px`;
    
    this.elements.trackContainer.appendChild(particle);
    
    // Remove după animație
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1000);
  }

  updateSlider() {
    const { value, min, max, orientation } = this.config;
    const percentage = (value - min) / (max - min);
    
    // Update thumb position
    if (orientation === 'vertical') {
      this.elements.thumb.style.bottom = `${percentage * 100}%`;
      this.elements.thumb.style.left = '50%';
      this.elements.thumb.style.transform = 'translate(-50%, 50%)';
    } else {
      this.elements.thumb.style.left = `${percentage * 100}%`;
      this.elements.thumb.style.top = '50%';
      this.elements.thumb.style.transform = 'translate(-50%, -50%)';
    }
    
    // Update track paths
    this.updateTrackPaths(percentage);
    
    // Update value display
    this.elements.valueDisplay.textContent = Math.round(value);
    
    // Emit change event
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.config.value }
    }));
  }

  updateTrackPaths(percentage) {
    const { trackDeform } = this.config;
    const rect = this.elements.trackContainer.getBoundingClientRect();
    
    if (trackDeform && this.state.mouseX && this.state.mouseY) {
      // Calculate magnetic deformation
      const centerY = rect.height / 2;
      const distFromCenter = Math.abs(this.state.mouseY - centerY);
      const maxDeform = 15;
      const deformation = Math.max(0, maxDeform - distFromCenter * 0.5);
      
      // Create curved path
      const startX = 10;
      const endX = rect.width - 10;
      const baseY = rect.height / 2 + 10;
      const curveY = baseY + (this.state.mouseY < centerY ? -deformation : deformation);
      
      const trackPath = `M ${startX} ${baseY} Q ${this.state.mouseX + 10} ${curveY} ${endX} ${baseY}`;
      const activePath = `M ${startX} ${baseY} Q ${this.state.mouseX + 10} ${curveY} ${startX + (endX - startX) * percentage} ${baseY + (curveY - baseY) * (percentage * 2)}`;
      
      this.elements.trackPath.setAttribute('d', trackPath);
      this.elements.trackActive.setAttribute('d', activePath);
    } else {
      // Straight path
      const y = 50;
      this.elements.trackPath.setAttribute('d', `M 10 ${y} L 90 ${y}`);
      this.elements.trackActive.setAttribute('d', `M 10 ${y} L ${10 + 80 * percentage} ${y}`);
    }
  }

  updateColors() {
    const { color } = this.config;
    // Re-render cu noile culori
    this.render();
    this.initializeElements();
    this.attachEventListeners();
    this.updateSlider();
  }

  startAnimation() {
    const animate = () => {
      // Update track deformation cu smooth interpolation
      if (this.config.trackDeform) {
        this.updateTrackPaths((this.config.value - this.config.min) / (this.config.max - this.config.min));
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
    if (this.trailCleanupTimeout) {
      clearTimeout(this.trailCleanupTimeout);
    }
  }

  // Public API
  setValue(newValue) {
    const { min, max, step } = this.config;
    newValue = Math.max(min, Math.min(max, newValue));
    
    if (step > 0) {
      newValue = Math.round(newValue / step) * step;
    }
    
    this.config.value = newValue;
    this.setAttribute('value', newValue);
    this.updateSlider();
  }

  getValue() {
    return this.config.value;
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
    this.style.opacity = '0.5';
    this.style.cursor = 'not-allowed';
  }

  reset() {
    const defaultValue = (this.config.min + this.config.max) / 2;
    this.setValue(defaultValue);
  }
}

customElements.define('l-morphic-slider', LMorphicSlider);