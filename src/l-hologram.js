// l-hologram.js

/*
 * LHologram
 *
 * This custom element displays its slotted content as a "hologram" floating
 * above the page. It reacts to mouse movement by tilting and translates
 * slightly along the Z‑axis, and it can optionally emit a coloured glow.
 *
 * Attributes:
 * - glow: hex colour for the holographic glow (default: #00ffff)
 * - depth: maximum rotation in degrees (default: 10)
 *
 * Usage:
 *   <l-hologram glow="#ff00ff" depth="15">
 *     <img src="/path/to/image.png" alt="">
 *   </l-hologram>
 */

class LHologram extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
  }

  static get observedAttributes() {
    return ['glow', 'depth'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'glow') {
      this.glowColor = newValue || '#00ffff';
      this._updateGlow();
    }
    if (name === 'depth') {
      const d = parseFloat(newValue);
      this.depth = isNaN(d) ? 10 : d;
    }
  }

  connectedCallback() {
    this.glowColor = this.getAttribute('glow') || '#00ffff';
    const depthAttr = this.getAttribute('depth');
    const d = parseFloat(depthAttr);
    this.depth = isNaN(d) ? 10 : d;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'hologram-wrapper';
    // Create content slot
    const slot = document.createElement('slot');
    slot.className = 'hologram-content';
    wrapper.appendChild(slot);
    // Create glow overlay
    const glow = document.createElement('div');
    glow.className = 'hologram-glow';
    wrapper.appendChild(glow);

    // Styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: inline-block;
        position: relative;
        perspective: 800px;
      }
      .hologram-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        transition: transform 0.2s ease;
      }
      .hologram-content::slotted(*) {
        display: block;
        backface-visibility: hidden;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      }
      .hologram-glow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        pointer-events: none;
        mix-blend-mode: screen;
        opacity: 0.6;
      }
    `;
    this.shadow.appendChild(style);
    this.shadow.appendChild(wrapper);

    // Cache references
    this._wrapper = wrapper;
    this._glow = glow;
    this._slot = slot;

    // Set initial glow colour
    this._updateGlow();

    // Set up event listeners
    this.addEventListener('mousemove', this._onMouseMove);
    this.addEventListener('mouseleave', this._onMouseLeave);
  }

  disconnectedCallback() {
    this.removeEventListener('mousemove', this._onMouseMove);
    this.removeEventListener('mouseleave', this._onMouseLeave);
  }

  _updateGlow() {
    if (!this._glow) return;
    const c = this.glowColor;
    this._glow.style.background = `radial-gradient(circle at center, ${c}66, ${c}00)`;
  }

  _onMouseMove(e) {
    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = x * this.depth;
    const rotateX = -y * this.depth;
    const translateZ = 20; // constant pop‑out distance
    this._wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
    // Move glow slightly opposite to rotation for parallax effect
    this._glow.style.transform = `translate(${ -x * 10 }px, ${ y * 10 }px)`;
  }

  _onMouseLeave() {
    this._wrapper.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    this._glow.style.transform = '';
  }
}

customElements.define('l-hologram', LHologram);