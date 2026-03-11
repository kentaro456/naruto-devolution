# naruto-devolution (Shinobi Evolution)

Browser-based 2D Naruto fighting game prototype with custom roster, arena selection, a directional combo system, CPU modes, animation mapper, and asset pipeline.

## Features

- 2D versus combat with roster selection
- Player vs CPU and CPU vs CPU modes
- Directional attacks and special variants
- Character mapping editor for animation states
- Local authoring flow for mapping edits

## Run Locally

Requirements:

- Node.js 18+

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Open the main game:

- `http://localhost:5173/`

If you need mapper save-to-project locally, keep using the dedicated authoring server:

```bash
npm run serve:authoring
```

Then open:

- `http://localhost:5173/mapper`
- `http://localhost:8080/` for the local save API helper and authoring notes

## Deploy on Netlify

This project is prepared for static deployment with Vite on Netlify.

- Build command: `npm run build`
- Publish directory: `dist`
- The main game works as a static front-end
- The mapper remains available in public demo mode, but direct save-to-project is disabled outside local authoring

Netlify config is provided in `netlify.toml`.

## Controls

- Move: `Left / Right / Up / Down`
- Guard / charge: `Q`
- Light attack: `S`
- Heavy attack: `D`
- Special: `F`
- Transform: `G`
- Dash: double tap `Left` or `Right`

## Project Structure

- `index.html`: Vite entry + runtime script bridge
- `src/`: React shell, overlays, mapper page, and runtime loaders
- `COMBAT_GUIDE.md`: quick player-facing combat reference
- `js/`: gameplay, engine, and mapper runtime
- `assets/organized/`: runtime-ready assets

## Notes

- Generated temporary files and review artefacts are excluded through `.gitignore`.
- `local-dev-server.js` is only for local authoring save support.
- The runtime is now hybrid: React renders the shell UI, while the combat engine remains on the existing canvas/game code.
