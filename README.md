# Abhishek Kumar Jha — personal website

Static site: `index.html` plus `media/`. Open `index.html` in a browser or serve the folder with any static host (GitHub Pages works).

Pages are tabs inside one file: Home, About, Research, AI Programmes, Contact (`#about`, `#research`, `#programmes`, `#contact`).

## Motion graphics

The expertise reel in `media/` is rendered with [HyperFrames](https://hyperframes.heygen.com). Its source is in `hyperframes/reel`.


To re-render, from a composition folder run:

```bash
npx hyperframes@0.8.134 render -o renders/out.mp4
```
