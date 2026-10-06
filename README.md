# Abhishek Kumar Jha — personal website

Static site: `index.html` plus `media/`. Open `index.html` in a browser or serve the folder with any static host (GitHub Pages works).

Pages are tabs inside one file: Home, About, Research, AI Programmes, Contact (`#about`, `#research`, `#programmes`, `#contact`).

## Motion graphics

The videos in `media/` are rendered with [HyperFrames](https://hyperframes.heygen.com). Sources are in `hyperframes/`:

- `hyperframes/hero` → `media/hero-bg.mp4` (hero background network)
- `hyperframes/reel` → `media/reel.mp4` (three expertise scenes)

To re-render, from a composition folder run:

```bash
npx hyperframes@0.8.134 render -o renders/out.mp4
```
