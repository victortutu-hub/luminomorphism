/**
 * l-magnetic-cursor.js v2.0.0
 * Luminomorphism — optimized magnetic cursor with refined effects
 * Fixes: removed annoying trail, improved performance, cleaner visuals
 */
(() => {
    'use strict';

    class LMagneticCursor extends HTMLElement {
        static get observedAttributes() {
            return [
                'strength', 'mode', 'max-distance', 'particle-count',
                'show-particles', 'show-field', 'color-scheme', 'target-selector',
                'enable-click-effects', 'enable-arcs', 'particle-magnetism', 'subtlety'
            ];
        }

        constructor() {
            super();
            this.attachShadow({ mode: 'open' });

            // Core state
            this.mouse = { x: 0, y: 0, vx: 0, vy: 0, pressed: false };
            this.elements = [];
            this.particles = [];
            this.clickEffects = [];
            this.electricArcs = [];
            this.isActive = false;
            this.isMoving = false; // Track mouse movement state
            this.lastMoveTime = 0; // Track last movement time
            this.animationId = 0;
            this.lastMouseUpdate = 0;
            this.updateThrottle = 12; // Improved from 16ms
            this._lastT = 0;
            this.dpr = Math.max(1, window.devicePixelRatio || 1);

            // Performance tracking
            this.frameCount = 0;
            this.performanceMode = 'auto'; // auto, high, low

            // Config with better defaults
            this.config = {
                strength: 1.2, // Reduced from 1.5
                mode: 'attract',
                maxDistance: 120, // Reduced from 150
                particleCount: 8, // Reduced from 12
                showParticles: true,
                showField: false,
                enableClickEffects: true,
                enableArcs: false, // Disabled by default for performance
                particleMagnetism: true,
                subtlety: 0.7, // New: controls overall effect intensity
                colorScheme: 'electric',
                targetSelector: '.magnetic, [data-magnetic], button, a, input, textarea'
            };

            // Refined physics
            this.physics = {
                maxOffset: 20, // Reduced from 28
                k: 25, // Reduced spring constant
                damping: 15, // Reduced damping
                particleRepulsion: 30,
                particleAttraction: 60,
                arcThreshold: 60, // Reduced from 80
                clickForce: 200 // Reduced from 300
            };

            // Bindings
            this._onMove = this.handleMouseMove.bind(this);
            this._onLeave = this.handleMouseLeave.bind(this);
            this._onResize = this.handleResize.bind(this);
            this._onScroll = this.handleScroll.bind(this);
            this._onClick = this.handleClick.bind(this);
            this._tick = this.animate.bind(this);

            this._moTimer = 0;
            this._scrollTimer = 0;
        }

        connectedCallback() {
            try {
                if (this.animationId) cancelAnimationFrame(this.animationId);
                this.init();
            } catch (e) {
                console.warn('LMagneticCursor init error:', e);
            }
        }

        disconnectedCallback() {
            this.cleanup();
        }

        attributeChangedCallback(name, oldV, newV) {
            if (oldV === newV) return;
            this.updateConfig();
            const needsReinit = ['color-scheme', 'target-selector', 'particle-count'].includes(name);
            if (needsReinit && this.canvas) {
                this.reinitialize();
            }
        }

        init() {
            this.updateConfig();
            this.createShadowContent();
            this.setupEventListeners();
            this.findMagneticElements();
            this.initParticles();
            this.detectPerformanceMode();
            this.startAnimation();
        }

        updateConfig() {
            const attr = (k, d) => this.getAttribute(k) ?? d;
            this.config.strength = Math.max(0.1, Math.min(3, parseFloat(attr('strength', 1.2))));
            this.config.mode = String(attr('mode', 'attract'));
            this.config.maxDistance = Math.max(50, Math.min(200, parseInt(attr('max-distance', 120))));
            this.config.particleCount = Math.max(3, Math.min(20, parseInt(attr('particle-count', 8))));
            this.config.showParticles = String(attr('show-particles', 'true')) !== 'false';
            this.config.showField = String(attr('show-field', 'false')) === 'true';
            this.config.enableClickEffects = String(attr('enable-click-effects', 'true')) !== 'false';
            this.config.enableArcs = String(attr('enable-arcs', 'false')) === 'true';
            this.config.particleMagnetism = String(attr('particle-magnetism', 'true')) !== 'false';
            this.config.subtlety = Math.max(0.1, Math.min(1, parseFloat(attr('subtlety', 0.7))));
            this.config.colorScheme = String(attr('color-scheme', 'electric'));
            this.config.targetSelector = String(attr('target-selector', this.config.targetSelector));
        }

        createShadowContent() {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });

            this.cursor = document.createElement('div');
            this.cursorTrail = document.createElement('div');

            const style = document.createElement('style');
            style.textContent = this.getComponentStyles();

            this.canvas.className = 'magnetic-canvas';
            this.cursor.className = 'magnetic-cursor';
            this.cursorTrail.className = 'magnetic-cursor-trail';

            this.shadowRoot.appendChild(style);
            this.shadowRoot.appendChild(this.canvas);
            this.shadowRoot.appendChild(this.cursor);
            this.shadowRoot.appendChild(this.cursorTrail);

            this.resizeCanvas(true);
        }

        getComponentStyles() {
            const c = this.getColors();
            const subtlety = this.config.subtlety;

            return `
                :host {
                    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
                    display: block; contain: layout style paint;
                }
                .magnetic-canvas {
                    position: absolute; inset: 0; width: 100%; height: 100%;
                    mix-blend-mode: screen; pointer-events: none;
                    will-change: transform;
                }
                .magnetic-cursor {
                    position: absolute; width: 16px; height: 16px; border-radius: 50%;
                    background: radial-gradient(circle, ${c.primary_rgba(0.8 * subtlety)}, ${c.primary_rgba(0.2 * subtlety)}, transparent);
                    transform: translate(-8px, -8px); pointer-events: none; 
                    transition: transform 0.08s ease-out, box-shadow 0.15s ease;
                    box-shadow: 0 0 12px ${c.primary_rgba(0.3 * subtlety)};
                    will-change: transform, box-shadow;
                }
                .magnetic-cursor.clicked {
                    transform: translate(-8px, -8px) scale(1.3);
                    box-shadow: 0 0 20px ${c.primary_rgba(0.6 * subtlety)};
                }
                .magnetic-cursor-trail {
                    position: absolute; width: 24px; height: 24px; border-radius: 50%;
                    background: radial-gradient(circle, ${c.primary_rgba(0.3 * subtlety)}, ${c.primary_rgba(0.1 * subtlety)}, transparent);
                    transform: translate(-12px, -12px); pointer-events: none; 
                    transition: all 0.3s ease-out; opacity: 0;
                    will-change: transform, opacity;
                }
                .magnetic-cursor-trail.active {
                    opacity: 1;
                    transition: all 0.15s ease-out;
                }
                .luminomorphism-magnetic-active {
                    transition: box-shadow 0.15s ease, filter 0.12s ease, transform 0.1s ease !important;
                    will-change: transform, box-shadow !important;
                    position: relative !important;
                    z-index: 100 !important;
                }
                
                /* Performance optimizations for mobile */
                @media (max-width: 768px), (pointer: coarse) {
                    :host { display: none; }
                }
                
                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    .magnetic-cursor { transition: none !important; }
                    .magnetic-cursor-trail { transition: none !important; }
                    .luminomorphism-magnetic-active { transition: none !important; }
                }
            `;
        }

        setupEventListeners() {
            // Passive listeners for better performance
            const passiveOpts = { passive: true };

            document.addEventListener('mousemove', this._onMove, passiveOpts);
            document.addEventListener('mouseleave', this._onLeave, passiveOpts);
            document.addEventListener('click', this._onClick);
            window.addEventListener('resize', this._onResize, passiveOpts);
            window.addEventListener('scroll', this._onScroll, passiveOpts);

            // Optimized mutation observer
            if (window.MutationObserver) {
                this.mutationObserver = new MutationObserver(() => {
                    clearTimeout(this._moTimer);
                    this._moTimer = setTimeout(() => this.findMagneticElements(), 200);
                });
                this.mutationObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class', 'data-magnetic', 'data-magnetic-strength']
                });
            }
        }

        handleMouseMove(e) {
            const now = performance.now();
            if (now - this.lastMouseUpdate < this.updateThrottle) return;

            // Smooth velocity calculation
            const px = this.mouse.x, py = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            // Track movement state
            const moved = (px !== this.mouse.x || py !== this.mouse.y);
            if (moved) {
                this.isMoving = true;
                this.lastMoveTime = now;

                const rawVx = (this.mouse.x - px) * 0.6;
                const rawVy = (this.mouse.y - py) * 0.6;
                this.mouse.vx = this.mouse.vx * 0.8 + rawVx * 0.2;
                this.mouse.vy = this.mouse.vy * 0.8 + rawVy * 0.2;
            }

            this.lastMouseUpdate = now;
            this.isActive = true;

            // Update cursor position
            if (this.cursor) {
                this.cursor.style.transform = `translate(${this.mouse.x - 8}px, ${this.mouse.y - 8}px)`;
            }

            // Update trail position and state
            if (this.cursorTrail) {
                this.cursorTrail.style.transform = `translate(${this.mouse.x - 12}px, ${this.mouse.y - 12}px)`;

                // Show trail when moving fast
                const speed = Math.hypot(this.mouse.vx, this.mouse.vy);
                if (speed > 2 && this.isMoving) {
                    this.cursorTrail.classList.add('active');
                }
            }
        }

        handleMouseLeave() {
            this.isActive = false;
        }

        handleClick(e) {
            if (!this.config.enableClickEffects) return;

            // Subtle click effect on cursor
            if (this.cursor) {
                this.cursor.classList.add('clicked');
                setTimeout(() => this.cursor?.classList.remove('clicked'), 150);
            }

            // Refined click explosion
            this.createClickEffect(e.clientX, e.clientY);
        }

        handleResize() {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(() => {
                this.resizeCanvas();
                this.refreshRects();
                this.detectPerformanceMode();
            }, 100);
        }

        handleScroll() {
            clearTimeout(this._scrollTimer);
            this._scrollTimer = setTimeout(() => this.refreshRects(), 100);
        }

        detectPerformanceMode() {
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isSlowDevice = this.dpr < 1.5 && window.innerWidth * window.innerHeight < 1920 * 1080;

            if (isMobile || isSlowDevice) {
                this.performanceMode = 'low';
                this.config.particleCount = Math.min(this.config.particleCount, 4);
                this.updateThrottle = 20;
            } else {
                this.performanceMode = 'high';
            }
        }

        createClickEffect(x, y) {
            const effect = {
                x, y, life: 1.0, maxLife: 0.6,
                particles: []
            };

            // Fewer, more refined particles
            const particleCount = this.performanceMode === 'low' ? 4 : 6;
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount;
                const speed = 80 + Math.random() * 60;
                effect.particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 2 + 1,
                    life: 1.0
                });
            }

            this.clickEffects.push(effect);
        }

        resizeCanvas(first = false) {
            if (!this.canvas) return;

            this.dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
            const w = Math.max(1, Math.floor(window.innerWidth * this.dpr));
            const h = Math.max(1, Math.floor(window.innerHeight * this.dpr));

            if (this.canvas.width !== w || this.canvas.height !== h) {
                this.canvas.width = w;
                this.canvas.height = h;
                this.canvas.style.width = window.innerWidth + 'px';
                this.canvas.style.height = window.innerHeight + 'px';

                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.ctx.scale(this.dpr, this.dpr);
            }

            if (!first) {
                const style = this.shadowRoot.querySelector('style');
                if (style) style.textContent = this.getComponentStyles();
            }
        }

        findMagneticElements() {
            // Clean up previous elements
            for (const it of this.elements) {
                const el = it.element;
                if (el?.style) {
                    el.style.transform = it.originalTransform || '';
                    el.style.boxShadow = '';
                    el.style.filter = '';
                    el.classList.remove('luminomorphism-magnetic-active');
                }
            }

            try {
                const list = document.querySelectorAll(this.config.targetSelector);
                this.elements = Array.from(list)
                    .filter(el => el !== this && el.nodeType === Node.ELEMENT_NODE)
                    .map(el => {
                        const rect = el.getBoundingClientRect();
                        return {
                            element: el,
                            rect,
                            originalTransform: el.style.transform || '',
                            offset: { x: 0, y: 0 },
                            vel: { x: 0, y: 0 },
                            strength: Math.max(0.1, Math.min(3, parseFloat(el.dataset.magneticStrength || '1'))),
                            lastDistance: Infinity,
                            ripplePhase: 0
                        };
                    });
            } catch (e) {
                console.warn('findMagneticElements error:', e);
                this.elements = [];
            }
        }

        refreshRects() {
            for (const it of this.elements) {
                if (it.element?.getBoundingClientRect) {
                    it.rect = it.element.getBoundingClientRect();
                }
            }
        }

        initParticles() {
            const n = this.config.particleCount;
            if (this.particles.length === n) return;

            this.particles.length = 0;
            const W = window.innerWidth || 800, H = window.innerHeight || 600;

            for (let i = 0; i < n; i++) {
                this.particles.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    vx: 0, vy: 0,
                    size: Math.random() * 2 + 1,
                    energy: Math.random() * 0.4 + 0.6,
                    trail: [],
                    life: 1,
                    baseSize: Math.random() * 2 + 1,
                    personality: Math.random()
                });
            }
        }

        startAnimation() {
            if (!this.animationId) {
                this.animationId = requestAnimationFrame(this._tick);
            }
        }

        animate(t) {
            try {
                const dt = Math.min(0.025, this._lastT ? (t - this._lastT) / 1000 : 0.016);
                this._lastT = t;
                this.frameCount++;

                // Check if mouse stopped moving
                const now = performance.now();
                if (now - this.lastMoveTime > 100) { // 100ms threshold
                    this.isMoving = false;
                    // Gradually fade velocity
                    this.mouse.vx *= 0.95;
                    this.mouse.vy *= 0.95;
                }

                // Manage cursor trail fade-out
                if (this.cursorTrail) {
                    if (!this.isMoving || Math.hypot(this.mouse.vx, this.mouse.vy) < 1) {
                        this.cursorTrail.classList.remove('active');
                    }
                }

                // Clear canvas efficiently
                this.ctx.save();
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.restore();

                if (this.isActive) {
                    this.updateMagneticElements(dt);

                    if (this.config.showParticles) {
                        this.updateParticles(dt);
                        this.renderParticles();

                        if (this.config.enableArcs && this.frameCount % 2 === 0) {
                            this.updateElectricArcs(dt);
                            this.renderElectricArcs();
                        }
                    }

                    if (this.config.showField) this.renderField();
                    this.renderCursorGlow();
                }

                if (this.config.enableClickEffects) {
                    this.updateClickEffects(dt);
                    this.renderClickEffects();
                }

                this.animationId = requestAnimationFrame(this._tick);
            } catch (e) {
                console.warn('Animation error:', e);
                this.animationId = requestAnimationFrame(this._tick);
            }
        }

        updateMagneticElements(dt) {
            const maxD = this.config.maxDistance;
            const mode = this.config.mode;
            const k = this.physics.k;
            const c = this.physics.damping;
            const maxOff = this.physics.maxOffset;
            const colors = this.getColors();
            const subtlety = this.config.subtlety;

            for (const it of this.elements) {
                const el = it.element;
                if (!el) continue;

                try {
                    const r = it.rect;
                    const cx = r.left + r.width / 2;
                    const cy = r.top + r.height / 2;

                    const dx = this.mouse.x - cx;
                    const dy = this.mouse.y - cy;
                    const dist = Math.hypot(dx, dy) || 0.001;
                    const effD = maxD * it.strength;

                    let tx = 0, ty = 0;

                    if (dist < effD) {
                        const t = (1 - dist / effD) * this.config.strength * subtlety;
                        const nx = dx / dist, ny = dy / dist;

                        // Refined speed responsiveness
                        const speed = Math.hypot(this.mouse.vx, this.mouse.vy);
                        const speedMultiplier = 1 + Math.min(speed * 0.015, 0.3);

                        switch (mode) {
                            case 'repel':
                                tx = -nx * maxOff * t * speedMultiplier;
                                ty = -ny * maxOff * t * speedMultiplier;
                                break;
                            case 'orbit':
                                tx = -ny * maxOff * 0.6 * t + nx * maxOff * 0.15 * t;
                                ty = nx * maxOff * 0.6 * t + ny * maxOff * 0.15 * t;
                                break;
                            case 'quantum':
                                const jitter = 0.08 * maxOff * t;
                                tx = nx * maxOff * t + (Math.random() - 0.5) * jitter;
                                ty = ny * maxOff * t + (Math.random() - 0.5) * jitter;
                                break;
                            default: // attract
                                tx = nx * maxOff * t * speedMultiplier;
                                ty = ny * maxOff * t * speedMultiplier;
                        }

                        // Refined visual feedback
                        const intensity = Math.min((1 - dist / effD) * 0.8, 1) * subtlety;
                        const glowSize = 15 + intensity * 25;
                        const glowOpacity = 0.7 * intensity;

                        el.style.boxShadow = `0 0 ${glowSize}px ${colors.glow_rgba(glowOpacity)}`;
                        el.style.filter = `brightness(${1 + intensity * 0.2}) saturate(${1 + intensity * 0.15})`;
                        el.classList.add('luminomorphism-magnetic-active');

                        // Subtle entrance ripple
                        if (it.lastDistance >= effD && dist < effD) {
                            it.ripplePhase = 0.8;
                        }
                    } else {
                        el.style.boxShadow = '';
                        el.style.filter = '';
                        el.classList.remove('luminomorphism-magnetic-active');
                    }

                    it.lastDistance = dist;

                    // Update entrance ripple
                    if (it.ripplePhase > 0) {
                        it.ripplePhase = Math.max(0, it.ripplePhase - dt * 3);
                        if (it.ripplePhase > 0) {
                            const rippleSize = (0.8 - it.ripplePhase) * 30;
                            const rippleOpacity = it.ripplePhase * 0.4 * subtlety;
                            el.style.boxShadow += `, 0 0 ${rippleSize}px ${colors.primary_rgba(rippleOpacity)}`;
                        }
                    }

                    // Optimized physics update
                    const ax = k * (tx - it.offset.x) - c * it.vel.x;
                    const ay = k * (ty - it.offset.y) - c * it.vel.y;

                    it.vel.x += ax * dt;
                    it.vel.y += ay * dt;
                    it.offset.x += it.vel.x * dt;
                    it.offset.y += it.vel.y * dt;

                    // Clamp offset
                    const len = Math.hypot(it.offset.x, it.offset.y);
                    if (len > maxOff) {
                        const f = maxOff / len;
                        it.offset.x *= f;
                        it.offset.y *= f;
                    }

                    const base = it.originalTransform ? it.originalTransform + ' ' : '';
                    el.style.transform = `${base}translate3d(${it.offset.x}px, ${it.offset.y}px, 0)`;
                } catch (e) {
                    console.warn('Element update error:', e);
                }
            }
        }

        updateParticles(dt) {
            const maxD = this.config.maxDistance;
            const W = window.innerWidth || 800, H = window.innerHeight || 600;
            const subtlety = this.config.subtlety;

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                // Mouse attraction with subtlety
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.hypot(dx, dy) || 0.001;

                if (dist < maxD) {
                    const force = (1 - dist / maxD) * 0.4 * p.personality * subtlety;
                    const nx = dx / dist, ny = dy / dist;
                    p.vx += nx * force * p.energy * dt;
                    p.vy += ny * force * p.energy * dt;
                }

                // Simplified particle interactions
                if (this.config.particleMagnetism && this.frameCount % 2 === 0) {
                    for (let j = i + 1; j < this.particles.length; j++) {
                        const p2 = this.particles[j];
                        const pdx = p2.x - p.x;
                        const pdy = p2.y - p.y;
                        const pdist = Math.hypot(pdx, pdy) || 0.001;

                        if (pdist < 40) {
                            const force = (1 - pdist / 40) * 0.3 * dt;
                            const nx = pdx / pdist, ny = pdy / pdist;
                            p.vx -= nx * force; p.vy -= ny * force;
                            p2.vx += nx * force; p2.vy += ny * force;
                        }
                    }
                }

                // Subtle mouse velocity influence
                p.vx += this.mouse.vx * 0.01 * dt;
                p.vy += this.mouse.vy * 0.01 * dt;

                // Update position
                p.x += p.vx * 60 * dt; // Normalize for 60fps
                p.y += p.vy * 60 * dt;

                // Damping
                p.vx *= Math.exp(-3 * dt);
                p.vy *= Math.exp(-3 * dt);

                // Boundary wrapping
                if (p.x < 0) p.x = W;
                if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H;
                if (p.y > H) p.y = 0;

                // Simplified trail
                if (this.frameCount % 3 === 0) {
                    p.trail.push({ x: p.x, y: p.y, life: 0.8 });
                    if (p.trail.length > 6) p.trail.shift();
                }

                p.trail.forEach(point => point.life = Math.max(0, point.life - dt * 2));

                // Dynamic size
                const speed = Math.hypot(p.vx, p.vy);
                p.size = p.baseSize * (1 + Math.min(speed * 0.05, 0.3));
            }
        }

        updateElectricArcs(dt) {
            this.electricArcs.length = 0;

            if (this.performanceMode === 'low') return;

            const threshold = this.physics.arcThreshold;
            const subtlety = this.config.subtlety;

            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p1 = this.particles[i];
                    const p2 = this.particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < threshold) {
                        const intensity = (1 - dist / threshold) * subtlety;
                        if (Math.random() < intensity * 0.2 * dt * 60) {
                            this.electricArcs.push({
                                x1: p1.x, y1: p1.y,
                                x2: p2.x, y2: p2.y,
                                intensity: intensity * 0.6,
                                life: 0.1 + Math.random() * 0.05
                            });
                        }
                    }
                }
            }

            for (let i = this.electricArcs.length - 1; i >= 0; i--) {
                const arc = this.electricArcs[i];
                arc.life -= dt;
                if (arc.life <= 0) {
                    this.electricArcs.splice(i, 1);
                }
            }
        }

        updateClickEffects(dt) {
            for (let i = this.clickEffects.length - 1; i >= 0; i--) {
                const effect = this.clickEffects[i];
                effect.life -= dt / effect.maxLife;

                if (effect.life <= 0) {
                    this.clickEffects.splice(i, 1);
                    continue;
                }

                effect.particles.forEach(p => {
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    p.vx *= 0.95;
                    p.vy *= 0.95;
                    p.life = effect.life;
                });
            }
        }

        renderParticles() {
            const c = this.ctx, col = this.getColors();
            const subtlety = this.config.subtlety;

            for (const p of this.particles) {
                // Simplified trail
                if (p.trail.length > 1) {
                    c.beginPath();
                    c.moveTo(p.trail[0].x, p.trail[0].y);
                    for (let i = 1; i < p.trail.length; i++) {
                        c.lineTo(p.trail[i].x, p.trail[i].y);
                    }
                    c.strokeStyle = col.particle_rgba(0.2 * p.life * subtlety);
                    c.lineWidth = 1;
                    c.stroke();
                }

                // Refined particle with subtle glow
                const glowSize = p.size * 3 * p.life;
                const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                g.addColorStop(0, col.particle_rgba(p.life * subtlety));
                g.addColorStop(0.4, col.primary_rgba(p.life * 0.5 * subtlety));
                g.addColorStop(1, 'rgba(0,0,0,0)');

                c.fillStyle = g;
                c.beginPath();
                c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                c.fill();
            }
        }

        renderElectricArcs() {
            if (!this.electricArcs.length) return;

            const c = this.ctx, col = this.getColors();
            const subtlety = this.config.subtlety;

            for (const arc of this.electricArcs) {
                const opacity = arc.life / 0.15 * arc.intensity * subtlety;

                c.strokeStyle = col.primary_rgba(opacity);
                c.lineWidth = 1.5;
                c.beginPath();
                c.moveTo(arc.x1, arc.y1);
                c.lineTo(arc.x2, arc.y2);
                c.stroke();
            }
        }

        renderClickEffects() {
            const c = this.ctx, col = this.getColors();
            const subtlety = this.config.subtlety;

            for (const effect of this.clickEffects) {
                for (const p of effect.particles) {
                    const size = p.size * p.life;
                    const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5);
                    g.addColorStop(0, col.primary_rgba(p.life * subtlety));
                    g.addColorStop(0.6, col.secondary_rgba(p.life * 0.4 * subtlety));
                    g.addColorStop(1, 'rgba(0,0,0,0)');

                    c.fillStyle = g;
                    c.beginPath();
                    c.arc(p.x, p.y, size, 0, Math.PI * 2);
                    c.fill();
                }
            }
        }

        renderField() {
            const c = this.ctx, col = this.getColors();
            const subtlety = this.config.subtlety;
            const g = c.createRadialGradient(
                this.mouse.x, this.mouse.y, 0,
                this.mouse.x, this.mouse.y, this.config.maxDistance
            );
            g.addColorStop(0, col.primary_rgba(0.06 * subtlety));
            g.addColorStop(0.5, col.primary_rgba(0.03 * subtlety));
            g.addColorStop(1, 'rgba(0,0,0,0)');

            c.fillStyle = g;
            c.beginPath();
            c.arc(this.mouse.x, this.mouse.y, this.config.maxDistance, 0, Math.PI * 2);
            c.fill();
        }

        renderCursorGlow() {
            const c = this.ctx, col = this.getColors();
            const subtlety = this.config.subtlety;

            // Refined cursor glow
            const speed = Math.hypot(this.mouse.vx, this.mouse.vy);
            const glowSize = 20 + Math.min(speed * 1.5, 10);
            const g = c.createRadialGradient(
                this.mouse.x, this.mouse.y, 0,
                this.mouse.x, this.mouse.y, glowSize
            );

            g.addColorStop(0, col.primary_rgba(0.8 * subtlety));
            g.addColorStop(0.4, col.primary_rgba(0.4 * subtlety));
            g.addColorStop(1, 'rgba(0,0,0,0)');

            c.fillStyle = g;
            c.beginPath();
            c.arc(this.mouse.x, this.mouse.y, glowSize, 0, Math.PI * 2);
            c.fill();

            // Subtle velocity streak for fast movement
            if (speed > 5) {
                const intensity = Math.min(speed / 20, 0.6) * subtlety;
                const length = intensity * 40;
                const g2 = c.createLinearGradient(
                    this.mouse.x, this.mouse.y,
                    this.mouse.x - this.mouse.vx * length, this.mouse.y - this.mouse.vy * length
                );
                g2.addColorStop(0, col.primary_rgba(intensity));
                g2.addColorStop(1, 'rgba(0,0,0,0)');

                c.strokeStyle = g2;
                c.lineWidth = 2;
                c.beginPath();
                c.moveTo(this.mouse.x, this.mouse.y);
                c.lineTo(this.mouse.x - this.mouse.vx * length, this.mouse.y - this.mouse.vy * length);
                c.stroke();
            }
        }

        getColors() {
            const schemes = {
                electric: { primary: '#00ffff', secondary: '#0088ff', particle: '#ffffff', glow: '#00ffff' },
                plasma: { primary: '#ff0080', secondary: '#ff8000', particle: '#ffff88', glow: '#ff0080' },
                aurora: { primary: '#00ff80', secondary: '#8000ff', particle: '#80ff80', glow: '#00ff80' },
                quantum: { primary: '#ff00ff', secondary: '#00ffff', particle: '#ffffff', glow: '#ff00ff' },
                subtle: { primary: '#88ccff', secondary: '#ccaaff', particle: '#ffffff', glow: '#88ccff' }
            };
            const base = schemes[this.config.colorScheme] || schemes.electric;

            const hexToRgb = (hex) => {
                const m = hex.replace('#', '');
                const v = m.length === 3 ? m.split('').map(x => x + x).join('') : m;
                return {
                    r: parseInt(v.slice(0, 2), 16),
                    g: parseInt(v.slice(2, 4), 16),
                    b: parseInt(v.slice(4, 6), 16)
                };
            };

            const rgba = (hex, a) => {
                const { r, g, b } = hexToRgb(hex);
                return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
            };

            return {
                primary_rgba: (a) => rgba(base.primary, a),
                secondary_rgba: (a) => rgba(base.secondary, a),
                particle_rgba: (a) => rgba(base.particle, a),
                glow_rgba: (a) => rgba(base.glow, a)
            };
        }

        reinitialize() {
            try {
                this.findMagneticElements();
                this.initParticles();
                const style = this.shadowRoot.querySelector('style');
                if (style) style.textContent = this.getComponentStyles();
            } catch (e) {
                console.warn('Reinit error:', e);
            }
        }

        cleanup() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = 0;
            }

            // Clean up timers
            [this._moTimer, this._scrollTimer, this._resizeTimer].forEach(timer => {
                if (timer) clearTimeout(timer);
            });

            // Remove event listeners
            document.removeEventListener('mousemove', this._onMove);
            document.removeEventListener('mouseleave', this._onLeave);
            document.removeEventListener('click', this._onClick);
            window.removeEventListener('resize', this._onResize);
            window.removeEventListener('scroll', this._onScroll);

            if (this.mutationObserver) {
                this.mutationObserver.disconnect();
            }

            // Reset element styles
            for (const it of this.elements) {
                const el = it.element;
                if (el?.style) {
                    el.style.transform = it.originalTransform || '';
                    el.style.boxShadow = '';
                    el.style.filter = '';
                    el.classList.remove('luminomorphism-magnetic-active');
                }
            }
        }

        // Public API
        setStrength(v) { this.setAttribute('strength', Math.max(0.1, Math.min(3, v))); }
        setMode(m) { if (['attract', 'repel', 'orbit', 'quantum'].includes(m)) this.setAttribute('mode', m); }
        setColorScheme(s) { if (['electric', 'plasma', 'aurora', 'quantum', 'subtle'].includes(s)) this.setAttribute('color-scheme', s); }
        setSubtlety(v) { this.setAttribute('subtlety', Math.max(0.1, Math.min(1, v))); }

        toggleParticles() {
            const cur = this.getAttribute('show-particles') !== 'false';
            this.setAttribute('show-particles', cur ? 'false' : 'true');
        }

        toggleField() {
            const cur = this.getAttribute('show-field') === 'true';
            this.setAttribute('show-field', cur ? 'false' : 'true');
        }
    }

    if (!customElements.get('l-magnetic-cursor')) {
        customElements.define('l-magnetic-cursor', LMagneticCursor);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = LMagneticCursor;
    }
})();