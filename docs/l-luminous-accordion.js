// l-luminous-accordion.js — Luminomorphism edition (compatibil cu HTML-ul tău)
// Features:
//  • Copii <l-accordion-item title="...">…</l-accordion-item> (light DOM, clonate în Shadow DOM)
//  • API: openAccordionItem(i), closeAllItems(), getActiveIndex()
//  • Atribute: theme="cyber|plasma|matrix|solar", glow-color, animation-duration, particle-count
//  • Entanglement pulse pe vecini, afterglow cu memorie (--mem), accent auto per item (--accent)
//  • ARIA + navigare din tastatură (săgeți / Home / End / Enter / Space)
//  • Respectă prefers-reduced-motion

class LLuminousAccordion extends HTMLElement {
    static get observedAttributes() {
        return ['theme', 'glow-color', 'animation-duration', 'particle-count'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // State
        this._items = [];              // { wrapper, headerBtn, panel, expanded }
        this._theme = 'cyber';
        this._glow = '#00ffff';
        this._animMs = 800;
        this._particleCount = 6;
        this._reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Binds
        this._onHeaderClick = this._onHeaderClick.bind(this);
        this._onHeaderKeydown = this._onHeaderKeydown.bind(this);
        this._onResize = this._onResize.bind(this);

        // Afterglow faders
        this._memRAF = new WeakMap();
    }

    // ==== Public API (folosit de demo) ========================================
    openAccordionItem(index) {
        const it = this._items[index];
        if (!it) return;
        this._expand(it, index);
    }

    closeAllItems() {
        this._items.forEach((it, i) => setTimeout(() => this._collapse(it, i), i * 15)); // mic stagger
    }

    getActiveIndex() {
        return this._items.findIndex(it => it.expanded);
    }
    // ==========================================================================

    connectedCallback() {
        this._readAttributes();
        this._render();
        addEventListener('resize', this._onResize);
    }

    disconnectedCallback() {
        removeEventListener('resize', this._onResize);
    }

    attributeChangedCallback() {
        this._readAttributes();
        this._applyThemeAndVars();
    }

    // ---------- Internals ----------
    _readAttributes() {
        const theme = (this.getAttribute('theme') || 'cyber').toLowerCase().trim();
        const allowed = ['cyber', 'plasma', 'matrix', 'solar'];
        this._theme = allowed.includes(theme) ? theme : 'cyber';

        this._glow = this.getAttribute('glow-color') || '#00ffff';

        const ms = parseInt(this.getAttribute('animation-duration'), 10);
        this._animMs = Number.isFinite(ms) && ms >= 0 ? ms : 800;

        const pc = parseInt(this.getAttribute('particle-count'), 10);
        this._particleCount = Number.isFinite(pc) && pc >= 0 ? pc : 6;
    }

    _render() {
        this.shadowRoot.innerHTML = '';

        const style = document.createElement('style');
        style.textContent = this._css();
        this.shadowRoot.appendChild(style);

        const host = document.createElement('div');
        host.className = 'luminous-accordion';
        host.setAttribute('role', 'presentation');

        const list = document.createElement('div');
        list.className = 'items';
        host.appendChild(list);

        // Strângem copiii <l-accordion-item> din light DOM; îi ascundem (nu-i mișcăm)
        const lightItems = Array.from(this.querySelectorAll('l-accordion-item'));
        lightItems.forEach(el => el.setAttribute('hidden', ''));

        this._items = lightItems.map((srcEl, index) => {
            const title = (srcEl.getAttribute('title') || '').trim() || `Item ${index + 1}`;

            const wrapper = document.createElement('div');
            wrapper.className = 'acc-item';

            // Header (ARIA)
            const headerBtn = document.createElement('button');
            headerBtn.type = 'button';
            headerBtn.className = 'acc-header';
            headerBtn.id = `acc-${index}`;
            headerBtn.setAttribute('aria-controls', `panel-${index}`);
            headerBtn.setAttribute('aria-expanded', 'false');
            headerBtn.tabIndex = index === 0 ? 0 : -1;
            headerBtn.addEventListener('click', this._onHeaderClick);
            headerBtn.addEventListener('keydown', this._onHeaderKeydown);

            const titleEl = document.createElement('span');
            titleEl.className = 'title';
            titleEl.textContent = title;

            const chev = document.createElement('span');
            chev.className = 'chev';

            headerBtn.appendChild(titleEl);
            headerBtn.appendChild(chev);

            // Panel – clonăm conținutul itemului din light DOM
            const panel = document.createElement('div');
            panel.className = 'acc-panel';
            panel.id = `panel-${index}`;
            panel.setAttribute('role', 'region');
            panel.setAttribute('aria-labelledby', headerBtn.id);
            panel.style.maxHeight = '0px';

            const clone = srcEl.cloneNode(true);
            panel.append(...Array.from(clone.childNodes));

            wrapper.appendChild(headerBtn);
            wrapper.appendChild(panel);
            list.appendChild(wrapper);

            // Accent per-item (din imagine sau fallback din titlu)
            this._autoAccentForItem(title, panel, wrapper);

            return { wrapper, headerBtn, panel, expanded: false };
        });

        this.shadowRoot.appendChild(host);
        this._applyThemeAndVars();
    }

    _applyThemeAndVars() {
        this.style.setProperty('--glow-color', this._glow);
        this.style.setProperty('--anim-ms', this._reduceMotion ? '0ms' : `${this._animMs}ms`);

        this.shadowRoot.host.classList.remove('theme-cyber', 'theme-plasma', 'theme-matrix', 'theme-solar');
        this.shadowRoot.host.classList.add(`theme-${this._theme}`);
    }

    _onHeaderClick(ev) {
        const idx = this._items.findIndex(it => it.headerBtn === ev.currentTarget);
        if (idx === -1) return;
        const it = this._items[idx];
        if (it.expanded) this._collapse(it, idx);
        else this._expand(it, idx);
        this._rovingTabIndex(idx);
    }

    _onHeaderKeydown(ev) {
        const keys = ['ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', ' '];
        if (!keys.includes(ev.key)) return;

        const idx = this._items.findIndex(it => it.headerBtn === ev.currentTarget);
        if (idx === -1) return;

        if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            ev.currentTarget.click();
            return;
        }

        ev.preventDefault();
        let next = idx;
        if (ev.key === 'ArrowDown') next = (idx + 1) % this._items.length;
        if (ev.key === 'ArrowUp') next = (idx - 1 + this._items.length) % this._items.length;
        if (ev.key === 'Home') next = 0;
        if (ev.key === 'End') next = this._items.length - 1;

        this._items[next].headerBtn.focus();
        this._rovingTabIndex(next);
    }

    _rovingTabIndex(activeIndex) {
        this._items.forEach((it, i) => {
            it.headerBtn.tabIndex = (i === activeIndex ? 0 : -1);
        });
    }

    _expand(it, index) {
        if (it.expanded) return;
        it.expanded = true;
        it.wrapper.classList.add('expanded');
        it.headerBtn.setAttribute('aria-expanded', 'true');

        const panel = it.panel;
        const target = panel.scrollHeight;
        if (this._reduceMotion || this._animMs === 0) {
            panel.style.maxHeight = target + 'px';
        } else {
            panel.style.transition = `max-height var(--anim-ms) cubic-bezier(.2,.6,.2,1)`;
            panel.style.maxHeight = '0px';
            requestAnimationFrame(() => { panel.style.maxHeight = target + 'px'; });
        }

        // Particule decorative
        if (this._particleCount > 0) this._emitParticles(it.headerBtn, this._particleCount);

        // Entanglement pulse pe vecini
        [this._items[index - 1], this._items[index + 1]].forEach(nei => {
            if (!nei) return;
            nei.wrapper.classList.add('ripple');
            setTimeout(() => nei.wrapper.classList.remove('ripple'), 600);
        });

        // Afterglow cu memorie
        this._afterglow(it.wrapper);

        this.dispatchEvent(new CustomEvent('accordion-change', {
            detail: { index, expanded: true }
        }));
    }

    _collapse(it, index) {
        if (!it.expanded) return;
        it.expanded = false;
        it.wrapper.classList.remove('expanded');
        it.headerBtn.setAttribute('aria-expanded', 'false');

        const panel = it.panel;
        const h = panel.scrollHeight;
        if (this._reduceMotion || this._animMs === 0) {
            panel.style.maxHeight = '0px';
        } else {
            panel.style.transition = `max-height var(--anim-ms) cubic-bezier(.2,.6,.2,1)`;
            panel.style.maxHeight = h + 'px';
            requestAnimationFrame(() => { panel.style.maxHeight = '0px'; });
        }

        this.dispatchEvent(new CustomEvent('accordion-change', {
            detail: { index, expanded: false }
        }));
    }

    _onResize() {
        // Re-sincronizează înălțimile pe resize pentru cele deschise
        this._items.forEach(it => {
            if (it.expanded) it.panel.style.maxHeight = it.panel.scrollHeight + 'px';
        });
    }

    // ---- Accent per item ------------------------------------------------------
    _autoAccentForItem(title, panel, wrapper) {
        const img = panel.querySelector('img');

        if (img) {
            const trySample = () => {
                this._sampleImageColor(img)
                    .then(hex => wrapper.style.setProperty('--accent', hex))
                    .catch(() => wrapper.style.setProperty('--accent', this._hashTitleColor(title)));
            };

            if (img.complete && img.naturalWidth) {
                trySample();
            } else {
                img.addEventListener('load', trySample, { once: true });
                img.addEventListener('error', () => {
                    wrapper.style.setProperty('--accent', this._hashTitleColor(title));
                }, { once: true });
            }
        } else {
            wrapper.style.setProperty('--accent', this._hashTitleColor(title));
        }
    }

    _sampleImageColor(img) {
        return new Promise((res, rej) => {
            try {
                const c = document.createElement('canvas');
                c.width = 8; c.height = 8;
                const ctx = c.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(img, 0, 0, 8, 8);
                const data = ctx.getImageData(0, 0, 8, 8).data;
                let r = 0, g = 0, b = 0, n = 0;
                for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
                r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
                const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
                res(hex);
            } catch (e) {
                rej(e); // (ex: cross-origin tainted) -> fallback la hash
            }
        });
    }

    _hashTitleColor(str) {
        let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
        const H = h % 360, S = 72, L = 60;
        return this._hslToHex(H, S, L);
    }

    _hslToHex(H, S, L) {
        const s = S / 100, l = L / 100;
        const k = n => (n + H / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return '#' + [f(0), f(8), f(4)].map(v => Math.round(255 * v).toString(16).padStart(2, '0')).join('');
    }
    // --------------------------------------------------------------------------

    // ---- Afterglow cu memorie -------------------------------------------------
    _afterglow(wrapper) {
        let start = performance.now();
        const prev = this._memRAF.get(wrapper);
        if (prev) cancelAnimationFrame(prev);

        const tick = (t) => {
            const dt = (t - start) / 3500;           // ~3.5s
            const v = Math.max(0, 1 - dt);
            wrapper.style.setProperty('--mem', v.toFixed(3));
            if (v > 0) this._memRAF.set(wrapper, requestAnimationFrame(tick));
        };

        wrapper.style.setProperty('--mem', '1');   // aprindere instant
        this._memRAF.set(wrapper, requestAnimationFrame(tick));
    }
    // --------------------------------------------------------------------------

    // ---- Particule decorative -------------------------------------------------
    _emitParticles(anchorEl, count) {
        const box = anchorEl.getBoundingClientRect();
        const rel = anchorEl; // poziționăm absolut în header
        rel.style.position = rel.style.position || 'relative';

        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = 'spark';
            const x = Math.random() * box.width;
            const y = 6 + Math.random() * 10;
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;
            rel.appendChild(p);
            setTimeout(() => p.remove(), 1200);
        }
    }
    // --------------------------------------------------------------------------

    _css() {
        return `
:host{
  --glow-color: ${this._glow};
  --anim-ms: ${this._reduceMotion ? '0ms' : this._animMs + 'ms'};
  --text: #d7f7ff;
  --muted: #9bd6e2;
  --card-bg: rgba(0,0,0,0.35);
  display:block;
  color: var(--text);
  font-family: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial, sans-serif;
}

/* container */
.luminous-accordion{
  background: linear-gradient(135deg, rgba(8,20,31,0.55), rgba(14,29,43,0.55));
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 14px;
  backdrop-filter: blur(8px);
}
.items{ display:flex; flex-direction:column; gap:12px; }

.acc-item{
  background: var(--card-bg);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

/* Afterglow cu memorie */
.acc-item .acc-header::after{
  content:"";
  position:absolute; inset:0; border-radius:8px; pointer-events:none;
  background: radial-gradient(120px 60px at 20% -20%,
              color-mix(in oklab, var(--accent, var(--glow-color)), transparent 75%), transparent 70%);
  opacity: var(--mem, 0);
  filter: blur(14px);
  transition: opacity 600ms ease;
}

.acc-header{
  appearance: none;
  width: 100%;
  text-align: left;
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  color: var(--text);
  border: none;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: .3px;
  position: relative;
}
.acc-header:focus-visible{
  outline: 2px solid var(--accent, var(--glow-color));
  outline-offset: 2px;
  border-radius: 8px;
}

.acc-header .title{ flex:1; }
.acc-header .chev{
  inline-size: 10px; block-size: 10px;
  border-inline-end: 2px solid color-mix(in oklab, var(--accent, var(--glow-color)), white 20%);
  border-block-end: 2px solid color-mix(in oklab, var(--accent, var(--glow-color)), white 20%);
  transform: rotate(-45deg);
  transition: transform var(--anim-ms) ease;
  opacity: .9;
}
.acc-item.expanded .acc-header .chev{ transform: rotate(45deg); }

.acc-panel{
  overflow: hidden;
  background: linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.18));
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 0 18px;
  color: var(--muted);
  will-change: max-height;
}
.acc-panel > * { margin-block: 12px; }

/* Entanglement pulse pe vecini */
.acc-item.ripple .acc-header{
  box-shadow: 0 0 0 0 color-mix(in oklab, var(--accent, var(--glow-color)), transparent 70%);
  animation: ripple-glow 550ms ease-out;
}
@keyframes ripple-glow{
  0%   { box-shadow: 0 0 0 0 color-mix(in oklab, var(--accent, var(--glow-color)), transparent 60%); }
  100% { box-shadow: 0 0 0 22px transparent; }
}

/* Particule decorative */
.spark{
  position: absolute;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent, var(--glow-color)), transparent 60%);
  pointer-events: none;
  transform: translateZ(0);
  animation: spark-fly 1.2s ease-out forwards;
  filter: drop-shadow(0 0 6px var(--accent, var(--glow-color)));
}
@keyframes spark-fly{
  0%{ opacity: .9; transform: translateY(0) scale(1); }
  100%{ opacity: 0; transform: translateY(-22px) translateX(8px) scale(.6); }
}

/* ——— Teme globale la nivel de :host ——— */
:host.theme-cyber{
  --text:#d7f7ff; --muted:#9bd6e2; --card-bg: rgba(12,28,44,.55);
}
:host.theme-plasma{
  --text:#ffe6fb; --muted:#ffc9f1; --card-bg: rgba(26,18,36,.55);
  --glow-color: ${this._theme === 'plasma' ? '#ff00ff' : this._glow};
}
:host.theme-matrix{
  --text:#d9ffe6; --muted:#b9ffd1; --card-bg: rgba(12,24,18,.55);
  --glow-color: ${this._theme === 'matrix' ? '#00ff80' : this._glow};
}
:host.theme-solar{
  --text:#fff3db; --muted:#ffe1a8; --card-bg: rgba(40,24,14,.55);
  --glow-color: ${this._theme === 'solar' ? '#ffcc00' : this._glow};
}
`;
    }
}

customElements.define('l-luminous-accordion', LLuminousAccordion);
