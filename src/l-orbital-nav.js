// l-orbital-nav.js

/*
 * LOrbitalNav
 *
 * A custom element that arranges its child elements (links, buttons or
 * arbitrary content) in a circular orbit around a central point. Each item
 * appears as a luminous bubble and, optionally, the entire set can rotate
 * slowly around the centre. Hovering over a bubble scales it up and
 * intensifies its glow; clicking a bubble dispatches a custom event so
 * consumers can handle navigation or actions. The component is intended
 * for creative navigation menus or eye‑catching interactive elements.
 *
 * Attributes:
 * - radius: radius of the orbit in pixels (default: 120)
 * - speed: rotation period in seconds; 0 disables rotation (default: 20)
 * - size: diameter of each bubble in pixels (default: 80)
 * - colour: base colour for bubbles (default: "#00ffff"); can be overridden
 *   per‑item via data‑colour attribute on the child element
 */

class LOrbitalNav extends HTMLElement {
  static get observedAttributes() {
    return ['radius', 'speed', 'size', 'colour'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    // Default configuration
    this.radius = 120;
    this.speed = 20;
    this.size = 80;
    this.colour = '#00ffff';
    // Internal arrays
    this.items = [];
  }

  connectedCallback() {
    // Parse initial attributes
    this._parseAttributes();
    // Build shadow DOM and layout
    this._render();
  }

  attributeChangedCallback() {
    this._parseAttributes();
    this._render();
  }

  _parseAttributes() {
    if (this.hasAttribute('radius')) {
      const r = parseInt(this.getAttribute('radius'));
      if (!isNaN(r) && r > 0) this.radius = r;
    }
    if (this.hasAttribute('speed')) {
      const s = parseFloat(this.getAttribute('speed'));
      if (!isNaN(s) && s >= 0) this.speed = s;
    }
    if (this.hasAttribute('size')) {
      const sz = parseInt(this.getAttribute('size'));
      if (!isNaN(sz) && sz > 0) this.size = sz;
    }
    if (this.hasAttribute('colour')) {
      const c = this.getAttribute('colour');
      if (c) this.colour = c;
    }
  }

  _clear() {
    while (this.shadow.firstChild) {
      this.shadow.removeChild(this.shadow.firstChild);
    }
  }

  _render() {
    this._clear();
    // Styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: ${this.radius * 2 + this.size}px;
      }
      .wrapper {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 0;
        height: 0;
      }
      .rotator {
        position: relative;
        width: 0;
        height: 0;
        transform-origin: center;
        animation: spin var(--period) linear infinite;
      }
      .bubble {
        position: absolute;
        top: 50%;
        left: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${this.size}px;
        height: ${this.size}px;
        border-radius: 50%;
        cursor: pointer;
        color: white;
        font-family: inherit;
        font-size: 0.9rem;
        text-align: center;
        background: radial-gradient(circle at 50% 40%, var(--bubble-colour) 0%, rgba(0,0,0,0.4) 100%);
        box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 12px 4px var(--bubble-colour)55;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        user-select: none;
        /* Use CSS variables for translation to allow composition with scale */
        transform: translate(var(--x), var(--y)) scale(1);
      }
      .bubble:hover {
        transform: translate(var(--x), var(--y)) scale(1.25);
        box-shadow: 0 6px 18px rgba(0,0,0,0.6), 0 0 20px 8px var(--bubble-colour)aa;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    this.shadow.appendChild(style);
    // Container elements
    const wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    const rotator = document.createElement('div');
    rotator.className = 'rotator';
    // Set rotation duration via CSS custom property; if speed = 0, disable animation
    if (this.speed > 0) {
      rotator.style.setProperty('--period', `${this.speed}s`);
    } else {
      rotator.style.animation = 'none';
    }

    // Build bubbles from children
    const children = Array.from(this.children).filter(n => n.nodeType === Node.ELEMENT_NODE);
    const count = children.length;
    if (count === 0) {
      // If no children, create sample placeholders
      for (let i = 0; i < 5; i++) {
        const placeholder = document.createElement('div');
        placeholder.textContent = 'Item ' + (i + 1);
        children.push(placeholder);
      }
    }
    const step = 360 / children.length;
    children.forEach((child, idx) => {
      const angle = step * idx;
      const rad = (angle * Math.PI) / 180;
      const x = Math.cos(rad) * this.radius;
      const y = Math.sin(rad) * this.radius;
      // Create bubble wrapper
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      // Determine colour: use data-colour attribute on child or global colour
      const col = child.getAttribute && child.getAttribute('data-colour') ? child.getAttribute('data-colour') : this.colour;
      bubble.style.setProperty('--bubble-colour', col);
      // Copy child content into bubble
      // We'll clone the child node and remove its own children to avoid duplicates
      const clone = child.cloneNode(true);
      // Remove styles that may interfere with bubble layout
      clone.style && (clone.style.margin = '0');
      // Append to bubble
      bubble.appendChild(clone);
      // Position bubble using CSS variables for translation. This allows
      // hover states to compose translation with scaling without
      // overriding the inline transform entirely.
      bubble.style.setProperty('--x', `${x}px`);
      bubble.style.setProperty('--y', `${y}px`);
      // Click handler: emit event with index and original child reference
      bubble.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const event = new CustomEvent('bubble-click', {
          detail: {
            index: idx,
            original: child
          },
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);
      });
      rotator.appendChild(bubble);
    });
    wrapper.appendChild(rotator);
    this.shadow.appendChild(wrapper);
  }
}

customElements.define('l-orbital-nav', LOrbitalNav);