# 🌟 Luminomorphism

[![npm version](https://img.shields.io/npm/v/luminomorphism.svg)](https://www.npmjs.com/package/luminomorphism)
[![License](https://img.shields.io/npm/l/luminomorphism.svg)](https://github.com/victortutu-hub/luminomorphism/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dw/luminomorphism.svg)](https://www.npmjs.com/package/luminomorphism)
[![GitHub stars](https://img.shields.io/github/stars/victortutu-hub/luminomorphism?style=social)](https://github.com/victortutu-hub/luminomorphism/stargazers)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/luminomorphism)](https://bundlephobia.com/result?p=luminomorphism)

**Luminomorphism** is a next-generation UI design system that elevates interface elements into living, light-reactive components.  
It blends principles of fluid design, sensory feedback, and futuristic motion to transform digital surfaces into luminous experiences.

> ✨ It's not a visual style — it's a reactive presence.

---

## 🚀 What Makes It Unique?

- ✅ 100% original Web Components — built from scratch
- 💡 Inspired by light behavior: dispersion, glow, ripple, reflection
- 🎯 Designed for creative interfaces, UI art, and immersive products
- ⚙️ No frameworks, no dependencies — pure JavaScript + CSS
- 📱 Fully responsive and mobile-ready

---

## 🧩 Available Components

### 🎯 Interactive UI Effects

| Component                   | Description                                            | Demo Link |
|----------------------------|--------------------------------------------------------|-----------|
| **`<l-orbital>`**          | Orbits glowing dots around a center                    | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-orbital.html) |
| **`<l-orbital-quantum>`** | Quantum orbiting dots with entropy & optical sync | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-orbital-quantum.html) |
| **`<l-orbital-nav>`**      | Navigation system using animated orbital buttons       | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-orbital-nav.html) |
| **`<l-particle-net>`**     | Living particle network with light-linked nodes        | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-particle-net.html) |
| **`<l-prism-layer>`**      | Refractive prism shimmer layer reacting to interaction | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-prism-layer.html) |
| **`<l-glow-trail>`**       | Follows cursor with soft particles and radiant trail   | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-glow-trail.html) |
| **`<l-ripple-hover>`**     | Ripple light burst on hover event                     | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-ripple-hover.html) |
| **`<l-echo-press>`**       | Radial luminous echo expanding from click point        | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-echo-press.html) |
| **`<l-magnetic-cluster>`** | Spheres with Verlet physics, Boids behavior, magnetic field and adaptive glow | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-magnetic-cluster.html) |

---

### 🧠 Input-Aware Enhancers

| Component             | Description                                     | Demo Link |
|----------------------|-------------------------------------------------|-----------|
| **`<l-glint-focus>`** | Emits a scanning glint of light on focus event
| **`<l-focus-ring-magnet>`** | Magnetic light ring that follows the cursor and pulses on focus | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-focus-ring-magnet.html) |
 | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-glint-focus.html) |

---

### 🧊 Structural + Background Effects

| Component               | Description                                           | Demo Link |
|------------------------|-------------------------------------------------------|-----------|
| **`<l-depth-frame>`**    | Simulates 3D depth using layered shadows             | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-depth-frame.html) |
| **`<l-flare-sheen>`**    | Reflective light sheen passes over content           | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-flare-sheen.html) |
| **`<l-generative-bg>`**  | Procedural glowing animated background               | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-generative-bg.html) |
| **`<l-hologram>`**       | Simulates holographic flicker and scan               | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-hologram.html) |
| **`<l-light-ray>`**      | Animates light rays across a surface                 | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-light-ray.html) |
| **`<l-mosaic-grid>`**    | Animated mosaic matrix with shifting light patterns  | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-mosaic-grid.html) |
| **`<l-pulse-bubble>`**   | Floating orb that pulses and glows like plasma       | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-pulse-bubble.html) |
| **`<l-glass-shape>`**    | (pending) Luminous abstract shapes for ambient decor | ⚠️ Not linked |

---

### 🖼️ Creative Layout Experiments

| Component / Page             | Description                                      | Demo Link |
|-----------------------------|--------------------------------------------------|-----------|
| `l-gallery.html`            | Luminomorphic image gallery                      | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-gallery.html) |
| `l-gallery-molecule.html`   | Molecular layout-style gallery                   | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-gallery-molecule.html) |

---

## 🌐 Component Spotlight: `<l-magnetic-cluster>`

A highly interactive, physics-based component that simulates **magnetic clusters** of luminous spheres with adaptive logic and visual glow response.

### 🔧 Attributes

| Attribute   | Description                                           | Example         |
|-------------|-------------------------------------------------------|-----------------|
| `count`     | Number of spheres                                     | `12`            |
| `size`      | Diameter of each sphere (px)                          | `50`            |
| `speed`     | Movement speed multiplier                             | `1.2`           |
| `opacity`   | Sphere fill transparency (0–1)                        | `0.6`           |
| `verlet`    | Enables Verlet Physics logic                          | `true` / `false`|
| `boids`     | Enables Boids-style social behavior                   | `true` / `false`|
| `magnetic`  | Enables magnetic cursor attraction                    | `true` / `false`|

---

### 🌈 Adaptive Glow Logic

Each logic mode or combination applies a different glow:

| Active Modes               | Glow Style               |
|---------------------------|--------------------------|
| None                      | Subtle white ambient     |
| Verlet only               | Soft violet              |
| Boids only                | Dynamic blue             |
| Magnetic only             | Electric cyan            |
| Verlet + Boids            | Violet-blue              |
| Verlet + Magnetic         | Aqua-mint                |
| Boids + Magnetic          | Bright turquoise         |
| All enabled               | Aurora-style hybrid glow |

---

### 🚀 Usage Example

```html
<script src="dist/l-magnetic-cluster.min.js"></script>

<l-magnetic-cluster
  count="12"
  size="40"
  speed="1.5"
  opacity="0.6"
  verlet="true"
  boids="true"
  magnetic="true">
</l-magnetic-cluster>
```

✅ Responsive, lightweight and fully standalone — no frameworks or dependencies required.

📄 [Live Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-magnetic-cluster.html)

---

## 🧠 Philosophy

> Luminomorphism is an interface response, not a decoration.  
> It’s about how light would behave if it could respond to humans.

---

## ⚙️ Getting Started

Use directly in HTML:

```html
<script src="dist/l-orbital.js"></script>

<l-orbital count="12" color="#00ffff" radius="40"></l-orbital>
```

---

## 📦 Installation (soon)

```bash
npm install luminomorphism
```

---

## 📁 Folder Overview

```
luminomorphism/
├── dist/        → All Web Components
├── docs/labs/   → GitHub Pages Demo Files
├── README.md    → English Documentation
├── README.RO.md → Romanian Documentation
```

---

## 👨‍💻 Author

Created by [Victor Mihai (victortutu-hub)](https://github.com/victortutu-hub)  
Original concept. 100% handcrafted. MIT Licensed.

---

## 📄 License

MIT — Open, free, and modifiable.

---

## 🌐 Translations

🇷🇴 [View in Romanian / Vezi versiunea română](./README.RO.md)


### `<l-orbital-quantum>` – Quantum Orbital Simulation with Entropy + Optical Entanglement
A groundbreaking luminomorphic component that combines visual orbital animation with quantum-inspired behavior. Orbits rotate, pulse, disappear, and reappear at randomized positions influenced by configurable entropy levels.

**✨ Key features:**
- Continuous rotation with independently pulsing orbs
- Quantum jumps: orbs vanish and reappear at unpredictable angles
- Optical entanglement: another orb reacts with a glow in sync
- Controlled randomness with `quantum-entropy`
- Fully declarative and framework-free

**🔧 Attributes:**

| Attribute         | Description                                                  | Example           |
|------------------|--------------------------------------------------------------|-------------------|
| `count`          | Number of orbs                                               | `12`              |
| `color`          | Color of glowing orbs                                        | `#00ffff`         |
| `radius`         | Distance from center (in px)                                 | `60`              |
| `mode="quantum"` | Enables quantum leap mode                                    |                   |
| `quantum-delay`  | Time between jumps (ms)                                      | `3000`            |
| `quantum-entropy`| Multiplier of jump randomness (0.5 = smooth, 3 = chaotic)    | `1.5`             |

**🔍 Use Cases:**
- Dynamic visual attractors for creative UIs
- Background animation in tech-themed products
- Artistic metaphors for intelligence or unpredictability
- Non-interactive yet expressive visual rhythms

[Live Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-orbital-quantum.html)

---

### ✨ `<l-focus-ring-magnet>` – Magnetic Focus Ring

A luminomorphic component that displays a glowing magnetic ring which follows the cursor and attaches to nearby interactive elements (`button`, `input`, `textarea`, etc.).  
It can pulse when elements are focused and responds to the following attributes:

| Attribute         | Description                                                        |
|------------------|--------------------------------------------------------------------|
| `radius`         | Controls visual size of the ring (default: `30`)                  |
| `color`          | Sets the glow color (default: `#00ffff`)                          |
| `magnet-range`   | Distance in pixels for magnetic attraction (default: `80`)        |
| `pulse-on-focus` | If present, makes the ring pulse on focused elements              |

🧪 You can control it live using native inputs:

```html
<l-focus-ring-magnet id="focusRing" radius="40" color="#00ffff" magnet-range="100" pulse-on-focus></l-focus-ring-magnet>

<input type="color" id="colorPicker" />
<input type="range" id="radiusRange" min="10" max="100" />
<input type="range" id="magnetRange" min="0" max="200" />
<input type="checkbox" id="pulseToggle" checked />

<script>
  const ring = document.getElementById('focusRing');
  document.getElementById('colorPicker').oninput = e => ring.setAttribute('color', e.target.value);
  document.getElementById('radiusRange').oninput = e => ring.setAttribute('radius', e.target.value);
  document.getElementById('magnetRange').oninput = e => ring.setAttribute('magnet-range', e.target.value);
  document.getElementById('pulseToggle').onchange = e =>
    e.target.checked ? ring.setAttribute('pulse-on-focus', '') : ring.removeAttribute('pulse-on-focus');
</script>
```