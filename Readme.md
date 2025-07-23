# 🌟 Luminomorphism

**Luminomorphism** este un framework de design web care pune în centrul experienței interactivitatea cu lumină, profunzime și mișcare subtilă.

> Refined. Fluid. Luminous.

## 🔮 Caracteristici principale

- **Carduri interactive 3D** cu efect de tilt (mouse + giroscop)
- **Reflexii animate** și **elemente orbitale**
- **Lumină ambientală fluidă** cu `l-glass-shape`
- **Buton cu efect ripple** și iluminare elegantă
- **Compatibil cu mobil, tabletă și TV (responsive + HD patches)**

## 📦 Structură fișiere

```
luminomorphism/
│
├── index.html                  # Pagina principală demo
├── labs/
│   └── l-orbital.html          # Demonstrație pentru componenta <l-orbital>
│
├── luminomorph.css            # Stilul de bază al componentelor
├── luminomorph.button.css     # Stiluri pentru butoane personalizate
├── luminomorph-hdpatch.css    # Optimizare pentru ecrane mari (ex: 1080p/low DPI)
├── luminomorph-responsive.css # Adaptare pentru mobil, tabletă, TV
│
├── luminomorph.js             # Tilt interactiv și suport pentru device motion
├── luminomorph.button.js      # Ripple effect pentru butoane
├── l-orbital.js               # Componenta <l-orbital> (orbite animate)
├── l-glass-shape.js           # Componenta <l-glass-shape> (lumină ambientală)
```

## 🧪 Componente personalizate

### `<l-orbital>`
Generează orbi care se rotesc în jurul unui element central.

**Atribute:**
- `count` — număr de orbite (ex: 12)
- `color` — culoarea orbitei (ex: `#00ffff`)
- `radius` — raza orbitei (ex: `40`)

🔗 [Exemplu în `labs/l-orbital.html`](labs/l-orbital.html)

---

### `<l-glass-shape>`
Formă sferică cu efect de lumină și plutire, pentru fundaluri dinamice.

**Atribute:**
- `glow` — culoare (ex: `#ff00ff`)
- `speed` — `slow`, `medium`, `fast`

---

## 🧠 Inițializare

Include scriptul principal în HTML:

```html
<script src="luminomorph.js"></script>
<script>
  Luminomorph.init({ tilt: true, sound: false });
</script>
```

## 🧰 Utilizare buton cu efect luminomorf

```html
<button class="luminomorph-button">Click Me</button>
```

```html
<script src="luminomorph.button.js"></script>
```

---

## 📱 Responsivitate & HD Support

Sunt incluse fișiere CSS care:

- Scalează componentele pe mobil și tabletă (`luminomorph-responsive.css`)
- Ajustează claritatea pe ecrane mari dar cu DPI redus (`luminomorph-hdpatch.css`)

---

## 🧪 Testare locală

1. Clonează sau descarcă acest repo.
2. Deschide `index.html` într-un browser modern.
3. Navighează la `/labs/` pentru a vedea componentele interactive.

---

## 💡 Obiectiv

**Luminomorphism** este o estetică digitală, nu doar un stil. E construit pentru a inspira noi forme de interacțiune senzorială în UI/UX modern.

---

## 📖 Manifest

Citește [MANIFEST.md](manifest.html) pentru filosofia completă din spatele acestui stil de design.

---

## 🛠 Creat de

[Victor Mihai (victortutu-hub)](https://github.com/victortutu-hub)

---

## 📄 Licență

MIT — liber pentru utilizare și modificare.