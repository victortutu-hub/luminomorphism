// l-glow-trail.js

class LGlowTrail extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.trail = [];
    this.color = this.getAttribute('color') || '#00ffff';
    this.blur = parseInt(this.getAttribute('blur') || 12);
    this.density = parseFloat(this.getAttribute('density') || 1);
    this.fade = parseFloat(this.getAttribute('fade') || 0.95);

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    const style = document.createElement('style');
    style.textContent = `
      canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
        pointer-events: none;
        mix-blend-mode: screen;
      }
    `;

    this.shadow.appendChild(style);
    this.shadow.appendChild(this.canvas);

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    document.addEventListener('mousemove', (e) => this.addPoint(e.clientX, e.clientY));

    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  addPoint(x, y) {
    for (let i = 0; i < this.density; i++) {
      this.trail.push({ x, y, alpha: 1 });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.trail.forEach((p, i) => {
      ctx.beginPath();
      ctx.fillStyle = this.hexToRGBA(this.color, p.alpha);
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.blur;
      ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      p.alpha *= this.fade;
    });

    this.trail = this.trail.filter(p => p.alpha > 0.01);
  }

  hexToRGBA(hex, alpha = 1) {
    const c = hex.replace('#', '');
    const bigint = parseInt(c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }
}

customElements.define('l-glow-trail', LGlowTrail);
