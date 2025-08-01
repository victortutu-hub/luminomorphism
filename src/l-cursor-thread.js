// Versiune extinsă l-cursor-thread cu suport pentru moduri: solid, glow, wave, laser, aura, particles
class LCursorThread extends HTMLElement {
  constructor() {
    super();
    this.target = null;
    this.canvas = null;
    this.ctx = null;
    this.mouse = { x: 0, y: 0 };
    this.mode = 'solid';
    this.particleProgress = 0;
  }

  static get observedAttributes() {
    return ['mode'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'mode') {
      this.mode = newValue || 'solid';
      console.log('Thread mode changed to:', this.mode);
    }
  }

  connectedCallback() {
    this.mode = this.getAttribute('mode') || 'solid';
    this.render();
    this.observeTargets();
    window.addEventListener('mousemove', this.updateMouse.bind(this));
    requestAnimationFrame(this.animate.bind(this));
  }

  disconnectedCallback() {
    window.removeEventListener('mousemove', this.updateMouse);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }

  render() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = 0;
    this.canvas.style.left = 0;
    this.canvas.style.zIndex = 9999;
    this.canvas.style.pointerEvents = 'none';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);

    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  }

  observeTargets() {
    setTimeout(() => {
      const elements = [...document.querySelectorAll('button, input, textarea, [tabindex]')];
      elements.forEach(el => {
        el.addEventListener('mouseenter', () => this.target = el);
        el.addEventListener('mouseleave', () => this.target = null);
      });
    }, 0);
  }

  updateMouse(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.target) return;

    const rect = this.target.getBoundingClientRect();
    const tx = rect.left + rect.width / 2;
    const ty = rect.top + rect.height / 2;

    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(this.mouse.x, this.mouse.y);
    ctx.lineTo(tx, ty);

    ctx.lineWidth = 2;

    switch (this.mode) {
      case 'solid':
        ctx.setLineDash([]);
        ctx.strokeStyle = '#00ffff';
        ctx.shadowBlur = 0;
        break;

      case 'glow':
        ctx.setLineDash([]);
        ctx.strokeStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        break;

      case 'wave':
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 6]);
        ctx.lineDashOffset = performance.now() / 20;
        break;

      case 'laser':
        ctx.strokeStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 20;
        ctx.setLineDash([2, 4]);
        ctx.lineDashOffset = -performance.now() / 5;
        break;

      case 'aura':
        ctx.strokeStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 25 + Math.sin(performance.now() / 300) * 10;
        ctx.setLineDash([]);
        break;

      case 'particles':
        ctx.strokeStyle = '#00ffff';
        ctx.setLineDash([1, 16]);
        ctx.lineDashOffset = -(performance.now() / 3);
        break;

      default:
        ctx.strokeStyle = '#00ffff';
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        break;
    }

    ctx.stroke();
  }
}

customElements.define('l-cursor-thread', LCursorThread);