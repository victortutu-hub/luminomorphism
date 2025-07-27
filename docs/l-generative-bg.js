// l-generative-bg.js

/*
 * LGenerativeBg
 *
 * A custom element that generates an animated, luminous background
 * using a canvas. Particles drift slowly across the canvas and
 * emit radial gradients of light. The colours can be customised via
 * attributes and the animation reacts subtly to mouse movement by
 * attracting particles towards the cursor. This component can be used
 * as a backdrop for hero sections, headers or full‑page backgrounds
 * in websites and applications built with the Luminomorphism library.
 *
 * Attributes:
 * - palette: comma‑separated list of hex colours (default: "#00ffff,#ff00ff,#ffff00")
 * - particleCount: number of luminous particles (default: 20)
 * - speed: base speed multiplier (default: 0.5)
 */

class LGenerativeBg extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.width = 0;
    this.height = 0;
    this.palette = ['#00ffff', '#ff00ff', '#ffff00'];
    this.particleCount = 20;
    this.speed = 0.5;
    this.cursor = { x: null, y: null };
    // Bind methods
    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  static get observedAttributes() {
    return ['palette', 'particlecount', 'speed'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'palette') {
      this.palette = newValue.split(',').map(c => c.trim()).filter(Boolean);
    }
    if (name === 'particlecount') {
      const n = parseInt(newValue);
      if (!isNaN(n) && n > 0) this.particleCount = n;
    }
    if (name === 'speed') {
      const s = parseFloat(newValue);
      if (!isNaN(s) && s > 0) this.speed = s;
    }
  }

  connectedCallback() {
    // Read attributes initially
    if (this.hasAttribute('palette')) {
      this.palette = this.getAttribute('palette').split(',').map(c => c.trim()).filter(Boolean);
    }
    if (this.hasAttribute('particlecount')) {
      const n = parseInt(this.getAttribute('particlecount'));
      if (!isNaN(n) && n > 0) this.particleCount = n;
    }
    if (this.hasAttribute('speed')) {
      const s = parseFloat(this.getAttribute('speed'));
      if (!isNaN(s) && s > 0) this.speed = s;
    }
    // Style canvas
    Object.assign(this.canvas.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      // Place the canvas behind slotted content but above the host background.
      zIndex: '0',
    });
    // Positioning of host element
    const hostStyle = document.createElement('style');
    hostStyle.textContent = `
      :host {
        display: block;
        position: relative;
        overflow: hidden;
      }
    `;
    this.shadow.appendChild(hostStyle);
    this.shadow.appendChild(this.canvas);
    // Generate particles
    this.initParticles();
    // Listen to events
    window.addEventListener('resize', this.resize);
    window.addEventListener('mousemove', this.onMouseMove);
    this.resize();
    this.animate();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousemove', this.onMouseMove);
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const angle = Math.random() * 2 * Math.PI;
    const speedFactor = this.speed + Math.random() * this.speed;
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: Math.cos(angle) * speedFactor,
      vy: Math.sin(angle) * speedFactor,
      color: this.palette[Math.floor(Math.random() * this.palette.length)],
      // Increase default size range for better visibility
      size: 80 + Math.random() * 80,
    };
  }

  resize() {
    const rect = this.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    // (Re)initialize particles to fill the new canvas dimensions
    if (this.width > 0 && this.height > 0) {
      this.initParticles();
    }
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.cursor.x = e.clientX - rect.left;
    this.cursor.y = e.clientY - rect.top;
  }

  updateParticles() {
    for (const p of this.particles) {
      // Move particle
      p.x += p.vx;
      p.y += p.vy;
      // Wrap around edges
      if (p.x < -p.size) p.x = this.width + p.size;
      if (p.x > this.width + p.size) p.x = -p.size;
      if (p.y < -p.size) p.y = this.height + p.size;
      if (p.y > this.height + p.size) p.y = -p.size;
      // Attraction to cursor if within range
      if (this.cursor.x !== null && this.cursor.y !== null) {
        const dx = this.cursor.x - p.x;
        const dy = this.cursor.y - p.y;
        const distSq = dx * dx + dy * dy;
        const range = 200;
        if (distSq < range * range) {
          const force = (1 - Math.sqrt(distSq) / range) * 0.5;
          p.vx += dx * force * 0.0005;
          p.vy += dy * force * 0.0005;
        }
      }
      // Apply slight friction to velocity
      p.vx *= 0.99;
      p.vy *= 0.99;
    }
  }

  drawParticles() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    for (const p of this.particles) {
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      // Increase alpha for greater luminosity
      gradient.addColorStop(0, this.hexToRGBA(p.color, 0.6));
      gradient.addColorStop(1, this.hexToRGBA(p.color, 0));
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  hexToRGBA(hex, alpha = 1) {
    const c = hex.replace('#', '');
    const bigint = parseInt(c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  animate() {
    this.updateParticles();
    this.drawParticles();
    requestAnimationFrame(this.animate);
  }
}

customElements.define('l-generative-bg', LGenerativeBg);