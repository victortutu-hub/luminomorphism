# 🌟 Luminomorphism — Documentație în limba română

[![npm version](https://img.shields.io/npm/v/luminomorphism.svg)](https://www.npmjs.com/package/luminomorphism)
[![License](https://img.shields.io/npm/l/luminomorphism.svg)](https://github.com/victortutu-hub/luminomorphism/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dw/luminomorphism.svg)](https://www.npmjs.com/package/luminomorphism)
[![GitHub stars](https://img.shields.io/github/stars/victortutu-hub/luminomorphism?style=social)](https://github.com/victortutu-hub/luminomorphism/stargazers)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/luminomorphism)](https://bundlephobia.com/result?p=luminomorphism)

**Luminomorphism** este un sistem de design UI de nouă generație, care transformă elementele de interfață în componente reactive la lumină și mișcare.  
Combină principii de design fluid, feedback senzorial și mișcare futuristă pentru a crea o experiență digitală luminoasă și interactivă.

> ✨ Nu este doar un stil vizual — este o prezență reactivă.

---

## 🚀 Ce îl face unic?

- ✅ Web Components 100% originale — scrise de la zero
- 💡 Inspirat de comportamentul luminii: dispersie, strălucire, reflexie, puls
- 🎯 Creat pentru interfețe creative, artă digitală și UI imersiv
- ⚙️ Fără framework-uri, fără dependențe — doar JavaScript + CSS
- 📱 Complet responsive și optimizat pentru mobil

---

## 🧩 Componente Disponibile

### 🎯 Efecte UI Interactive

| Componentă                | Descriere                                             | Demo |
|--------------------------|--------------------------------------------------------|------|
| **`<l-orbital>`**        | Orbitează puncte luminoase în jurul unui centru        | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-orbital.html) |
| **`<l-orbital-quantum>`** | Orbite cuantice cu entropie și sincron optic         | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-orbital-quantum.html) |
| **`<l-orbital-nav>`**    | Sistem de navigație cu butoane orbitale animate        | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-orbital-nav.html) |
| **`<l-particle-net>`**   | Rețea de particule cu noduri conectate prin lumină     | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-particle-net.html) |
| **`<l-prism-layer>`**    | Efect prismă refractivă ce reacționează la interacțiune| [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-prism-layer.html) |
| **`<l-glow-trail>`**     | Urmă radiantă ce urmărește cursorul                   | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-glow-trail.html) |
| **`<l-ripple-hover>`**   | Explozie circulară de lumină la hover                 | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-ripple-hover.html) |
| **`<l-echo-press>`**     | Ecou radial luminos pornind de la click                | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-echo-press.html) |
| **`<l-magnetic-cluster>`** | Sfere cu fizică Verlet, comportament Boids și atracție magnetică | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-magnetic-cluster.html) |

---

### 🧠 Efecte bazate pe interacțiune

| Componentă               | Descriere                                       | Demo |
|--------------------------|--------------------------------------------------|------|
| **`<l-glint-focus>`**    | Emite o reflexie mișcătoare la focus input
| **`<l-focus-ring-magnet>`** | Inel luminos magnetic ce urmărește cursorul și pulsează la focus | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-focus-ring-magnet.html) |
       | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-glint-focus.html) |

---

### 🧊 Efecte de fundal și structură

| Componentă                | Descriere                                         | Demo |
|---------------------------|---------------------------------------------------|------|
| **`<l-depth-frame>`**     | Simulează profunzimea 3D prin umbre stratificate | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-depth-frame.html) |
| **`<l-flare-sheen>`**     | Reflexie luminoasă trece peste conținut          | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-flare-sheen.html) |
| **`<l-generative-bg>`**   | Fundal procedural animat și strălucitor          | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-generative-bg.html) |
| **`<l-hologram>`**        | Simulează efecte de hologram și scanare          | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-hologram.html) |
| **`<l-light-ray>`**       | Animă raze de lumină pe o suprafață              | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-light-ray.html) |
| **`<l-mosaic-grid>`**     | Matrice animată cu modele luminoase dinamice     | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-mosaic-grid.html) |
| **`<l-pulse-bubble>`**    | Bulă luminoasă ce pulsează                       | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-pulse-bubble.html) |

---

### 🖼️ Experimente Vizuale

| Pagini Speciale                | Descriere                                 | Demo |
|-------------------------------|-------------------------------------------|------|
| `l-gallery.html`              | Galerie luminomorfică clasică             | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-gallery.html) |
| `l-gallery-molecule.html`     | Galerie tip „moleculă” interactivă        | [Demo](https://victortutu-hub.github.io/luminomorphism/labs/l-gallery-molecule.html) |

---

## ✨ Exemplu pentru `<l-magnetic-cluster>`

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

---

## 📦 Instalare

```bash
npm install luminomorphism
```

---

## 📁 Structură Foldere

```
luminomorphism/
├── dist/        → Componente minificate
├── docs/labs/   → Fișiere pentru demo-uri GitHub Pages
├── README.md    → Documentație în engleză
├── README.RO.md → Această documentație în română
```

---

## 👨‍💻 Autor

Creat de [Victor Mihai (victortutu-hub)](https://github.com/victortutu-hub)  
100% original, scris manual, licențiat MIT.

---

## 📄 Licență

MIT — liber pentru utilizare și modificare.


### `<l-orbital-quantum>` – Simulare orbitală cuantică cu entropie și entanglement optic
O componentă luminomorfică inovatoare care combină animația orbitală cu comportamente inspirate din fizica cuantică. Orbitele pulsează, se rotesc, dispar și reapar în poziții aleatorii, controlate de un parametru de entropie configurabil.

**✨ Caracteristici esențiale:**
- Rotație continuă cu orbite care pulsează independent
- Salturi cuantice: orbitele dispar și reapar neașteptat
- Entanglement optic: o altă orbită reacționează sincron
- Control al haosului cu `quantum-entropy`
- Declarativ, fără framework-uri, 100% compatibil cu HTML

**🔧 Atribute:**

| Atribut             | Descriere                                                  | Exemplu         |
|---------------------|------------------------------------------------------------|-----------------|
| `count`             | Numărul de orbite                                           | `12`            |
| `color`             | Culoarea punctelor luminoase                                | `#00ffff`       |
| `radius`            | Distanța față de centru (în px)                             | `60`            |
| `mode="quantum"`    | Activează modul cuantic                                     |                 |
| `quantum-delay`     | Timpul între salturi (milisecunde)                          | `3000`          |
| `quantum-entropy`   | Gradul de aleatoriu (0.5 = subtil, 3 = extrem de haotic)    | `1.5`           |

**🔍 Utilizare:**
- Atractori vizuali pentru interfețe creative
- Animații de fundal în produse tehnologice
- Metafore pentru inteligență, rețele sau comportament emergent
- Ritmuri vizuale non-interactive, dar expresive

[Demo Live](https://victortutu-hub.github.io/luminomorphism/labs/l-orbital-quantum.html)

---

### ✨ `<l-focus-ring-magnet>` – Inel Magnetic de Focus

Componentă luminomorfică ce afișează un inel luminos magnetic care urmărește cursorul și se atașează automat la elemente interactive apropiate (`button`, `input`, `textarea` etc.).  
Poate pulsa când un element primește focus și reacționează la următoarele atribute:

| Atribut           | Descriere                                                      |
|-------------------|----------------------------------------------------------------|
| `radius`          | Controlează dimensiunea inelului (implicit: `30`)              |
| `color`           | Culoarea efectului luminos (implicit: `#00ffff`)               |
| `magnet-range`    | Distanța în pixeli pentru detectarea elementelor (implicit: `80`) |
| `pulse-on-focus`  | Dacă este prezent, inelul pulsează când un element primește focus |

🧪 Poți controla componenta live folosind input-uri native:

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