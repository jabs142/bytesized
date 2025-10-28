# Birth Control Side Effects Pattern Explorer - Frontend

Interactive web application for exploring hidden symptom patterns from Reddit birth control experiences.

## Features

- **Home Page**: Overview statistics and top symptoms
- **Symptom Checker**: Interactive tool to find related symptoms
- **Mobile-First Design**: Fully responsive, touch-friendly interface
- **Privacy-Focused**: No tracking, no cookies, fully anonymous

## Quick Start

### Option 1: Python HTTP Server (Simplest)

```bash
# From the frontend directory
cd frontend
python3 -m http.server 8000

# Open in browser:
# http://localhost:8000
```

### Option 2: Using Node.js

```bash
# Install http-server globally
npm install -g http-server

# From the frontend directory
cd frontend
http-server -p 8000

# Open: http://localhost:8000
```

### Option 3: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## Project Structure

```
frontend/
├── index.html              # Home page
├── symptom-checker.html    # Interactive symptom checker
├── css/
│   └── style.css          # Custom styles
├── js/
│   ├── app.js             # Home page logic
│   └── symptom-checker.js # Symptom checker logic
└── data/
    ├── stats.json         # Summary statistics
    ├── discovered_patterns.json  # Association rules
    └── symptom_network.json     # Network graph data
```

## Technology Stack

- **HTML5**: Semantic structure
- **Tailwind CSS**: Utility-first styling (via CDN)
- **Vanilla JavaScript**: No framework dependencies
- **Static Files**: No backend required

## Data Files

The app loads three JSON files from the pattern mining analysis:

1. **stats.json**: Summary statistics (total posts, top symptoms, categories)
2. **discovered_patterns.json**: Association rules with support, confidence, lift
3. **symptom_network.json**: Network graph nodes and edges

## Deployment

### GitHub Pages

```bash
# Push to GitHub
git add frontend/
git commit -m "Add frontend UI"
git push origin main

# Enable GitHub Pages
# Settings → Pages → Source: main branch /frontend folder
```

### Netlify

1. Drag and drop the `frontend/` folder to netlify.com
2. Or connect GitHub repo and set build folder to `frontend/`

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# From frontend directory
cd frontend
vercel
```

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Optimized for touch

## License

Educational project - see main repository LICENSE
