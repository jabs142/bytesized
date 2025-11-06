# 🎮 Pharmaceutical Innovation Clusters - Design System

## Design Philosophy

This project embraces a **Game Boy-inspired retro aesthetic** combined with accessible, data-driven visualizations. The design balances nostalgia with modern usability, featuring pixel-perfect borders, a green monochrome palette for brand elements, and soft pastel colors for therapeutic area data visualization.

**Core Principles:**
- **Retro Gaming Aesthetic**: Pixel fonts, chunky borders, offset shadows
- **Accessible Data Visualization**: Pastel color palette with strong contrast
- **Consistent Component Language**: Reusable card patterns and interactive states
- **Performance-First**: Clean semantic markup with minimal JavaScript

---

## Color System

### Game Boy Palette (Primary Brand Colors)

Use this palette for **structural elements, branding, and interactive components**.

```css
--gb-darkest: #0f380f   /* Dark forest green - primary borders, footer */
--gb-dark: #306230      /* Medium green - active states, headers */
--gb-light: #8bac0f     /* Lime green - accents, hover states */
--gb-lightest: #9bbc0f  /* Bright lime - glows, highlights */
```

**Usage:**
- **Borders**: Always use `--gb-darkest` for pixel borders
- **Active states**: Use `--gb-dark` for selected/pressed buttons
- **Hover effects**: Add glow with `rgba(139, 172, 15, 0.3)`
- **Accent bars**: 4px top border with `--gb-light`

### Therapeutic Area Palette (Data Visualization)

Use this **pastel color scheme for scatter plots, data points, and bar charts** representing therapeutic areas.

```javascript
THERAPEUTIC_COLORS = {
    "Alzheimer's & Dementia": "#E4ACB2",    // Dusty rose
    "CNS & Neurology": "#EABCA8",           // Peach
    "Cardiovascular": "#FAEDCD",            // Cream
    "Diabetes & Endocrine": "#CCD5AE",      // Sage green
    "Gastrointestinal": "#99BAB9",          // Blue gray
    "Infectious Disease": "#D4A5A5",        // Rose variation
    "Oncology": "#E8B088",                  // Peach variation
    "Pain & Analgesia": "#F5E5B8",          // Cream variation
    "Rare & Orphan Diseases": "#B8C99A",    // Sage variation
    "Respiratory": "#88A5A4",               // Blue gray variation
    "Immunology & Rheumatology": "#F0D0D0", // Light rose
    "Psychiatry": "#F2D4BA",                // Light peach
    "Dermatology": "#FDF8E8"                // Light cream
}
```

**Color Palette Design:**
- **Pastel tones**: Soft, accessible colors with good contrast on light backgrounds
- **Grouped by hue**: Related therapeutic areas use color variations (e.g., rose → dusty rose)
- **Distinct separation**: Each color is visually distinguishable in scatter plots
- **Print-friendly**: Works in both digital and printed formats

**Usage Guidelines:**
- **Scatter plot dots**: Use assigned therapeutic area color
- **Bar charts (Top 10)**: Use `#99BAB9` (blue-gray) for established/saturated markets
- **Bar charts (Bottom 10)**: Use `#E4ACB2` (dusty rose) for emerging/neglected areas
- **Legend items**: Match therapeutic area color exactly

### Background & Text Colors

```css
--bg-main: #E8E8E8      /* Light gray - page background */
--bg-card: #F5F5F5      /* Off-white - card backgrounds */
--text-primary: #2a2a2a /* Dark gray - body text */
--text-secondary: #5a5a5a /* Medium gray - labels, captions */
```

**Contrast Ratios:**
- `--text-primary` on `--bg-card`: 11.48:1 (AAA rated)
- `--text-secondary` on `--bg-card`: 6.91:1 (AA rated)

### Semantic Colors

Only use these for specific contexts:

```css
/* Success / Positive Growth */
--success: #27ae60

/* Warning / Moderate Alert */
--warning: #f39c12

/* Error / Critical Alert */
--error: #e74c3c

/* Info / Neutral Highlight */
--info: #3498db
```

**⚠️ Important**: Do NOT use these for general bar charts. Reserve for alerts, status indicators, and user feedback only.

---

## Typography

### Font Families

```css
--font-pixel: 'Press Start 2P', cursive
--font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
```

**Press Start 2P Usage:**
- Headers (`<h1>`, `<h2>`, `<h3>`)
- Stat numbers and badges
- Button labels
- Year labels on timelines
- Emphasis text (sparingly)

**System Font Stack Usage:**
- Body text and paragraphs
- Long-form descriptions
- Methodology explanations
- Table content

### Font Size Scale

**Pixel Font (Press Start 2P):**
```css
/* Headers */
--font-h1: 1.5rem    /* Main page title */
--font-h2: 1rem      /* Section headers */
--font-h3: 0.75rem   /* Subsection headers */

/* Components */
--font-stat: 1.75rem /* Stat card numbers */
--font-badge: 0.5rem /* Small labels, badges */
--font-tiny: 0.4rem  /* Micro labels (use sparingly) */
```

**Body Font (System Stack):**
```css
--font-body-large: 1.125rem  /* Intro paragraphs */
--font-body: 1rem            /* Standard body text */
--font-small: 0.875rem       /* Captions, metadata */
--font-tiny: 0.75rem         /* Fine print */
```

**Line Heights:**
- Pixel font: `1.4` (tight for retro feel)
- Body font: `1.6` (comfortable reading)

---

## Spacing System

Use this **5-point spacing scale** for consistent layouts.

```css
--spacing-xs: 0.5rem   /* 8px - tight gaps */
--spacing-sm: 1rem     /* 16px - default gap */
--spacing-md: 2rem     /* 32px - section spacing */
--spacing-lg: 3rem     /* 48px - major sections */
--spacing-xl: 4rem     /* 64px - page sections */
```

**Usage Guidelines:**
- **Card padding**: `--spacing-md` (2rem)
- **Grid gaps**: `--spacing-sm` (1rem)
- **Section margins**: `--spacing-lg` or `--spacing-xl`
- **Button padding**: `0.5rem 1rem` (xs horizontal, sm vertical)

---

## Pixel Design Elements

### Borders

**Primary Border Style:**
```css
--pixel-border: 2px solid var(--gb-darkest)
```

Always use 2px solid borders with the darkest Game Boy green. NO rounded corners except for 2px radius.

**Examples:**
```css
/* Card borders */
border: var(--pixel-border);
border-radius: var(--radius-pixel); /* 2px only */

/* Top accent bars */
border-top: 4px solid var(--gb-light);
```

### Shadows

**Offset box shadows** (not blur-based) for pixel-perfect retro look:

```css
--shadow-sm: 2px 2px 0 rgba(15, 56, 15, 0.2)    /* Subtle depth */
--shadow-md: 4px 4px 0 rgba(15, 56, 15, 0.25)   /* Standard cards */
--shadow-lg: 6px 6px 0 rgba(15, 56, 15, 0.3)    /* Elevated elements */
```

**Usage:**
- **Cards**: `box-shadow: var(--shadow-md)`
- **Buttons (default)**: `box-shadow: 3px 3px 0 var(--gb-darkest)`
- **Buttons (hover)**: Add glow with multiple shadows
- **Buttons (active)**: Reduce shadow to `1px 1px 0`

### Border Radius

```css
--radius-pixel: 2px  /* ONLY acceptable radius */
```

**⚠️ Never use values > 2px** - breaks the pixel aesthetic.

---

## Component Library

### Stat Cards

**Visual Style:**
- Background: `var(--bg-card)`
- Border: `var(--pixel-border)`
- Padding: `var(--spacing-md)`
- Shadow: `var(--shadow-md)`

**Structure:**
```html
<div class="stat-card">
    <div class="stat-label">TOTAL DRUGS ANALYZED</div>
    <div class="stat-number">71,149</div>
</div>
```

**Styling:**
```css
.stat-number {
    font-family: var(--font-pixel);
    font-size: 1.75rem;
    color: var(--gb-dark);
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.1);
}

.stat-label {
    font-family: var(--font-pixel);
    font-size: 0.5rem;
    color: var(--text-secondary);
    text-transform: uppercase;
}
```

### Cluster Cards

**Visual Style:**
- Top accent: 4px `var(--gb-light)` border
- Header gradient: `linear-gradient(180deg, rgba(139, 172, 15, 0.05) 0%, transparent 100%)`
- Expandable details with smooth transitions

**Structure:**
```html
<div class="cluster-card">
    <div class="cluster-header">
        <h3>1978-1987: The Boom Years</h3>
        <span class="cluster-badge">15,987 approvals</span>
    </div>
    <div class="cluster-details">
        <!-- Expandable content -->
    </div>
</div>
```

### Buttons

**Primary Button (Pixel Style):**
```css
.pixel-btn {
    font-family: var(--font-pixel);
    font-size: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--bg-card);
    border: 3px solid var(--gb-darkest);
    box-shadow: 4px 4px 0 var(--gb-darkest);
    cursor: pointer;
    transition: all 0.2s;
}

.pixel-btn:hover {
    transform: translateY(-2px);
    box-shadow: 4px 6px 0 var(--gb-darkest),
                0 0 20px rgba(139, 172, 15, 0.3);
}

.pixel-btn:active {
    transform: translateY(1px);
    box-shadow: 2px 2px 0 var(--gb-darkest);
}
```

**Filter Buttons:**
```css
.filter-btn {
    background: var(--bg-card);
    border: var(--pixel-border);
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
}

.filter-btn.active {
    background: var(--gb-dark);
    color: var(--bg-card);
    box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.2);
}
```

### Badges

**Cluster Badge:**
```css
.cluster-badge {
    background: rgba(139, 172, 15, 0.15);
    border: 1px solid var(--gb-light);
    border-radius: 2px;
    padding: 0.25rem 0.75rem;
    font-family: var(--font-pixel);
    font-size: 0.5rem;
    color: var(--gb-dark);
}
```

### Tooltips

**D3.js Scatter Plot Tooltip:**
```css
.scatter-tooltip {
    position: absolute;
    background: #ffffff;
    color: #1a1a1a;
    padding: 12px;
    border: 2px solid #333;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-size: 12px;
    font-family: 'Courier New', monospace;
    z-index: 10000;
    pointer-events: none;
}
```

**Timeline Bar Tooltip:**
```css
.timeline-tooltip {
    background: var(--bg-card);
    border: var(--pixel-border);
    border-radius: var(--radius-pixel);
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    line-height: 1.4;
}
```

---

## Data Visualization Guidelines

### Chart Colors

**Scatter Plots (Therapeutic Timeline):**
- **Dots**: Use `THERAPEUTIC_COLORS` mapped to therapeutic area
- **Radius**: 6px default, 8px on hover
- **Opacity**: 0.85 default, 1.0 on hover
- **Stroke**: 1px `#333` default, 2px `#000` on hover

**Bar Charts (Horizontal):**
- **Top 10 Therapeutic Areas**: `#99BAB9` (blue-gray from pastel palette)
- **Bottom 10 / Emerging Classes**: `#E4ACB2` (dusty rose from pastel palette)
- **Minimum bar width**: 5% or 2% depending on scale
- **Bar height**: 30px with 8px gap

**Timeline Decade Bars:**
- **Fill**: `var(--gb-light)` with 0.7 opacity
- **Border**: 1px solid `var(--gb-darkest)`
- **Hover opacity**: 0.9
- **Cursor**: pointer

### Chart Typography

**Axes:**
- Font: `'Courier New', monospace`
- Size: 11px
- Color: `#333` (dark gray, not pastel colors)
- Weight: Bold for y-axis labels

**Chart Titles:**
- Font: `'Courier New', monospace`
- Size: 16px
- Weight: Bold
- Color: `#000`

**Legend:**
- Font: `'Courier New', monospace`
- Size: 10px for labels, 12px for title
- Color: `#aaa` for labels, `#000` for title

### Interactive States

**Hover Effects:**
```css
/* Cards */
.card:hover {
    transform: translateY(-2px);
    box-shadow: 4px 6px 0 rgba(15, 56, 15, 0.25);
}

/* Buttons */
.button:hover {
    box-shadow: 4px 6px 0 var(--gb-darkest),
                0 0 20px rgba(139, 172, 15, 0.3);
}

/* Chart elements */
circle:hover {
    r: 8;
    opacity: 1;
    stroke-width: 2;
}
```

**Active/Pressed States:**
```css
.button:active {
    transform: translateY(1px);
    box-shadow: 2px 2px 0 var(--gb-darkest);
}

.filter-btn.active {
    box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.2);
}
```

**Transitions:**
- **Standard**: `0.2s ease` for most hover effects
- **Cards**: `0.3s ease` for transform + shadow
- **Modals/Details**: `0.3s ease` for max-height/opacity

---

## Layout Patterns

### Container Widths

```css
.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
}
```

### Grid Layouts

**Stats Grid (3 columns):**
```css
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
}
```

**Test Results Grid (2 columns):**
```css
.test-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
    gap: var(--spacing-lg);
    max-width: 1200px;
}
```

**Methodology Grid (2 columns):**
```css
.methodology-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-md);
}
```

### Responsive Breakpoints

```css
/* Mobile: < 768px */
@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
}

/* Tablet: 768px - 1024px */
@media (min-width: 768px) and (max-width: 1024px) {
    .methodology-grid {
        grid-template-columns: 1fr;
    }
}

/* Desktop: > 1024px */
/* Use default grid layouts */
```

---

## Dark Mode Section (Methodology)

The methodology section uses an inverted **dark Game Boy theme**:

```css
.methodology-section {
    background: var(--gb-darkest);  /* #0f380f */
    color: var(--gb-lightest);      /* #9bbc0f */
    padding: var(--spacing-xl) 0;
}

.method-card {
    background: rgba(139, 172, 15, 0.15);
    border: 2px solid var(--gb-light);
    color: var(--gb-lightest);
}
```

**Typography:**
- Headers: `var(--gb-lightest)`
- Body text: `rgba(155, 188, 15, 0.9)`
- Links: `var(--gb-light)` with hover glow

---

## Accessibility

### Color Contrast

All text meets **WCAG AA** standards (4.5:1 minimum):
- Body text on cards: 11.48:1 (AAA)
- Secondary text: 6.91:1 (AA)
- Chart text: 9.2:1 (AAA)

### Focus States

```css
button:focus-visible,
a:focus-visible {
    outline: 3px solid var(--gb-light);
    outline-offset: 2px;
}
```

### Screen Readers

- Use semantic HTML (`<header>`, `<main>`, `<section>`)
- Add `aria-label` to interactive chart elements
- Use `alt` text for decorative emojis in content
- Include `<title>` tags in SVG visualizations

---

## File Organization

```
frontend/
├── css/
│   └── styles.css           # All styles, organized by component
├── js/
│   ├── app.js               # Main initialization
│   ├── therapeutic-timeline.js   # Scatter plot visualization
│   ├── timeline-viz.js      # Decade bar chart
│   ├── unique-insights.js   # Bar charts for top/bottom 10
│   └── statistical-viz.js   # Statistical test results
└── index.html               # Main page structure
```

---

## Design Checklist

When creating new components, verify:

- [ ] Uses Press Start 2P font for headers/stats
- [ ] Has 2px solid border with `--gb-darkest`
- [ ] Uses offset box shadow (not blur)
- [ ] Border radius is exactly 2px (if any)
- [ ] Hover state includes glow effect
- [ ] Transitions are 0.2s or 0.3s
- [ ] Text meets WCAG AA contrast (4.5:1 minimum)
- [ ] Uses therapeutic pastel colors for data viz
- [ ] Respects spacing scale (xs, sm, md, lg, xl)
- [ ] Has `:focus-visible` outline for keyboard navigation

---

## Credits

**Design Inspiration**: Nintendo Game Boy (1989)
**Color Palette**: Game Boy green monochrome + accessible pastels
**Typography**: Press Start 2P by CodeMan38
**Data Visualization**: D3.js v7

---

*Last updated: 2025-11-06*