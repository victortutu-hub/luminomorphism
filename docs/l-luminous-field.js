// l-luminous-field.js - Enhanced version with your style patterns
// Combines multiple physics simulations in one component

class LLuminousField extends HTMLElement {
  static get observedAttributes() {
    return [
      'field-type', 'intensity', 'frequency', 'particle-count',
      'color-primary', 'color-secondary', 'interaction-mode',
      'field-decay', 'resonance-enabled', 'memory-enabled'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.shadowRoot.appendChild(this.canvas);

    // DPR state (pentru randare nedistorsionată)
    this.dpr = Math.max(1, window.devicePixelRatio || 1);

    // Enhanced state management following your patterns
    this.field = {
      nodes: [],
      resonancePoints: [],
      memoryTraces: [],
      fieldLines: []
    };

    this.physics = {
      fieldType: 'electromagnetic',
      intensity: 1.0,
      frequency: 0.05,
      decay: 0.95,
      resonanceEnabled: false,
      memoryEnabled: false
    };

    this.interaction = {
      mouse: { x: null, y: null },
      activeZones: new Set(),
      fieldDisruption: 0
    };

    this.animation = {
      frameCount: 0,
      lastTime: 0,
      animationId: null,
      activeEffects: []
    };

    // Cleanup tracking like your components
    this.cleanupTasks = [];

    // păstrăm referințe pentru removeEventListener corect
    this._onResize = null;
  }

  connectedCallback() {
    this.parseAttributes();
    // Delay pentru a permite CSS-ului să se încarce complet
    setTimeout(() => {
      this.setupCanvas();        // => setează dimensiunea pe DPR
      this.initializeField();
      this.attachEventListeners();
      this.startAnimation();
    }, 200);
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.parseAttributes();
      this.reinitialize();
    }
  }

  parseAttributes() {
    this.physics.fieldType = this.getAttribute('field-type') || 'electromagnetic';
    this.physics.intensity = parseFloat(this.getAttribute('intensity')) || 1.0;
    this.physics.frequency = parseFloat(this.getAttribute('frequency')) || 0.05;
    this.physics.decay = parseFloat(this.getAttribute('field-decay')) || 0.95;
    this.physics.resonanceEnabled = this.getAttribute('resonance-enabled') === 'true';
    this.physics.memoryEnabled = this.getAttribute('memory-enabled') === 'true';

    this.config = {
      particleCount: parseInt(this.getAttribute('particle-count')) || 50,
      colorPrimary: this.getAttribute('color-primary') || '#00ffff',
      colorSecondary: this.getAttribute('color-secondary') || '#ff00ff',
      interactionMode: this.getAttribute('interaction-mode') || 'attract'
    };
  }

  // ——————————————————————————————————————————————————————————
  // Canvas: dimensionare corectă (DPR) + transform pentru coordonate CSS
  // ——————————————————————————————————————————————————————————
  setupCanvas() {
    // Stilul tău rămâne neschimbat
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
      }
      canvas {
        width: 100%;
        height: 100%;
        background: transparent;
      }
    `;
    this.shadowRoot.appendChild(style);

    // dimensionare inițială (fix pentru first paint)
    this.handleResize();

    // listener stocat (nu funcție anonimă)
    this._onResize = () => {
      // actualizează dpr dacă utilizatorul mută fereastra pe alt monitor
      const newDpr = Math.max(1, window.devicePixelRatio || 1);
      if (newDpr !== this.dpr) this.dpr = newDpr;
      this.handleResize();
    };
    window.addEventListener('resize', this._onResize);

    this.cleanupTasks.push(() => {
      if (this._onResize) window.removeEventListener('resize', this._onResize);
      this._onResize = null;
    });
  }

  initializeField() {
    const { particleCount, colorPrimary, colorSecondary } = this.config;
    this.field.nodes = [];

    // Create field particles with enhanced properties like your components
    for (let i = 0; i < particleCount; i++) {
      const node = {
        id: i,
        x: Math.random() * (this.canvas.width / this.dpr),
        y: Math.random() * (this.canvas.height / this.dpr),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        charge: Math.random() > 0.5 ? 1 : -1,
        energy: Math.random(),
        resonancePhase: Math.random() * Math.PI * 2,

        // Memory system like your temporal echoes
        positionHistory: this.physics.memoryEnabled ? [] : null,
        energyHistory: [],

        // Visual properties
        color: Math.random() > 0.5 ? colorPrimary : colorSecondary,
        radius: 2 + Math.random() * 3,
        opacity: 0.7 + Math.random() * 0.3,

        // Field-specific properties
        fieldInfluence: 0,
        resonanceAmplitude: 0
      };

      this.field.nodes.push(node);
    }
  }

  attachEventListeners() {
    const handlePointerMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.interaction.mouse.x = e.clientX - rect.left;
      this.interaction.mouse.y = e.clientY - rect.top;
      this.calculateFieldDisruption();
    };

    const handlePointerLeave = () => {
      this.interaction.mouse.x = null;
      this.interaction.mouse.y = null;
      this.interaction.fieldDisruption *= 0.9;
    };

    this.shadowRoot.addEventListener('pointermove', handlePointerMove);
    this.shadowRoot.addEventListener('pointerleave', handlePointerLeave);

    this.cleanupTasks.push(() => {
      this.shadowRoot.removeEventListener('pointermove', handlePointerMove);
      this.shadowRoot.removeEventListener('pointerleave', handlePointerLeave);
    });
  }

  // FIX: nu ieși când x === 0; verificăm null/undefined
  calculateFieldDisruption() {
    if (this.interaction.mouse.x == null || this.interaction.mouse.y == null) return;

    const centerX = (this.canvas.width / this.dpr) / 2;
    const centerY = (this.canvas.height / this.dpr) / 2;
    const dx = this.interaction.mouse.x - centerX;
    const dy = this.interaction.mouse.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    this.interaction.fieldDisruption = (1 - distance / maxDistance) * this.physics.intensity;
  }

  updateField() {
    const { nodes } = this.field;
    const { fieldType, intensity, frequency, decay } = this.physics;
    const { mouse, fieldDisruption } = this.interaction;

    // Field evolution based on type
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Reset forces
      let fx = 0, fy = 0;

      // Field-specific physics
      switch (fieldType) {
        case 'electromagnetic':
          [fx, fy] = this.calculateElectromagneticForces(node, i);
          break;
        case 'gravitational':
          [fx, fy] = this.calculateGravitationalForces(node, i);
          break;
        case 'quantum':
          [fx, fy] = this.calculateQuantumForces(node, i);
          break;
      }

      // Mouse interaction
      if (mouse.x !== null) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const force = fieldDisruption * (1 - dist / 150);
          const direction = this.config.interactionMode === 'attract' ? 1 : -1;
          fx += (dx / dist) * force * direction * 0.5;
          fy += (dy / dist) * force * direction * 0.5;
        }
      }

      // Resonance effect
      if (this.physics.resonanceEnabled) {
        const resonance = Math.sin(this.animation.frameCount * frequency + node.resonancePhase);
        node.resonanceAmplitude = resonance * intensity * 0.3;
        fx += resonance * 0.1;
        fy += Math.cos(this.animation.frameCount * frequency + node.resonancePhase) * 0.1;
      }

      // Apply forces and update position
      node.vx = (node.vx + fx) * decay;
      node.vy = (node.vy + fy) * decay;
      node.x += node.vx;
      node.y += node.vy;

      // Boundary conditions
      this.handleBoundaries(node);

      // Memory system
      if (this.physics.memoryEnabled && node.positionHistory) {
        node.positionHistory.push({ x: node.x, y: node.y, frame: this.animation.frameCount });
        if (node.positionHistory.length > 20) {
          node.positionHistory.shift();
        }
      }

      // Energy tracking
      node.energy = Math.min(1, node.energy + Math.abs(fx + fy) * 0.01);
      node.energyHistory.push(node.energy);
      if (node.energyHistory.length > 10) {
        node.energyHistory.shift();
      }
    }
  }

  calculateElectromagneticForces(node, index) {
    let fx = 0, fy = 0;
    const { nodes } = this.field;

    for (let j = 0; j < nodes.length; j++) {
      if (j === index) continue;

      const other = nodes[j];
      const dx = other.x - node.x;
      const dy = other.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < 100) {
        const force = (node.charge * other.charge) / (dist * dist);
        const direction = force > 0 ? -1 : 1; // Same charges repel

        fx += direction * (dx / dist) * Math.abs(force) * 0.1;
        fy += direction * (dy / dist) * Math.abs(force) * 0.1;
      }
    }

    return [fx, fy];
  }

  calculateGravitationalForces(node, index) {
    // Simplified gravitational attraction
    let fx = 0, fy = 0;
    const centerX = (this.canvas.width / this.dpr) / 2;
    const centerY = (this.canvas.height / this.dpr) / 2;

    const dx = centerX - node.x;
    const dy = centerY - node.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const force = this.physics.intensity / (dist * 0.01);
      fx = (dx / dist) * force * 0.001;
      fy = (dy / dist) * force * 0.001;
    }

    return [fx, fy];
  }

  calculateQuantumForces(node, index) {
    // Quantum tunneling and uncertainty principle effects
    let fx = 0, fy = 0;

    // Uncertainty in position creates random fluctuations
    const uncertainty = this.physics.intensity * 0.1;
    fx = (Math.random() - 0.5) * uncertainty;
    fy = (Math.random() - 0.5) * uncertainty;

    // Quantum tunneling - occasional position jumps
    if (Math.random() < 0.001) {
      node.x += (Math.random() - 0.5) * 50;
      node.y += (Math.random() - 0.5) * 50;
    }

    return [fx, fy];
  }

  handleBoundaries(node) {
    const margin = node.radius;

    if (node.x < margin) {
      node.x = margin;
      node.vx *= -0.8;
    }
    if (node.x > (this.canvas.width / this.dpr) - margin) {
      node.x = (this.canvas.width / this.dpr) - margin;
      node.vx *= -0.8;
    }
    if (node.y < margin) {
      node.y = margin;
      node.vy *= -0.8;
    }
    if (node.y > (this.canvas.height / this.dpr) - margin) {
      node.y = (this.canvas.height / this.dpr) - margin;
      node.vy *= -0.8;
    }
  }

  render() {
    const { ctx, canvas } = this;
    // clear pe coordonate fizice, dar cu transform activ rămâne corect
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render field lines first
    this.renderFieldLines();

    // Render memory traces
    if (this.physics.memoryEnabled) {
      this.renderMemoryTraces();
    }

    // Render connections between nearby particles
    this.renderConnections();

    // Render particles
    this.renderParticles();

    // Render resonance effects
    if (this.physics.resonanceEnabled) {
      this.renderResonanceEffects();
    }
  }

  renderFieldLines() {
    const { ctx } = this;
    const { fieldType } = this.physics;

    if (fieldType === 'electromagnetic') {
      // Draw field lines emanating from charged particles
      ctx.strokeStyle = `rgba(0, 255, 255, 0.1)`;
      ctx.lineWidth = 0.5;

      for (const node of this.field.nodes) {
        if (node.charge > 0) {
          ctx.beginPath();
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const startX = node.x + Math.cos(angle) * 10;
            const startY = node.y + Math.sin(angle) * 10;
            const endX = node.x + Math.cos(angle) * 30;
            const endY = node.y + Math.sin(angle) * 30;

            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
          }
          ctx.stroke();
        }
      }
    }
  }

  renderMemoryTraces() {
    const { ctx } = this;

    for (const node of this.field.nodes) {
      if (!node.positionHistory) continue;

      ctx.strokeStyle = `${node.color}20`;
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let i = 1; i < node.positionHistory.length; i++) {
        const prev = node.positionHistory[i - 1];
        const curr = node.positionHistory[i];

        if (i === 1) ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
      }

      ctx.stroke();
    }
  }

  renderConnections() {
    const { ctx } = this;
    const { nodes } = this.field;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
          const alpha = (1 - dist / 80) * 0.3;
          ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  renderParticles() {
    const { ctx } = this;

    for (const node of this.field.nodes) {
      const radius = node.radius + node.resonanceAmplitude;

      // Create gradient based on energy and charge
      const gradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, radius * 3
      );

      const baseAlpha = node.opacity;
      const energyAlpha = Math.min(0.8, baseAlpha + node.energy * 0.3);
      const alphaHex = Math.floor(energyAlpha * 255).toString(16).padStart(2, '0');

      gradient.addColorStop(0, `${node.color}${alphaHex}`);
      gradient.addColorStop(0.7, `${node.color}40`);
      gradient.addColorStop(1, `${node.color}00`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Core particle
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, Math.max(1, radius * 0.3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderResonanceEffects() {
    const { ctx } = this;

    for (const node of this.field.nodes) {
      if (Math.abs(node.resonanceAmplitude) > 0.1) {
        const pulseRadius = node.radius * 2 + Math.abs(node.resonanceAmplitude) * 10;
        const alpha = Math.abs(node.resonanceAmplitude) * 0.3;

        const ah = Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.strokeStyle = `${node.color}${ah}`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  animate() {
    this.animation.frameCount++;
    this.updateField();
    this.render();
    this.animation.animationId = requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    if (this.animation.animationId) {
      cancelAnimationFrame(this.animation.animationId);
    }
    this.animate();
  }

  // FIX: redimensionare cu DPR + coordonate CSS
  handleResize() {
    const rect = this.getBoundingClientRect();
    const cssW = Math.max(1, Math.floor(rect.width));
    const cssH = Math.max(1, Math.floor(rect.height));

    // buffer fizic
    const need =
      this.canvas.width !== Math.floor(cssW * this.dpr) ||
      this.canvas.height !== Math.floor(cssH * this.dpr);

    if (need) {
      this.canvas.width = Math.floor(cssW * this.dpr);
      this.canvas.height = Math.floor(cssH * this.dpr);
      this.canvas.style.width = cssW + 'px';
      this.canvas.style.height = cssH + 'px';
      // coordonate în pixeli CSS:
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  }

  reinitialize() {
    this.cleanup();
    // păstrăm canvas-ul și listeners de resize; refacem doar starea
    this.initializeField();
    this.attachEventListeners();
    this.startAnimation();
  }

  cleanup() {
    if (this.animation.animationId) {
      cancelAnimationFrame(this.animation.animationId);
      this.animation.animationId = null;
    }

    this.cleanupTasks.forEach(task => { try { task(); } catch (_) { } });
    this.cleanupTasks = [];
  }
}

customElements.define('l-luminous-field', LLuminousField);
