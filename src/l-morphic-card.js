// l-morphic-card.js - Card cu efecte luminomorfice și interacțiune magnetică
class LMorphicCard extends HTMLElement {
  static get observedAttributes() {
    return [
      'magnetic', 'flip-enabled', 'glow-color', 'depth', 
      'attraction-strength', 'hover-lift', 'click-effect'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // State management
    this.state = {
      isHovered: false,
      isFlipped: false,
      isPressed: false,
      mouseX: 0,
      mouseY: 0
    };
    
    // Config cu default values
    this.config = {
      magnetic: true,
      flipEnabled: false,
      glowColor: '#00ffff',
      depth: 1.0,
      attractionStrength: 0.3,
      hoverLift: 10,
      clickEffect: true
    };
    
    // Tracking pentru cleanup
    this.eventListeners = [];
    this.animationFrameId = null;
    this.ripples = [];
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
    this.attachEventListeners();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.parseAttributes();
      this.updateStyles();
    }
  }

  parseAttributes() {
    this.config.magnetic = this.getAttribute('magnetic') !== 'false';
    this.config.flipEnabled = this.getAttribute('flip-enabled') === 'true';
    this.config.glowColor = this.getAttribute('glow-color') || '#00ffff';
    this.config.depth = parseFloat(this.getAttribute('depth')) || 1.0;
    this.config.attractionStrength = parseFloat(this.getAttribute('attraction-strength')) || 0.3;
    this.config.hoverLift = parseFloat(this.getAttribute('hover-lift')) || 10;
    this.config.clickEffect = this.getAttribute('click-effect') !== 'false';
  }

  render() {
    const { glowColor, flipEnabled } = this.config;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          perspective: 1000px;
          cursor: pointer;
        }
        
        .card-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 200px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
          border-radius: 16px;
        }
        
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 16px;
          background: linear-gradient(135deg, 
            rgba(255,255,255,0.1) 0%, 
            rgba(255,255,255,0.05) 50%,
            rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          overflow: hidden;
          backface-visibility: hidden;
          box-shadow: 
            0 8px 32px rgba(0,0,0,0.3),
            inset 0 1px 1px rgba(255,255,255,0.1);
        }
        
        .card-front {
          transform: rotateY(0deg);
        }
        
        .card-back {
          transform: rotateY(180deg);
          display: ${flipEnabled ? 'block' : 'none'};
        }
        
        .card-content {
          position: relative;
          padding: 24px;
          height: 100%;
          z-index: 2;
        }
        
        .glow-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          pointer-events: none;
          border-radius: 16px;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        
        .magnetic-indicator {
          position: absolute;
          width: 6px;
          height: 6px;
          background: ${glowColor};
          border-radius: 50%;
          opacity: 0;
          transition: all 0.2s ease;
          box-shadow: 0 0 10px ${glowColor};
          z-index: 3;
        }
        
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, ${glowColor}40 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
          animation: ripple-expand 0.8s ease-out forwards;
        }
        
        @keyframes ripple-expand {
          0% {
            transform: scale(0);
            opacity: 0.6;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .card-content {
            padding: 16px;
          }
        }
      </style>
      
      <div class="card-container" id="cardContainer">
        <div class="card-face card-front" id="cardFront">
          <div class="glow-overlay" id="glowOverlay"></div>
          <div class="magnetic-indicator" id="magneticIndicator"></div>
          <div class="card-content">
            <slot name="front">
              <h3>Card Title</h3>
              <p>Default front content</p>
            </slot>
          </div>
        </div>
        
        <div class="card-face card-back" id="cardBack">
          <div class="glow-overlay"></div>
          <div class="card-content">
            <slot name="back">
              <h3>Back Side</h3>
              <p>Default back content</p>
            </slot>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const cardContainer = this.shadowRoot.getElementById('cardContainer');
    
    const handlers = {
      mouseenter: (e) => this.handleMouseEnter(e),
      mouseleave: (e) => this.handleMouseLeave(e),
      mousemove: (e) => this.handleMouseMove(e),
      click: (e) => this.handleClick(e),
      mousedown: (e) => this.handleMouseDown(e),
      mouseup: (e) => this.handleMouseUp(e)
    };
    
    Object.entries(handlers).forEach(([event, handler]) => {
      cardContainer.addEventListener(event, handler);
      this.eventListeners.push({ element: cardContainer, event, handler });
    });
    
    // Global mouse up pentru cazul când mouse-ul iese din card
    const globalMouseUp = (e) => this.handleMouseUp(e);
    document.addEventListener('mouseup', globalMouseUp);
    this.eventListeners.push({ element: document, event: 'mouseup', handler: globalMouseUp });
  }

  handleMouseEnter(e) {
    this.state.isHovered = true;
    this.updateCardAppearance();
    this.showMagneticIndicator();
    
    // Emit custom event
    this.dispatchEvent(new CustomEvent('card-hover', { 
      detail: { hovered: true } 
    }));
  }

  handleMouseLeave(e) {
    this.state.isHovered = false;
    this.state.mouseX = 0;
    this.state.mouseY = 0;
    this.updateCardAppearance();
    this.hideMagneticIndicator();
    
    this.dispatchEvent(new CustomEvent('card-hover', { 
      detail: { hovered: false } 
    }));
  }

  handleMouseMove(e) {
    if (!this.state.isHovered) return;
    
    const rect = this.getBoundingClientRect();
    this.state.mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
    this.state.mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
    
    this.updateCardAppearance();
    this.updateMagneticIndicator(e.clientX - rect.left, e.clientY - rect.top);
    this.updateGlowEffect(e.clientX - rect.left, e.clientY - rect.top);
  }

  handleClick(e) {
    if (this.config.flipEnabled) {
      this.flip();
    }
    
    if (this.config.clickEffect) {
      this.createClickRipple(e);
    }
    
    this.dispatchEvent(new CustomEvent('card-click', { 
      detail: { 
        flipped: this.state.isFlipped,
        mouseX: this.state.mouseX,
        mouseY: this.state.mouseY
      } 
    }));
  }

  handleMouseDown(e) {
    this.state.isPressed = true;
    this.updateCardAppearance();
  }

  handleMouseUp(e) {
    this.state.isPressed = false;
    this.updateCardAppearance();
  }

  updateCardAppearance() {
    const cardContainer = this.shadowRoot.getElementById('cardContainer');
    const { magnetic, attractionStrength, hoverLift, depth } = this.config;
    const { isHovered, isPressed, mouseX, mouseY } = this.state;
    
    let transform = '';
    let boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
    
    if (isHovered) {
      // Magnetic attraction effect
      if (magnetic) {
        const moveX = mouseX * attractionStrength * 20;
        const moveY = mouseY * attractionStrength * 20;
        const rotateX = mouseY * -10 * depth;
        const rotateY = mouseX * 10 * depth;
        
        transform += `translate3d(${moveX}px, ${moveY - hoverLift}px, 0) `;
        transform += `rotateX(${rotateX}deg) rotateY(${rotateY}deg) `;
      } else {
        transform += `translateZ(${hoverLift}px) `;
      }
      
      // Enhanced shadow on hover
      const shadowIntensity = (Math.abs(mouseX) + Math.abs(mouseY)) * 0.5 + 0.5;
      boxShadow = `
        0 ${20 + hoverLift}px ${60 + hoverLift * 2}px rgba(0,0,0,${0.4 * shadowIntensity}),
        0 0 30px ${this.config.glowColor}33,
        inset 0 1px 1px rgba(255,255,255,0.2)
      `;
    }
    
    if (isPressed) {
      transform += 'scale(0.98) ';
      boxShadow = '0 4px 16px rgba(0,0,0,0.4)';
    }
    
    if (this.state.isFlipped) {
      transform += 'rotateY(180deg) ';
    }
    
    cardContainer.style.transform = transform;
    cardContainer.style.boxShadow = boxShadow;
  }

  showMagneticIndicator() {
    const indicator = this.shadowRoot.getElementById('magneticIndicator');
    if (this.config.magnetic) {
      indicator.style.opacity = '0.7';
    }
  }

  hideMagneticIndicator() {
    const indicator = this.shadowRoot.getElementById('magneticIndicator');
    indicator.style.opacity = '0';
  }

  updateMagneticIndicator(x, y) {
    const indicator = this.shadowRoot.getElementById('magneticIndicator');
    if (this.config.magnetic) {
      indicator.style.left = `${x - 3}px`;
      indicator.style.top = `${y - 3}px`;
    }
  }

  updateGlowEffect(x, y) {
    const glowOverlay = this.shadowRoot.getElementById('glowOverlay');
    const intensity = this.state.isHovered ? 0.3 : 0;
    
    glowOverlay.style.opacity = intensity;
    glowOverlay.style.background = `
      radial-gradient(circle 150px at ${x}px ${y}px, 
        ${this.config.glowColor}20 0%, 
        ${this.config.glowColor}10 40%,
        transparent 70%)
    `;
  }

  createClickRipple(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = `${x - 25}px`;
    ripple.style.top = `${y - 25}px`;
    ripple.style.width = '50px';
    ripple.style.height = '50px';
    
    const cardFront = this.shadowRoot.getElementById('cardFront');
    cardFront.appendChild(ripple);
    
    // Remove ripple după animație
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 800);
  }

  flip() {
    this.state.isFlipped = !this.state.isFlipped;
    this.updateCardAppearance();
    
    this.dispatchEvent(new CustomEvent('card-flip', { 
      detail: { flipped: this.state.isFlipped } 
    }));
  }

  updateStyles() {
    // Re-render dacă se schimbă atributele importante
    const needsRerender = ['glow-color', 'flip-enabled'].some(attr => 
      this.getAttribute(attr) !== this.config[attr.replace('-', '')]
    );
    
    if (needsRerender) {
      this.render();
      this.attachEventListeners();
    }
  }

  // API public pentru control programatic
  reset() {
    this.state.isFlipped = false;
    this.state.isHovered = false;
    this.state.isPressed = false;
    this.updateCardAppearance();
  }

  forceFlip() {
    if (this.config.flipEnabled) {
      this.flip();
    }
  }

  cleanup() {
    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Remove event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
    
    // Clear ripples
    this.ripples = [];
  }
}

customElements.define('l-morphic-card', LMorphicCard);