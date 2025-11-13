# COVID-19: The Invisible Epidemic

An interactive scrollytelling visualization showing the global spread of
COVID-19 from 2020-2024.

## Features

- **Interactive World Map**: D3.js-powered visualization showing COVID-19 spread
  across 58 major countries
- **Scrollytelling Narrative**: 13 scenes covering key moments in the pandemic
- **Real-time Statistics**: Sticky counter displaying total cases, deaths, and
  vaccinations
- **Timeline Marker**: Visual timeline on the right side showing your progress
  through the story
- **Event Cards**: Important milestones appear dynamically as you scroll
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Theme**: Dramatic visual presentation with red (infection) and blue
  (vaccination) color schemes

## Data Sources

- **Our World in Data (OWID)**: COVID-19 dataset (cases, deaths, vaccinations by
  country)
- **World Health Organization (WHO)**: Timeline of key pandemic events
- **Natural Earth**: World map data (TopoJSON format)

## Technical Stack

- **Visualization**: D3.js v7 (map rendering, color scales, transitions)
- **Scrollytelling**: Scrollama.js (scroll-triggered scene changes)
- **Map Data**: TopoJSON (compressed world map data)
- **Styling**: Vanilla CSS with dark theme and responsive breakpoints
- **Framework**: Vanilla JavaScript (ES6 modules)

## Project Structure

```
covid-scrollytelling/
├── frontend/
│   ├── index.html              # Main scrollytelling page
│   ├── css/
│   │   └── styles.css         # Dark theme, responsive styling
│   ├── js/
│   │   ├── config.js          # Scenes, color scales, settings
│   │   ├── dataLoader.js      # Data fetching and indexing
│   │   ├── map.js             # D3 map rendering and tooltips
│   │   ├── scrollHandler.js   # Scrollama integration
│   │   └── app.js             # Main orchestrator
│   └── data/
│       ├── covid-data.json        # Processed COVID data (19.7 MB)
│       ├── timeline-events.json   # 23 key pandemic milestones
│       └── world-110m.json        # TopoJSON world map (105 KB)
├── process_data.py             # Script to process OWID data
└── README.md
```

## Data Processing

The visualization uses data from 58 major countries including:

- G20 nations
- Hardest-hit countries during different waves
- Geographic diversity across all continents

Raw CSV data is processed into optimized JSON format:

- **Total size**: 19.7 MB (compressed from 152 MB CSV)
- **Time range**: January 1, 2020 - December 31, 2024
- **Data points**: 105,792 timeline entries

## Development

### Prerequisites

- Python 3.x (for data processing)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (Python HTTP server, Node.js serve, etc.)

### Setup

1. Process the data (if needed):

```bash
cd covid-scrollytelling
python3 process_data.py
```

2. Start a local web server:

```bash
# From the root directory
python3 -m http.server 8000
```

3. Open in browser:

```
http://localhost:8000/covid-scrollytelling/frontend/
```

## Scenes Overview

1. **The Beginning** (Jan 2020) - First cases in Wuhan
2. **Asian Spread** (Feb 2020) - Virus spreads across Asia
3. **Europe Becomes Epicenter** (Mar 2020) - WHO declares pandemic
4. **Global Lockdowns** (Apr 2020) - 3 billion people under lockdown
5. **Americas Crisis** (Jul 2020) - US, Brazil, Mexico peaks
6. **Second Wave** (Oct 2020) - Europe faces renewed surge
7. **A Glimmer of Hope** (Dec 2020) - Vaccines begin rollout
8. **India's Crisis** (Apr 2021) - Delta variant devastation
9. **Delta Goes Global** (Aug 2021) - Worldwide Delta spread
10. **Omicron Wave** (Dec 2021) - New variant, record cases
11. **Living With COVID** (Mid 2022) - Transition strategies
12. **Emergency Ends** (May 2023) - WHO ends global emergency
13. **The New Normal** (Jan 2024) - Endemic phase

## Performance Optimizations

- **Lazy loading**: Data fetched only when needed
- **Indexed data**: Pre-computed date lookups for fast retrieval
- **Smooth transitions**: D3 transitions for animated map updates
- **Responsive images**: SVG maps scale to any viewport
- **Mobile-first**: Optimized for touch interactions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements (Phase 2)

- [ ] Smooth spreading animation between countries
- [ ] Pulsing effects on hotspot countries
- [ ] More granular timeline (20+ scenes)
- [ ] Animated counter transitions
- [ ] Region zoom functionality
- [ ] Data export feature
- [ ] Share button for specific scenes

## Credits

- **Data**: Our World in Data COVID-19 Dataset
- **Map**: Natural Earth (public domain)
- **Inspiration**: The Pudding's "Invisible Epidemic" scrollytelling format
- **Built with**: D3.js, Scrollama.js, Vanilla JavaScript

## License

Data: CC BY 4.0 (Our World in Data) Code: MIT (if applicable)

---

**Note**: This visualization is part of the Symptom Discovery Research Hub,
exploring data-driven medical insights through interactive visualizations.
