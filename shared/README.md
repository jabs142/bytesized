# Shared Components & Utilities

Reusable components and utilities for all ByteSized cartridge projects.

## 🎯 Purpose

This shared library eliminates code duplication across cartridge projects by
providing:

- **Web Components** for common UI patterns (no framework needed!)
- **Utility functions** for data loading and formatting
- **Consistent styling** aligned with the retro Game Boy aesthetic

## 📦 What's Included

```
shared/
├── components/          # Web Components (reusable UI)
│   ├── StatCard.js      # Stat display cards
│   └── EjectButton.js   # "Eject" navigation button
├── utils/               # JavaScript utilities
│   ├── dataLoader.js    # Data fetching helpers
│   └── formatters.js    # Number/text formatting
└── styles/              # Shared CSS (coming soon)
```

---

## 🎨 Web Components

### StatCard

Display statistics with the retro card aesthetic.

**Usage:**

```html
<!-- Include the component -->
<script src="/shared/components/StatCard.js"></script>

<!-- Use it anywhere -->
<stat-card value="1,234" label="Total Symptoms"></stat-card>
<stat-card value="537" label="Patient Posts" color="#e74c3c"></stat-card>
```

**Attributes:**

- `value` - The numeric value to display (can include commas)
- `label` - The label text below the value
- `color` - Optional color accent (CSS color value)

**Dynamic Updates:**

```javascript
const card = document.querySelector('stat-card');
card.setAttribute('value', '2,468'); // Updates instantly!
```

---

### EjectButton

Navigation button to return to the cartridge portal.

**Usage:**

```html
<!-- Include the component -->
<script src="/shared/components/EjectButton.js"></script>

<!-- Default (light theme) -->
<eject-button></eject-button>

<!-- Dark theme variant -->
<eject-button theme="dark"></eject-button>

<!-- Custom href -->
<eject-button href="/custom-path"></eject-button>
```

**Attributes:**

- `href` - URL to navigate to (default: "/")
- `theme` - "light" (default) or "dark"

---

## 🛠️ Utilities

### Data Loader (`dataLoader.js`)

Standardized data fetching with error handling.

**Import:**

```javascript
import {
  loadJSON,
  loadMultipleJSON,
  withLoading,
} from '/shared/utils/dataLoader.js';
```

**Usage:**

**Basic Loading:**

```javascript
// Load a single JSON file
const data = await loadJSON('data/symptoms.json');

// With error handling
const data = await loadJSON('data/symptoms.json', {
  errorMessage: 'Failed to load symptoms',
  errorContainer: document.getElementById('content'),
});
```

**Load Multiple Files:**

```javascript
// Load multiple files in parallel
const data = await loadMultipleJSON({
  stats: 'data/stats.json',
  symptoms: 'data/symptoms.json',
  rankings: 'data/rankings.json',
});

// Access: data.stats, data.symptoms, data.rankings
```

**With Loading State:**

```javascript
const container = document.getElementById('results');
const data = await withLoading(container, async () => {
  return await loadJSON('data/large-file.json');
});
```

---

### Formatters (`formatters.js`)

Common formatting functions.

**Import:**

```javascript
import {
  formatNumber,
  formatPercent,
  formatCompact,
  truncate,
  pluralize,
} from '/shared/utils/formatters.js';
```

**Usage:**

```javascript
// Number formatting
formatNumber(1234567); // "1,234,567"
formatCompact(1234567); // "1.2M"
formatCompact(45300); // "45.3K"

// Percentages
formatPercent(0.453); // "45.3%"
formatPercent(45.3, 2, false); // "45.30%"

// Text
truncate('Long text here', 10); // "Long te..."
pluralize(1, 'symptom'); // "1 symptom"
pluralize(5, 'symptom'); // "5 symptoms"
pluralize(3, 'child', 'children'); // "3 children"

// Dates
formatDate(new Date()); // "Nov 1, 2025"
formatDate('2024-01-15'); // "Jan 15, 2024"
```

---

## 🚀 Quick Start: Convert Existing Cartridge

Here's how to refactor an existing cartridge to use shared components:

### Before:

```html
<!-- pcos-symptoms.html -->
<div class="stat-card">
  <div class="stat-value" id="stat-posts">537</div>
  <div class="stat-label">Patient Experiences</div>
</div>

<a href="/" class="eject-button">
  <span class="eject-icon">◄</span>
  <span class="eject-text">EJECT</span>
</a>
```

```javascript
// app.js
async function loadData() {
  try {
    const response = await fetch('data/stats.json');
    if (!response.ok) throw new Error('Failed to load');
    const data = await response.json();

    document.getElementById('stat-posts').textContent =
      data.total_posts.toLocaleString();
  } catch (error) {
    console.error(error);
  }
}
```

### After:

```html
<!-- pcos-symptoms.html -->
<script src="/shared/components/StatCard.js"></script>
<script src="/shared/components/EjectButton.js"></script>

<stat-card id="stat-posts" value="537" label="Patient Experiences"></stat-card>
<eject-button></eject-button>
```

```javascript
// app.js
import { loadJSON } from '/shared/utils/dataLoader.js';
import { formatNumber } from '/shared/utils/formatters.js';

async function loadData() {
  const data = await loadJSON('data/stats.json', {
    errorContainer: document.getElementById('content'),
  });

  const statCard = document.getElementById('stat-posts');
  statCard.setAttribute('value', formatNumber(data.total_posts));
}
```

**Result:** ~30 lines → ~15 lines, cleaner, reusable! ✨

---

## 📝 Best Practices

### Using ES6 Modules

Add `type="module"` to your script tags:

```html
<script type="module">
  import { formatNumber } from '/shared/utils/formatters.js';

  document.addEventListener('DOMContentLoaded', async () => {
    // Your code here
  });
</script>
```

### Organizing Your Cartridge

```
your-cartridge/
├── frontend/
│   ├── index.html         <!-- Include shared components here -->
│   ├── css/
│   │   └── styles.css     <!-- Your custom styles -->
│   ├── js/
│   │   └── app.js         <!-- Import shared utilities -->
│   └── data/
│       └── data.json
```

### Loading Shared Components

**Option 1: In HTML (Web Components)**

```html
<script src="/shared/components/StatCard.js"></script>
<script src="/shared/components/EjectButton.js"></script>
```

**Option 2: In JavaScript (Utilities)**

```javascript
import { loadJSON } from '/shared/utils/dataLoader.js';
import { formatNumber } from '/shared/utils/formatters.js';
```

---

## 🎓 Examples

### Complete Example: Stats Dashboard

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Cartridge</title>
    <link rel="stylesheet" href="css/styles.css" />

    <!-- Load Web Components -->
    <script src="/shared/components/StatCard.js"></script>
    <script src="/shared/components/EjectButton.js"></script>
  </head>
  <body>
    <eject-button></eject-button>

    <div class="stats-container">
      <stat-card id="total" value="0" label="Total Items"></stat-card>
      <stat-card id="validated" value="0" label="Validated"></stat-card>
    </div>

    <div id="content"></div>

    <script type="module">
      import { loadJSON } from '/shared/utils/dataLoader.js';
      import { formatNumber, formatPercent } from '/shared/utils/formatters.js';

      async function init() {
        const data = await loadJSON('data/stats.json');

        // Update stat cards
        document
          .getElementById('total')
          .setAttribute('value', formatNumber(data.total));
        document
          .getElementById('validated')
          .setAttribute('value', formatNumber(data.validated));
      }

      init();
    </script>
  </body>
</html>
```

---

## 🔧 Browser Support

- **Web Components**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **ES6 Modules**: All modern browsers
- **No build step required!** Pure vanilla JavaScript

---

## 💡 Tips

1. **Start small**: Try converting one stat card in an existing project
2. **Use modules**: Import only what you need
3. **Stay vanilla**: No frameworks = fast load times
4. **Reuse styles**: Your existing CSS works with these components
5. **Test locally**: Use `npm start` for hot reloading while developing

---

## 📚 Related

- See `STYLE_GUIDE.md` for full design system
- Check existing cartridges for usage examples
- Main portal: `index.html`

---

## 🎮 Happy Coding!

You're now equipped to build new cartridges faster with less code duplication.
Each component is framework-agnostic and works with vanilla JavaScript. Add
React later to one cartridge if needed - these components will still work!
