// l-neural-progress.js - Versiune fixată și simplificată
class LNeuralProgress extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'max', 'state', 'nodes', 'layers', 'speed', 'color'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.config = {
      value: 0,
      max: 100,
      state: 'loading',
      nodes: 6,
      layers: 3,
      speed: 1.0,
      color: '#00ffff'
    };
    
    this.neural = {
      network: [],
      connections: [],
      pulses: []
    };
    
    this.animationId = null;
    this.frameCount = 0;
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
    // Delay pentru a se asigura că DOM-ul este gata
    setTimeout(() => {
      this.initNetwork();
      this.startAnimation();
    }, 100);
  }

  disconnectedCallback() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.parseAttributes();
      if (name === 'value') {
        this.updateProgress();
      }
    }
  }

  parseAttributes() {
    this.config.value = Math.max(0, Math.min(parseFloat(this.getAttribute('value')) || 0, 100));
    this.config.max = parseFloat(this.getAttribute('max')) || 100;
    this.config.state = this.getAttribute('state') || 'loading';
    this.config.nodes = parseInt(this.getAttribute('nodes')) || 6;
    this.config.layers = Math.max(2, parseInt(this.getAttribute('layers')) || 3);
    this.config.speed = parseFloat(this.getAttribute('speed')) || 1.0;
    this.config.color = this.getAttribute('color') || this.getStateColor();
  }

  getStateColor() {
    const colors = {
      loading: '#00ffff',
      success: '#00ff80', 
      error: '#ff4444',
      idle: '#666666'
    };
    return colors[this.config.state] || '#00ffff';
  }

  render() {
    const color = this.config.color || this.getStateColor();
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 120px;
          position: relative;
        }
        
        .container {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            rgba(255,255,255,0.02) 0%, 
            rgba(255,255,255,0.01) 50%, 
            rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }
        
        .info {
          position: absolute;
          top: 10px;
          left: 15px;
          font-size: 0.8rem;
          color: ${color};
          font-weight: 600;
          z-index: 10;
        }
        
        .state {
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 0.7rem;
          color: ${color};
          text-transform: uppercase;
          padding: 4px 8px;
          background: ${color}20;
          border: 1px solid ${color}40;
          border-radius: 12px;
          z-index: 10;
        }
        
        .network {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .node {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${color}40;
          border: 1px solid ${color}60;
          transition: all 0.3s ease;
        }
        
        .node.active {
          background: ${color};
          border-color: ${color};
          box-shadow: 0 0 15px ${color}80;
          animation: pulse 2s infinite;
        }
        
        .connection {
          position: absolute;
          height: 1px;
          background: ${color}30;
          transform-origin: left center;
        }
        
        .connection.active {
          background: ${color}80;
          height: 2px;
          box-shadow: 0 0 5px ${color}60;
        }
        
        .pulse-dot {
          position: absolute;
          width: 4px;
          height: 4px;
          background: ${color};
          border-radius: 50%;
          box-shadow: 0 0 8px ${color};
          animation: travel linear;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        
        @keyframes travel {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      </style>
      
      <div class="container">
        <div class="info">${Math.round(this.config.value)}%</div>
        <div class="state">${this.config.state}</div>
        <div class="network" id="network"></div>
      </div>
    `;
  }

  initNetwork() {
    const container = this.shadowRoot.getElementById('network');
    if (!container) return;
    
    const width = container.offsetWidth - 40;
    const height = container.offsetHeight - 40;
    
    if (width <= 0 || height <= 0) {
      // Retry dacă dimensiunile nu sunt încă disponibile
      setTimeout(() => this.initNetwork(), 100);
      return;
    }
    
    this.neural.network = [];
    container.innerHTML = '';
    
    // Creează nodurile
    for (let layer = 0; layer < this.config.layers; layer++) {
      const layerNodes = [];
      const nodeCount = layer === 0 || layer === this.config.layers - 1 ? 
        Math.max(1, Math.floor(this.config.nodes * 0.7)) : this.config.nodes;
      
      const x = 20 + (layer * width) / (this.config.layers - 1);
      
      for (let i = 0; i < nodeCount; i++) {
        const y = 20 + (height / (nodeCount + 1)) * (i + 1);
        
        const nodeEl = document.createElement('div');
        nodeEl.className = 'node';
        nodeEl.style.left = `${x - 5}px`;
        nodeEl.style.top = `${y - 5}px`;
        container.appendChild(nodeEl);
        
        const node = {
          id: `${layer}-${i}`,
          layer,
          index: i,
          x, y,
          element: nodeEl,
          active: false
        };
        
        layerNodes.push(node);
      }
      
      this.neural.network.push(layerNodes);
    }
    
    // Creează conexiunile
    this.neural.connections = [];
    for (let layer = 0; layer < this.config.layers - 1; layer++) {
      const currentLayer = this.neural.network[layer];
      const nextLayer = this.neural.network[layer + 1];
      
      currentLayer.forEach(fromNode => {
        nextLayer.forEach(toNode => {
          if (Math.random() > 0.2) { // Nu toate conexiunile
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            const connectionEl = document.createElement('div');
            connectionEl.className = 'connection';
            connectionEl.style.left = `${fromNode.x}px`;
            connectionEl.style.top = `${fromNode.y}px`;
            connectionEl.style.width = `${distance}px`;
            connectionEl.style.transform = `rotate(${angle}deg)`;
            container.appendChild(connectionEl);
            
            this.neural.connections.push({
              from: fromNode,
              to: toNode,
              element: connectionEl,
              active: false
            });
          }
        });
      });
    }
    
    this.updateProgress();
  }

  updateProgress() {
    const progress = this.config.value / this.config.max;
    
    // Activează nodurile bazat pe progres
    this.neural.network.forEach((layer, layerIndex) => {
      const layerProgress = Math.max(0, (progress * this.neural.network.length) - layerIndex);
      
      layer.forEach((node, nodeIndex) => {
        const shouldBeActive = nodeIndex < Math.floor(layerProgress * layer.length);
        
        if (shouldBeActive !== node.active) {
          node.active = shouldBeActive;
          if (shouldBeActive) {
            node.element.classList.add('active');
          } else {
            node.element.classList.remove('active');
          }
        }
      });
    });
    
    // Activează conexiunile
    this.neural.connections.forEach(connection => {
      const shouldBeActive = connection.from.active && connection.to.active;
      
      if (shouldBeActive !== connection.active) {
        connection.active = shouldBeActive;
        if (shouldBeActive) {
          connection.element.classList.add('active');
        } else {
          connection.element.classList.remove('active');
        }
      }
    });
    
    // Update info display
    const infoEl = this.shadowRoot.querySelector('.info');
    if (infoEl) {
      infoEl.textContent = `${Math.round(this.config.value)}%`;
    }
    
    // Emit event
    this.dispatchEvent(new CustomEvent('progress-change', {
      detail: { 
        value: this.config.value, 
        percentage: (this.config.value / this.config.max) * 100
      }
    }));
  }

  createPulse() {
    const activeConnections = this.neural.connections.filter(c => c.active);
    if (activeConnections.length === 0) return;
    
    const connection = activeConnections[Math.floor(Math.random() * activeConnections.length)];
    const container = this.shadowRoot.getElementById('network');
    
    const pulseEl = document.createElement('div');
    pulseEl.className = 'pulse-dot';
    pulseEl.style.left = `${connection.from.x - 2}px`;
    pulseEl.style.top = `${connection.from.y - 2}px`;
    pulseEl.style.animationDuration = `${1 / this.config.speed}s`;
    container.appendChild(pulseEl);
    
    const dx = connection.to.x - connection.from.x;
    const dy = connection.to.y - connection.from.y;
    
    // Animează pulsul
    const startTime = Date.now();
    const duration = 1000 / this.config.speed;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const x = connection.from.x + dx * progress - 2;
      const y = connection.from.y + dy * progress - 2;
      
      pulseEl.style.left = `${x}px`;
      pulseEl.style.top = `${y}px`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        pulseEl.remove();
      }
    };
    
    animate();
  }

  startAnimation() {
    const animate = () => {
      this.frameCount++;
      
      // Generează pulsuri aleator
      if (this.frameCount % 30 === 0 && Math.random() < 0.3) {
        this.createPulse();
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  // API public
  setValue(value) {
    this.setAttribute('value', value);
  }

  getValue() {
    return this.config.value;
  }

  setState(state) {
    this.setAttribute('state', state);
    this.render(); // Re-render pentru noua culoare
    setTimeout(() => this.initNetwork(), 50);
  }

  pulse() {
    // Creează multiple pulsuri
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.createPulse(), i * 200);
    }
  }

  learn() {
    // Simulare learning mode - face conexiunile să pulseze mai intens
    this.neural.connections.forEach(connection => {
      if (connection.active && Math.random() < 0.7) {
        connection.element.style.animation = 'pulse 0.5s ease-in-out 3';
        connection.element.style.background = this.config.color;
        connection.element.style.height = '3px';
        connection.element.style.boxShadow = `0 0 10px ${this.config.color}`;
        
        setTimeout(() => {
          connection.element.style.animation = '';
          connection.element.style.height = connection.active ? '2px' : '1px';
          connection.element.style.boxShadow = connection.active ? `0 0 5px ${this.config.color}60` : '';
        }, 1500);
      }
    });
    
    // Activează toate nodurile temporar pentru effect "learning"
    this.neural.network.flat().forEach((node, index) => {
      setTimeout(() => {
        node.element.classList.add('active');
        node.element.style.animation = 'pulse 0.3s ease-in-out 2';
        
        setTimeout(() => {
          if (!node.active) {
            node.element.classList.remove('active');
          }
          node.element.style.animation = '';
        }, 600);
      }, index * 50);
    });
  }

  reset() {
    this.setValue(0);
  }
}

customElements.define('l-neural-progress', LNeuralProgress);