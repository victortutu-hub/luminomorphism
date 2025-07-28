class LParticleNet extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const canvas = document.createElement('canvas');
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.shadowRoot.appendChild(canvas);

    this.nodes = [];
    this.mouse = { x: null, y: null };
    this.config = {
      count: parseInt(this.getAttribute('nodes')) || 32,
      maxDist: 120,
      radius: 2.8,
      glowColor: this.getAttribute('color') || '#00ffff',
      speed: parseFloat(this.getAttribute('speed')) || 0.4,
    };
  }

  connectedCallback() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.shadowRoot.host.addEventListener('pointermove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    this.shadowRoot.host.addEventListener('pointerleave', () => {
      this.mouse.x = this.mouse.y = null;
    });

    this.initNodes();
    requestAnimationFrame(() => this.animate());
  }

  resizeCanvas() {
    this.canvas.width = this.offsetWidth;
    this.canvas.height = this.offsetHeight;
  }

  initNodes() {
    const { speed } = this.config;
    this.nodes = Array.from({ length: this.config.count }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
    }));
  }

  reset() {
    this.config.count = parseInt(this.getAttribute('nodes')) || 32;
    this.config.speed = parseFloat(this.getAttribute('speed')) || 0.4;
    this.config.glowColor = this.getAttribute('color') || '#00ffff';
    this.initNodes();
  }

  animate() {
    const { ctx, canvas, config, nodes, mouse } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x <= 0 || n.x >= canvas.width) n.vx *= -1;
      if (n.y <= 0 || n.y >= canvas.height) n.vy *= -1;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.maxDist) {
          const alpha = 1 - dist / config.maxDist;
          ctx.strokeStyle = `rgba(0,255,255,${alpha * 0.25})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      if (mouse.x && mouse.y) {
        const dx = nodes[i].x - mouse.x;
        const dy = nodes[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.maxDist * 1.2) {
          const alpha = 1 - dist / (config.maxDist * 1.2);
          ctx.strokeStyle = `rgba(0,255,255,${alpha * 0.2})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    for (let n of nodes) {
      const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, config.radius * 4);
      gradient.addColorStop(0, `${config.glowColor}88`);
      gradient.addColorStop(1, '#00000000');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(n.x, n.y, config.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}

customElements.define('l-particle-net', LParticleNet);
