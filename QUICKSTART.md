# ByteSized Quick Start Guide

## 🚀 Start Developing with Hot Reloading

### 1. Start the Dev Server
```bash
npm start
```

This will:
- Start a local server at http://localhost:8000
- Open your browser automatically
- **Auto-refresh the page when you edit any HTML/CSS/JS file!**

### 2. Make Changes and See Them Instantly

Edit any file in your project:
- `index.html` - Main portal
- `css/*.css` - Styles
- `js/*.js` - JavaScript
- Any cartridge project files

**Save the file → Browser refreshes automatically!** No more manual refresh! 🎉

### 3. Create a New Cartridge Story

Use the shared components to build faster:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>My New Cartridge</title>
  <link rel="stylesheet" href="/css/game-boy-frame.css">

  <!-- Load shared components -->
  <script src="/shared/components/StatCard.js"></script>
  <script src="/shared/components/EjectButton.js"></script>
</head>
<body>
  <!-- Eject button (back to portal) -->
  <eject-button></eject-button>

  <!-- Stats using Web Components -->
  <div class="stats-container">
    <stat-card value="1,234" label="Data Points"></stat-card>
    <stat-card value="567" label="Insights Found"></stat-card>
  </div>

  <!-- Your content here -->
  <div id="content"></div>

  <script type="module">
    import { loadJSON } from '/shared/utils/dataLoader.js';
    import { formatNumber } from '/shared/utils/formatters.js';

    // Load and display data
    const data = await loadJSON('data/my-data.json');
    document.getElementById('content').innerHTML =
      `Found ${formatNumber(data.length)} items!`;
  </script>
</body>
</html>
```

### 4. Available Shared Components

#### StatCard
```html
<stat-card value="1,234" label="Total Items"></stat-card>
```

#### EjectButton
```html
<eject-button></eject-button>
<eject-button theme="dark"></eject-button>
```

#### Data Utilities
```javascript
import { loadJSON, loadMultipleJSON } from '/shared/utils/dataLoader.js';
import { formatNumber, formatPercent, formatCompact } from '/shared/utils/formatters.js';
```

See `/shared/README.md` for full documentation!

---

## 📝 Development Workflow

### Option 1: Hot Reloading (Recommended)
```bash
npm start               # Auto-refresh on changes
```

### Option 2: Python Server (No auto-refresh)
```bash
python3 -m http.server 8000
```

---

## 🎨 Styling Guide

All cartridges follow the retro Game Boy aesthetic. See `STYLE_GUIDE.md` for:
- Color palette (greens, retro colors)
- Typography (Press Start 2P font)
- Button styles
- Card designs
- Animation patterns

---

## 📁 Project Organization

### For Interactive Stories (like neal.fun):
```
my-story/
├── frontend/
│   ├── index.html           # Main story page
│   ├── css/
│   │   └── styles.css       # Custom styles
│   ├── js/
│   │   └── app.js           # Story logic
│   └── data/
│       └── story-data.json  # Static data
```

### For Data Analysis Projects:
```
my-analysis/
├── data/                    # Raw data
├── src/                     # Python analysis scripts
├── frontend/
│   ├── index.html           # Dashboard
│   ├── js/app.js            # Visualization logic
│   └── data/                # Processed JSON for viz
```

---

## 🆕 Adding Your Cartridge to the Portal

1. **Create your cartridge** in its own folder
2. **Add entry to** `data/cartridges.json`:

```json
{
  "id": "my-story",
  "title": "MY STORY",
  "subtitle": "INTERACTIVE TALE",
  "description": "An amazing interactive story",
  "labelText": "MY-STORY-01",
  "url": "/my-story/frontend/index.html",
  "color": "#9b59b6",
  "pattern": "dots",
  "icon": "🎮",
  "status": "active"
}
```

3. **Refresh the portal** - your cartridge appears in the Game Boy shelf!

---

## 💡 Tips

1. **Use Web Components** for repeated UI patterns
2. **Import utilities** instead of copying code
3. **Keep it vanilla** - no framework needed for most stories
4. **Test with hot reload** - see changes instantly
5. **Follow the style guide** - maintain consistency

---

## 🔧 Troubleshooting

### Hot reload not working?
- Make sure you ran `npm start` (not `python3 -m http.server`)
- Check that .live-server.json exists
- Try clearing browser cache

### Components not loading?
- Check the script path: `/shared/components/StatCard.js` (absolute path with leading `/`)
- Make sure the component JS file is loaded before using the tag

### Module import errors?
- Add `type="module"` to your script tag
- Use absolute paths: `/shared/utils/formatters.js`

---

## 🎮 You're Ready!

Start building amazing interactive stories with hot reloading and reusable components!

```bash
npm start  # Let's go! 🚀
```
