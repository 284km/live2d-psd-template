# live2d-psd-template

> 日本語版: [README.ja.md](README.ja.md)

Generate Live2D-ready PSD templates from YAML layer structure definitions.

Live2D models require a PSD with properly separated layers (hair, face parts, eyes, mouth, etc.). Setting up this structure from scratch every time is tedious and error-prone. This tool lets you:

- **Define the layer structure in YAML** — version-controllable, diff-able
- **Regenerate the PSD anytime** — change the YAML, rerun the script
- **Register as a Clip Studio Paint template** — reuse instantly for every new character

---

## Requirements

- Node.js 20+
- macOS / Linux / Windows (any platform supported by the `canvas` package prebuilt binaries)

## Setup

```bash
git clone https://github.com/284km/live2d-psd-template.git
cd live2d-psd-template
npm install
```

`npm install` may take a few minutes because of the `canvas` package.

### If `canvas` fails to install on macOS

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

---

## Usage

### Generate a single template

```bash
node generate.mjs templates/phase1-minimum.yaml
# → output/Live2D_Phase1_Minimum.psd
```

### Via npm scripts

```bash
npm run generate:phase1   # Phase 1 (minimum, ~15 layers)
npm run generate:phase2   # Phase 2 (standard, ~35 layers)
npm run generate:phase3   # Phase 3 (full upper body, ~65 layers)
npm run generate:phase4   # Phase 4 (full body, ~95 layers)
npm run generate:all      # All four
```

---

## Register as a Clip Studio Paint template

1. Generate the PSD (above)
2. Open `output/*.psd` in Clip Studio Paint
3. Verify the layer structure (folders, layer names, and colors are preserved)
4. Adjust as needed (symmetry ruler, 3D pose guide, etc.)
5. **File → Register as Template**
6. From now on, "New from Template" gives you the structure instantly

### When you want to change the structure

1. Edit `templates/*.yaml`
2. Re-run the generator: `npm run generate:phaseN`
3. Reopen in CSP, resave as `.clip`, and re-register as a template

---

## YAML format

```yaml
name: OutputFileName        # no extension
description: "..."

canvas:
  width: 2000               # px
  height: 3000              # px
  dpi: 350

guides:                     # optional
  - { direction: vertical, position: 1000 }
  - { direction: horizontal, position: 2500 }

structure:                  # top-to-bottom, as shown in CSP's layer panel
  - type: layer
    name: FrontHair
    color: blue             # red / orange / yellow / green / blue / violet / gray
    hidden: false
    opacity: 1.0

  - type: folder
    name: FaceParts
    color: red
    opened: true
    children:
      - { type: layer, name: RightEyebrow, color: red }
      # nesting allowed
```

### A note on ordering

YAML is written **top-to-bottom** (matching the CSP layer panel). The generator reverses this internally because the PSD format places `children[0]` at the bottom.

---

## Included templates

| File | Layers | Target motion | Use case |
|------|-------:|---------------|----------|
| `phase1-minimum.yaml` | ~15 | Blink, lip sync, head nod | Practice model, quick avatar |
| `phase2-standard.yaml` | ~35 | Expressions, head XYZ, basic hair physics | First serious character |
| `phase3-full.yaml` | ~65 | Hair physics, breathing, arms, outfit variants | Production / streaming (upper body) |
| `phase4-fullbody.yaml` | ~95 | All of Phase 3 plus legs, hip, lower-body clothing, shoes | Full-body production / dance / motion capture |

Start with **Phase 1**. Grow into Phase 2/3 as your needs expand.

---

## Recommended image specs for Live2D

- **Front-facing, eye-level camera** (slight tilt is OK; profile views drastically increase difficulty)
- **Bust-up or upper body** (full body is too much for a first character)
- **Neutral pose**
- **Hands resting on the body or off-frame**

### Layer naming convention

The included templates use Japanese layer names (`前髪`, `顔パーツ`, `右目`, etc.) because:

- Clip Studio Paint, PSD, and Live2D Cubism all support Japanese layer names end-to-end
- Japanese part names are concise and unambiguous for body parts
- The majority of existing Live2D tutorials and community resources use Japanese

Rename to English (or any language) in your own YAML if you prefer.

### Folder color convention

| Color | Area |
|-------|------|
| red | Face parts (eyes, brows, mouth) |
| orange | Skin (face base, neck, ears) |
| blue | Hair (front, back, side) |
| green | Clothing |
| yellow | Accessories |
| gray | Guides, background |

---

## Libraries used

- [ag-psd](https://github.com/Agamnentzar/ag-psd) — PSD read/write
- [canvas](https://github.com/Automattic/node-canvas) — Canvas implementation for Node.js
- [js-yaml](https://github.com/nodeca/js-yaml) — YAML parser

---

## License

MIT
