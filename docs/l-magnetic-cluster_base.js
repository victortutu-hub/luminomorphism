(function () {
  class LMagneticCluster extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.nodes = [];
      this.mouse = { x: 0, y: 0 };
    }

    connectedCallback() {
      setTimeout(() => this.init(), 50);
    }

    reinit() {
      this.shadowRoot.innerHTML = "";
      this.nodes = [];
      requestAnimationFrame(() => this.init());
    }

    init() {
      const count = parseInt(this.getAttribute("count")) || 8;
      const size = parseFloat(this.getAttribute("size")) || 50;
      const opacity = parseFloat(this.getAttribute("opacity")) || 0.5;

      const width = this.offsetWidth > 0 ? this.offsetWidth : 800;
      const height = this.offsetHeight > 0 ? this.offsetHeight : 600;

      const useVerlet = this.getAttribute("verlet") !== "false";
      const useBoids = this.getAttribute("boids") !== "false";
      const useMagnetic = this.getAttribute("magnetic") !== "false";

      const glowMap = {
        0: '0 0 10px rgba(255,255,255,0.05)',  // none
        1: '0 0 40px rgba(0,255,255,0.6)',     // magnetic only
        2: '0 0 20px rgba(0,128,255,0.4)',     // boids only
        3: '0 0 28px rgba(0,194,255,0.45)',    // boids + magnetic
        4: '0 0 14px rgba(200,150,255,0.3)',   // verlet only
        5: '0 0 32px rgba(0,224,209,0.5)',     // verlet + magnetic
        6: '0 0 32px rgba(139,92,246,0.5)',    // verlet + boids
        7: '0 0 40px rgba(170,255,255,0.6)'    // all enabled
      };

      const style = document.createElement("style");
      style.textContent = `
        :host {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          min-width: 400px;
          min-height: 300px;
          overflow: hidden;
        }
        .node {
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: rgba(0, 255, 255, ${opacity});
          backdrop-filter: blur(4px);
          pointer-events: none;
          transition: box-shadow 0.3s ease, background 0.3s ease;
        }
      `;
      this.shadowRoot.appendChild(style);

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.width = "100%";
      container.style.height = "100%";
      this.shadowRoot.appendChild(container);

      for (let i = 0; i < count; i++) {
        const node = document.createElement("div");
        node.classList.add("node");

        node.x = Math.random() * width;
        node.y = Math.random() * height;
        node.xPrev = node.x;
        node.yPrev = node.y;
        node.ax = 0;
        node.ay = 0;

        container.appendChild(node);
        this.nodes.push(node);
      }

      this.shadowRoot.addEventListener("pointermove", e => {
        const rect = this.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });

      const animate = () => {
        const speed = parseFloat(this.getAttribute("speed")) || 1;
        const sepDist = 60;
        const cohDist = 100;
        const sepForce = 0.08;
        const cohForce = 0.0015;
        const magneticNear = 2.0;
        const magneticFar = 0.8;

        const key = (useVerlet ? 1 : 0) << 2 | (useBoids ? 1 : 0) << 1 | (useMagnetic ? 1 : 0);
        const glow = glowMap[key];

        for (let i = 0; i < this.nodes.length; i++) {
          const node = this.nodes[i];

          let ax = 0;
          let ay = 0;
          node.style.boxShadow = glow;

          if (useMagnetic && (useVerlet || useBoids)) {
            const dx = this.mouse.x - node.x;
            const dy = this.mouse.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const force = dist < 150 ? -magneticNear : magneticFar;
            ax += force * dx / (dist || 1) * 0.01 * speed;
            ay += force * dy / (dist || 1) * 0.01 * speed;
          }

          if (useBoids) {
            let sepX = 0, sepY = 0, cohX = 0, cohY = 0;
            let countCoh = 0, countSep = 0;

            for (let j = 0; j < this.nodes.length; j++) {
              if (i === j) continue;
              const other = this.nodes[j];
              const dx2 = node.x - other.x;
              const dy2 = node.y - other.y;
              const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

              if (d2 < sepDist && d2 > 0) {
                sepX += dx2 / d2;
                sepY += dy2 / d2;
                countSep++;
              }

              if (d2 < cohDist) {
                cohX += other.x;
                cohY += other.y;
                countCoh++;
              }
            }

            if (countSep > 0) {
              sepX /= countSep;
              sepY /= countSep;
              ax += sepX * sepForce;
              ay += sepY * sepForce;
            }

            if (countCoh > 0) {
              cohX /= countCoh;
              cohY /= countCoh;
              ax += (cohX - node.x) * cohForce;
              ay += (cohY - node.y) * cohForce;
            }
          }

          ax += (Math.random() - 0.5) * 0.1;
          ay += (Math.random() - 0.5) * 0.1;

          node.ax = ax;
          node.ay = ay;
        }

        for (let node of this.nodes) {
          if (useVerlet) {
            const xTemp = node.x;
            const yTemp = node.y;

            node.x += (node.x - node.xPrev) * 0.95 + node.ax;
            node.y += (node.y - node.yPrev) * 0.95 + node.ay;

            node.xPrev = xTemp;
            node.yPrev = yTemp;
          } else {
            node.x += node.ax;
            node.y += node.ay;
          }

          if (node.x < 0) { node.x = 0; node.xPrev = node.x + 1; }
          if (node.x > width) { node.x = width; node.xPrev = node.x - 1; }
          if (node.y < 0) { node.y = 0; node.yPrev = node.y + 1; }
          if (node.y > height) { node.y = height; node.yPrev = node.y - 1; }

          node.style.transform = `translate(${node.x}px, ${node.y}px)`;
        }

        requestAnimationFrame(animate);
      };

      animate();
    }
  }

  window.customElements.define("l-magnetic-cluster", LMagneticCluster);
})();
