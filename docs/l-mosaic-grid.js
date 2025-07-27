// l-mosaic-grid.js

/*
 * LMosaicGrid
 *
 * A custom element that renders a grid of luminous cells. Hovering over a cell
 * triggers a ripple effect that propagates to neighbouring cells, creating
 * an interactive mosaic. Each cell can display slotted content or
 * simply act as a button/link placeholder. The component is designed to
 * serve as an eye‑catching navigation or gallery element for websites.
 *
 * Attributes:
 * - rows: number of rows (default: 4)
 * - cols: number of columns (default: 4)
 * - palette: comma‑separated list of colours for cells (default: "#00ffff,#ff00ff,#00ff80")
 * - delay: propagation delay in milliseconds between rings of the ripple (default: 80)
 */

class LMosaicGrid extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.cells = [];
    this.rows = 4;
    this.cols = 4;
    this.palette = ['#00ffff', '#ff00ff', '#00ff80'];
    this.delay = 80;
  }

  static get observedAttributes() {
    return ['rows', 'cols', 'palette', 'delay'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'rows') {
      const v = parseInt(newVal);
      if (!isNaN(v) && v > 0) this.rows = v;
    }
    if (name === 'cols') {
      const v = parseInt(newVal);
      if (!isNaN(v) && v > 0) this.cols = v;
    }
    if (name === 'palette') {
      this.palette = newVal.split(',').map(c => c.trim()).filter(Boolean);
    }
    if (name === 'delay') {
      const d = parseInt(newVal);
      if (!isNaN(d) && d >= 0) this.delay = d;
    }
    // Rebuild grid if attributes change
    this._buildGrid();
  }

  connectedCallback() {
    // Initial attribute parsing
    if (this.hasAttribute('rows')) {
      const v = parseInt(this.getAttribute('rows'));
      if (!isNaN(v) && v > 0) this.rows = v;
    }
    if (this.hasAttribute('cols')) {
      const v = parseInt(this.getAttribute('cols'));
      if (!isNaN(v) && v > 0) this.cols = v;
    }
    if (this.hasAttribute('palette')) {
      this.palette = this.getAttribute('palette').split(',').map(c => c.trim()).filter(Boolean);
    }
    if (this.hasAttribute('delay')) {
      const d = parseInt(this.getAttribute('delay'));
      if (!isNaN(d) && d >= 0) this.delay = d;
    }
    // Build styles and grid
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
      }
      .grid {
        display: grid;
        grid-template-rows: repeat(var(--rows), 1fr);
        grid-template-columns: repeat(var(--cols), 1fr);
        gap: 8px;
        width: 100%;
      }
      .cell {
        position: relative;
        width: 100%;
        padding-top: 100%; /* Square cells */
        overflow: hidden;
        border-radius: 12px;
        cursor: pointer;
        background: rgba(255,255,255,0.05);
        box-shadow:
          0 4px 10px rgba(0,0,0,0.3),
          inset 0 0 20px rgba(255,255,255,0.05);
        transition: box-shadow 0.3s ease, filter 0.3s ease;
      }
      .cell-content {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
      }
    `;
    this.shadow.appendChild(style);
    // Create grid container
    this.gridEl = document.createElement('div');
    this.gridEl.className = 'grid';
    this.shadow.appendChild(this.gridEl);
    this._buildGrid();
  }

  _buildGrid() {
    if (!this.gridEl) return;
    // Set CSS variables for grid dimensions
    this.gridEl.style.setProperty('--rows', this.rows);
    this.gridEl.style.setProperty('--cols', this.cols);
    // Clear existing cells
    this.gridEl.innerHTML = '';
    this.cells = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        // Random base colour from palette
        const baseColor = this.palette[Math.floor(Math.random() * this.palette.length)];
        cell.style.background = this._makeBaseGradient(baseColor);
        // Add content slot for user content via slotting? Use cell number as default
        const content = document.createElement('div');
        content.className = 'cell-content';
        // default: maybe display number or empty
        content.textContent = '';
        cell.appendChild(content);
        // Hover event
        cell.addEventListener('mouseenter', () => {
          this._triggerRipple(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
        });
        this.gridEl.appendChild(cell);
        row.push(cell);
      }
      this.cells.push(row);
    }
  }

  _makeBaseGradient(color) {
    // Return radial gradient string for base cell
    return `radial-gradient(circle at 30% 30%, ${color}33, ${color}05)`;
  }

  _highlightCell(cell) {
    // Intensify the highlight effect so it is more visible on dark backgrounds.
    // In addition to increasing the outside glow, bump the brightness and saturation.
    const colour = this._extractColor(cell.style.background);
    cell.style.boxShadow =
      '0 8px 20px rgba(0,0,0,0.6),' +
      ' 0 0 24px 10px ' + colour + '99';
    cell.style.filter = 'brightness(1.8) saturate(1.4)';
  }

  _resetCell(cell) {
    cell.style.boxShadow =
      '0 4px 10px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.05)';
    // Reset both brightness and saturation to defaults. Because filter applies multiple values
    // sequentially, specify both properties.
    cell.style.filter = 'brightness(1) saturate(1)';
  }

  _extractColor(bg) {
    // Extract hex colour from gradient string
    const match = /#([0-9a-fA-F]{6})/i.exec(bg);
    return match ? '#' + match[1] : '#00ffff';
  }

  _triggerRipple(row, col) {
    const visited = new Set();
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r][c];
        const distance = Math.abs(r - row) + Math.abs(c - col);
        const delay = distance * this.delay;
        if (!visited.has(cell)) {
          visited.add(cell);
          setTimeout(() => {
            this._highlightCell(cell);
            // Reset after some time
            setTimeout(() => this._resetCell(cell), this.delay * (this.rows + this.cols));
          }, delay);
        }
      }
    }
  }
}

customElements.define('l-mosaic-grid', LMosaicGrid);