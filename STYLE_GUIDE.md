# ByteSized Research - Style Guide

> Official design system for maintaining consistency across all ByteSized research visualizations

Last Updated: October 31, 2025

---

## Design Philosophy

ByteSized Research combines **retro Game Boy aesthetics** with **medical readability** to create an engaging, nostalgic experience while maintaining professional credibility and accessibility.

### Core Principles

1. **Nostalgic but Professional** - Retro gaming aesthetic without compromising readability
2. **Data-Driven** - Visual design serves the data, never obscures it
3. **Accessible** - Meets WCAG contrast standards, readable fonts for body text
4. **Consistent** - Shared design language across all projects

---

## Typography System

### Font Stack

```css
/* Headers & Retro Elements */
--font-pixel: 'Press Start 2P', cursive;

/* Body Text & Readable Content */
--font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Code & Technical Content */
--font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
```

### Font Import

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
```

### Type Scale

```css
/* Press Start 2P (Headers) */
--text-h1: 1rem;           /* Main page titles */
--text-h2: 0.75rem;        /* Section headers */
--text-h3: 0.625rem;       /* Subsection headers */
--text-stats: 1.75rem;     /* Big stat numbers */
--text-button: 0.5rem;     /* Button labels */
--text-label: 0.5rem;      /* Small labels, legends */

/* System Fonts (Body) */
--text-body: 0.9375rem;    /* Main content */
--text-small: 0.875rem;    /* Secondary content */
--text-caption: 0.8125rem; /* Captions, footnotes */
```

### Usage Guidelines

- **Press Start 2P**: Use for h1, h2, h3, stat numbers, button text, legend items
- **System Fonts**: Use for all body text, descriptions, long-form content
- **Never use Press Start 2P for paragraphs** - it's intentionally hard to read at length
- **Line height**: 1.6 for body text, 1.2-1.4 for pixel fonts

---

## Color System

### Game Boy Palette (Primary)

```css
/* Core Game Boy Colors */
--gb-darkest: #0f380f;     /* Darkest green */
--gb-dark: #306230;        /* Dark green */
--gb-light: #8bac0f;       /* Light green */
--gb-lightest: #9bbc0f;    /* Lightest green */
```

### Background Colors

```css
--bg-main: #E8E8E8;        /* Primary background (not pure white) */
--bg-card: #F5F5F5;        /* Card background */
--bg-secondary: #f7f6f3;   /* Alternate background */
```

### Text Colors

```css
--text-primary: #2a2a2a;   /* Main text color */
--text-secondary: #5a5a5a; /* Secondary/muted text */
--text-light: #787774;     /* Light gray text */
```

### Device Colors (Game Boy Console)

```css
--device-body: #d3d3d3;    /* Console plastic */
--device-dark: #9e9e9e;    /* Shadows/depth */
--screen-bg: #9bbc0f;      /* Screen background */
--button-red: #e74c3c;     /* A button, power LED */
--button-gray: #5a5a5a;    /* B button */
```

### Surprise/Tier Colors (Medical Context)

```css
--very-surprising: #6B8E23;   /* Darker green with warmth */
--somewhat-surprising: #8bac0f; /* Medium green */
--expected: #A8BCC8;          /* Light muted blue-green */
```

### Usage Rules

1. **Always use Game Boy greens for primary actions** and interactive elements
2. **Reserve red (`--button-red`)** for critical actions or alerts
3. **Maintain 4.5:1 contrast ratio** minimum for text on backgrounds
4. **Use `--bg-main` instead of pure white** for reduced eye strain

---

## Spacing System

Consistent spacing creates visual rhythm and hierarchy.

```css
--space-xs: 0.5rem;   /* 8px */
--space-sm: 1rem;     /* 16px */
--space-md: 2rem;     /* 32px */
--space-lg: 3rem;     /* 48px */
--space-xl: 4rem;     /* 64px */
--space-xxl: 6rem;    /* 96px */
```

### Application

- **Component padding**: `--space-md` (2rem)
- **Section margins**: `--space-xl` (4rem)
- **Element gaps**: `--space-sm` (1rem)
- **Tight spacing**: `--space-xs` (0.5rem)

---

## Retro UI Elements

### Borders

```css
/* Standard border */
border: 2px solid var(--gb-dark);
border-radius: 2px; /* Minimal rounding for pixel aesthetic */

/* Thicker accent border */
border: 3px solid var(--gb-light);
```

### Shadows (Stepped/Pixelated Style)

```css
--shadow-sm: 2px 2px 0 rgba(0, 0, 0, 0.1);
--shadow-md: 4px 4px 0 rgba(0, 0, 0, 0.15);
--shadow-lg: 6px 6px 0 rgba(0, 0, 0, 0.2);

/* Usage */
box-shadow: var(--shadow-md);
```

### Corner Accents

Decorative corner brackets on cards:

```css
.corner-accents::before,
.corner-accents::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid var(--gb-light);
}

.corner-accents::before {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.corner-accents::after {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}
```

### Decorative Elements

```css
/* Triangle pointers */
.pointer::before {
  content: '▼';
  color: var(--gb-light);
  font-family: var(--font-pixel);
  font-size: 0.5rem;
}

/* Stat indicators */
.stat-icon::before {
  content: '●';
  color: var(--very-surprising);
}
```

---

## Component Patterns

### Eject Button (Navigation)

Fixed-position button to return to homepage:

```html
<a href="/" class="eject-button">
  <span class="eject-icon">◄</span>
  <span class="eject-text">EJECT</span>
</a>
```

```css
.eject-button {
  position: fixed;
  top: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--gb-light);
  border: 2px solid var(--gb-dark);
  border-radius: 2px;
  color: var(--gb-darkest);
  font-family: var(--font-pixel);
  font-size: 0.5rem;
  text-decoration: none;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
  z-index: 1000;
}

.eject-button:hover {
  background: var(--gb-lightest);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.eject-button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
```

**Dark Theme Variant** (for COVID, Evolution):

```css
.eject-button-dark {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

.eject-button-dark:hover {
  background: rgba(231, 76, 60, 0.2);
  border-color: #e74c3c;
}
```

### Stat Cards

```html
<div class="stat-card">
  <div class="stat-value">1,234</div>
  <div class="stat-label">Total Symptoms</div>
</div>
```

```css
.stat-card {
  position: relative;
  padding: 2rem;
  background: var(--bg-card);
  border: 2px solid var(--gb-dark);
  border-radius: 2px;
  box-shadow: var(--shadow-md);
}

.stat-value {
  font-family: var(--font-pixel);
  font-size: 1.75rem;
  color: var(--gb-dark);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-family: var(--font-pixel);
  font-size: 0.5rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

/* Add corner accents */
.stat-card::before,
.stat-card::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid var(--gb-light);
}

.stat-card::before {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

.stat-card::after {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}
```

### Filter Buttons

```css
.filter-button {
  padding: 0.75rem 1.25rem;
  background: var(--bg-card);
  border: 2px solid var(--gb-dark);
  border-radius: 2px;
  color: var(--text-primary);
  font-family: var(--font-pixel);
  font-size: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button:hover {
  background: var(--gb-light);
  border-color: var(--gb-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.filter-button.active {
  background: var(--gb-dark);
  color: var(--gb-lightest);
}
```

### Legend Items

```css
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  font-family: var(--font-pixel);
  font-size: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border: 2px solid var(--gb-dark);
  border-radius: 2px;
}
```

---

## Power LED Indicator

Appears on the Game Boy console in the main portal:

```html
<div class="power-indicator">
  <div class="led-light"></div>
  <span class="power-label">POWER</span>
</div>
```

```css
.power-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.led-light {
  width: 8px;
  height: 8px;
  background: var(--button-red);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.8),
              inset 0 -2px 4px rgba(0, 0, 0, 0.3);
}

.power-label {
  font-family: var(--font-pixel);
  font-size: 0.4rem;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}
```

---

## Cursor System

Context-aware pixel cursors for retro feel:

```css
/* Default cursor (arrow) */
* {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path fill="white" stroke="black" d="M0,0 L0,12 L4,8 L7,13 L9,12 L6,7 L11,7 Z"/></svg>') 0 0, auto;
}

/* Pointer cursor (hand) for links/buttons */
a, button, .clickable {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path fill="white" stroke="black" d="M7,0 L7,6 L5,6 L5,3 L4,3 L4,8 L3,8 L3,4 L2,4 L2,9 L1,9 L1,6 L0,6 L0,11 L6,11 L6,9 L10,9 L10,7 L9,7 L9,6 L8,6 L8,0 Z"/></svg>') 8 0, pointer;
}

/* Text cursor (I-beam) */
input[type="text"],
input[type="email"],
textarea,
.text-select {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect fill="black" x="7" y="0" width="2" height="16"/><rect fill="black" x="5" y="0" width="6" height="2"/><rect fill="black" x="5" y="14" width="6" height="2"/></svg>') 8 8, text;
}

/* Grab cursor for draggable items */
.draggable {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path fill="white" stroke="black" d="M8,0 L8,4 L10,4 L10,2 L11,2 L11,7 L12,7 L12,3 L13,3 L13,8 L14,8 L14,5 L15,5 L15,10 L9,10 L9,12 L5,12 L5,10 L2,10 L2,8 L4,8 L4,0 Z"/></svg>') 8 8, grab;
}
```

---

## Medical Readability Rules

Maintain professional credibility and accessibility:

### Contrast Standards

- **Body text on backgrounds**: Minimum 4.5:1 contrast ratio (WCAG AA)
- **Large text (18px+)**: Minimum 3:1 contrast ratio
- **Testing tool**: Use WebAIM Contrast Checker

### Font Size Minimums

- **Body text**: Never smaller than 0.875rem (14px)
- **Captions**: Minimum 0.8125rem (13px)
- **Interactive elements**: Minimum 0.75rem (12px)

### Whitespace Requirements

- **Paragraph spacing**: 1.5rem minimum between paragraphs
- **Line length**: Maximum 75 characters for optimal readability
- **Card padding**: Minimum 2rem (32px)

### Content Hierarchy

```
h1: Main page title (Press Start 2P, 1rem)
h2: Section headers (Press Start 2P, 0.75rem)
h3: Subsections (Press Start 2P, 0.625rem)
Body: System fonts, 0.9375rem, line-height 1.6
```

---

## Layout Patterns

### Container Width

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
```

### Grid System

```css
/* Medical cards grid */
.symptom-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
```

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  .container { padding: 0 1rem; }
  .grid { grid-template-columns: 1fr; }
}

/* Tablet */
@media (max-width: 1024px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1025px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

---

## Animation Guidelines

Keep animations subtle and purposeful:

```css
/* Standard transition */
transition: all 0.2s ease;

/* Hover lift effect */
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Active press effect */
.button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
```

---

## Accessibility Checklist

- [ ] All interactive elements have `:focus` styles
- [ ] Color is not the only means of conveying information
- [ ] Alt text for all images
- [ ] Semantic HTML (h1-h6, nav, main, article, etc.)
- [ ] ARIA labels for icon-only buttons
- [ ] Keyboard navigation works everywhere
- [ ] Form inputs have associated labels

---

## Special Cases

### COVID Timeline (Dark Theme)

- Use dark theme variant of eject button
- Press Start 2P only for headers (h1, h2)
- Preserve red accent color (#e74c3c)
- Keep dark background (#0a0a0f)

### Evolution of Invention (Game View)

- Do NOT change game canvas styles
- Press Start 2P only for timeline view
- Preserve brown historical accents (#8b7355)

---

## File Structure

```
/css/
  ├── game-boy-frame.css      # Main portal console styles
  ├── cartridge-styles.css    # Cartridge grid and cards
  ├── screen-effects.css      # CRT effects, scanlines
  └── cursors.css             # Pixel cursor system
```

---

## Quick Reference

### Import Order

```html
<head>
  <!-- 1. Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">

  <!-- 2. Cursor System -->
  <link rel="stylesheet" href="/css/cursors.css">

  <!-- 3. Project Styles -->
  <link rel="stylesheet" href="css/styles.css">
</head>
```

### Essential CSS Variables

```css
:root {
  /* Colors */
  --gb-light: #8bac0f;
  --gb-dark: #306230;
  --bg-main: #E8E8E8;
  --text-primary: #2a2a2a;

  /* Fonts */
  --font-pixel: 'Press Start 2P', cursive;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Spacing */
  --space-sm: 1rem;
  --space-md: 2rem;

  /* Shadows */
  --shadow-md: 4px 4px 0 rgba(0, 0, 0, 0.15);
}
```

---

## Version History

- **v1.0** (Oct 31, 2025) - Initial style guide creation
  - Typography system
  - Color palette
  - Component patterns
  - Cursor system
  - Medical readability rules

---

## Questions?

For design questions or suggestions, refer to this guide. All new components should follow these patterns to maintain consistency across the ByteSized Research platform.
