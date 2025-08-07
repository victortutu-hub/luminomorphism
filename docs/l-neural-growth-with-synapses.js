
class LNeuralGrowth extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.shadowRoot.appendChild(this.canvas);

    this.branches = [];
    this.synapses = [];
    this.terminalPoints = [];
    this.frameCount = 0;
    this.maxBranchLength = 80;

    this.config = {
      growthSpeed: parseFloat(this.getAttribute("growth-speed")) || 0.5,
      maxDepth: parseInt(this.getAttribute("max-depth")) || 5,
      branchingAngle: parseFloat(this.getAttribute("branching-angle")) || 0.5,
      splitChance: 0.12,
      synapseThreshold: 35,
      pulseFrequency: 0.08
    };

    document.addEventListener("keydown", e => {
      if (e.key.toLowerCase() === "r") this.reset();
    });
  }

  connectedCallback() {
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.init();
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = this.offsetWidth;
    this.canvas.height = this.offsetHeight;
  }

  init() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.branches = [{
      x: centerX,
      y: centerY,
      angle: -Math.PI / 2,
      depth: 0,
      length: 2
    }];
    this.synapses = [];
    this.terminalPoints = [];
    this.frameCount = 0;
  }

  growBranch(branch) {
    let len = Math.min(branch.length + this.config.growthSpeed, this.maxBranchLength);
    const newX = branch.x + len * Math.cos(branch.angle);
    const newY = branch.y + len * Math.sin(branch.angle);
    if (newX < 0 || newX > this.canvas.width || newY < 0 || newY > this.canvas.height) return [];

    const newBranches = [];
    if (branch.depth < this.config.maxDepth) {
      if (Math.random() < this.config.splitChance) {
        const angle1 = branch.angle + this.config.branchingAngle;
        const angle2 = branch.angle - this.config.branchingAngle;
        newBranches.push({ x: newX, y: newY, angle: angle1, depth: branch.depth + 1, length: 1 });
        newBranches.push({ x: newX, y: newY, angle: angle2, depth: branch.depth + 1, length: 1 });
      } else {
        newBranches.push({ x: newX, y: newY, angle: branch.angle, depth: branch.depth, length: len });
      }
    } else {
      this.terminalPoints.push({ x: newX, y: newY });
    }

    this.ctx.beginPath();
    this.ctx.moveTo(branch.x, branch.y);
    this.ctx.lineTo(newX, newY);
    this.ctx.strokeStyle = `rgba(0, 255, 255, ${1 - branch.depth / this.config.maxDepth})`;
    this.ctx.lineWidth = Math.max(1, 3 - branch.depth);
    this.ctx.stroke();

    return newBranches;
  }

  detectSynapses() {
    const threshold = this.config.synapseThreshold;
    const newSynapses = [];

    for (let i = 0; i < this.terminalPoints.length; i++) {
      for (let j = i + 1; j < this.terminalPoints.length; j++) {
        const a = this.terminalPoints[i];
        const b = this.terminalPoints[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < threshold) newSynapses.push({ a, b });
      }
    }

    this.synapses = newSynapses;
  }

  drawSynapses() {
    const alpha = 0.5 + 0.5 * Math.sin(this.frameCount * this.config.pulseFrequency);
    this.ctx.save();
    this.ctx.shadowColor = "magenta";
    this.ctx.shadowBlur = 12;
    this.ctx.lineCap = "round";
    this.ctx.lineWidth = 1.2;
    const r = 200 + Math.sin(this.frameCount * 0.1) * 55;
    const g = 80 + Math.sin(this.frameCount * 0.13 + 1) * 50;
    const b = 255;

    this.ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
    for (const s of this.synapses) {
      this.ctx.beginPath();
      this.ctx.moveTo(s.a.x, s.a.y);
      this.ctx.lineTo(s.b.x, s.b.y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.frameCount++;

    const newBranches = [];
    this.terminalPoints = [];

    for (let i = 0; i < this.branches.length; i++) {
      const result = this.growBranch(this.branches[i]);
      newBranches.push(...result);
    }

    this.branches = newBranches;

    if (this.branches.length === 0 && this.synapses.length === 0) {
      this.detectSynapses();
    }

    this.drawSynapses();
  }

  reset() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.init();
  }
}

customElements.define("l-neural-growth", LNeuralGrowth);
