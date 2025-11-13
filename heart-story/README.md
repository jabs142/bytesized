# Your Heart's Life Story

> An interactive Game Boy-styled experience that visualizes your heart's journey
> from conception to now

**Frontend-Only Cartridge** - Pure vanilla JavaScript game with no backend data
pipeline

## What's Built

- **Life Story Mode:** Calculate total heartbeats since birth with real-time
  monitoring and educational milestones
- **Day Simulator Mode:** Interactive 8-bit RPG where daily activities affect
  heart rate in real-time
- **Educational Content:** Heart rate comparisons across species and
  cardiovascular health information
- **Retro Gaming Aesthetic:** Pixel-perfect Game Boy styling with 8-bit sound
  effects

## Features

### Two Game Modes

**1. Life Story Mode**

- Calculate total heartbeats since birth
- Live heart monitor with real-time beat counting
- Educational milestones and comparisons
- Heart rate comparisons across species
- Cardiovascular health conditions information

**2. Day Simulator Mode**

- Interactive 8-bit RPG-style game
- Experience how daily activities affect heart rate
- Make choices throughout a typical day
- Visual heart rate feedback (BPM changes)
- Heart-healthy choice tracking

## Technical Details

### Architecture

**Frontend Stack:**

- Pure vanilla JavaScript (no frameworks)
- CSS Grid and Flexbox for layout
- Web Audio API for 8-bit sound effects
- Pixel-perfect Game Boy aesthetic

**File Structure:**

```
heart-story/
├── frontend/
│   ├── index.html          # Main HTML structure with Game Boy device
│   ├── css/
│   │   └── style.css       # Complete styling (Game Boy device, animations)
│   └── js/
│       └── game.js         # Game state machine and logic
└── README.md
```

### Game State Machine

The game uses a finite state machine with the following states:

**Main Flow:**

1. `MODE_SELECT` - Choose between Life Story or Day Simulator
2. `BIRTH_ENTRY` - Enter birth date (month/day/year)
3. `FIRST_BEAT` - Calculate first heartbeat (18 days after conception)
4. `LIVE_MONITOR` - Real-time heart beat counter
5. `MILESTONES` - Display total beats and interesting facts

**Day Simulator Flow:**

1. `DAY_SIM_INTRO` - Introduction to day simulator
2. `DAY_SIM_ROOM` - Navigate pixel character through rooms
3. `DAY_SIM_CHOICE` - Make activity choices (affects heart rate)
4. `DAY_SIM_SUMMARY` - View day summary and heart health score

**Educational Pages:**

- `HUMAN_HR_COMPARE` - Compare heart rates across age groups
- `CONDITIONS_INTRO` - Introduction to heart conditions
- `CONDITION_1/2/3` - Detailed condition information
- `ANIMAL_INTRO/FINAL` - Animal heart rate comparisons

### Heart Rate Calculations

**First Beat Calculation:**

```javascript
// Heart starts beating ~18 days after conception
// Conception ~14 days before birth date
const conceptionDate = new Date(birthDate);
conceptionDate.setDate(conceptionDate.getDate() - 280); // ~40 weeks gestation
const firstBeat = new Date(conceptionDate);
firstBeat.setDate(firstBeat.getDate() + 18);
```

**Total Beats Calculation:**

```javascript
// Days since first beat × average BPM × 60 min × 24 hrs
const daysSince = (Date.now() - firstBeatDate) / (1000 * 60 * 60 * 24);
const totalBeats = Math.floor(daysSince * avgBPM * 60 * 24);
```

**Live Counter:**

- Updates every second based on average resting heart rate (70 BPM)
- Displays in retro digital format with leading zeros

### Day Simulator Mechanics

**Room Navigation:**

- 8×8 tile grid for each room (bedroom, kitchen, living room, gym)
- Character moves with D-pad controls
- Interaction zones trigger activity choices

**Heart Rate Modifiers:**

```javascript
const activities = {
  exercise: { bpmChange: +30, duration: 5, healthScore: +2 },
  meditation: { bpmChange: -10, duration: 3, healthScore: +1 },
  coffee: { bpmChange: +15, duration: 2, healthScore: -1 },
  rest: { bpmChange: -5, duration: 1, healthScore: +1 },
};
```

**Status Effects:**

- Temporary BPM modifiers with durations
- Visual feedback in status bar
- Cumulative effects for realistic simulation

### Educational Content

**Species Heart Rate Comparisons:**

- Shrew: 600-700 BPM (smallest mammal heart)
- Mouse: 400-600 BPM
- Cat: 120-140 BPM
- Dog: 60-120 BPM (varies by size)
- Human (child): 90-120 BPM
- Human (adult): 60-80 BPM
- Elephant: 30-40 BPM
- Blue Whale: 8-10 BPM (largest heart on Earth)

**Heart Conditions Covered:**

- Arrhythmias
- Tachycardia
- Bradycardia
- Heart failure basics
- Prevention and healthy habits

## Controls

### Keyboard

- **Arrow Keys** - Navigate menus, move character (Day Sim)
- **Enter/Space** - Select/Confirm (A button)
- **Escape** - Cancel/Back (B button)

### On-Screen Buttons

- **D-Pad** - Up/Down/Left/Right navigation
- **A Button** - Select/Confirm
- **B Button** - Cancel/Back

## Design System

Follows the **ByteSized Research Design System**:

**Visual Style:**

- Game Boy Classic green color scheme (#9bbc0f, #8bac0f, #306230, #0f380f)
- Press Start 2P font for authentic 8-bit typography
- CRT scanline effects and screen glow
- Pixel-perfect borders and shadows

**Components:**

- Game Boy device bezel with power LED
- Screen container with glass reflection effect
- D-pad and action buttons (fully functional)
- Speaker grille details

**Responsive Design:**

- Scales appropriately for different screen sizes
- Maintains aspect ratio of original Game Boy
- Touch-friendly button targets on mobile

## Usage

### Running Locally

1. Serve from ByteSized root directory:

```bash
python3 -m http.server 8000
```

2. Open in browser:

```
http://localhost:8000/heart-story/frontend/index.html
```

### User Flow

1. Click "START" on mode select screen
2. Choose between Life Story or Day Simulator
3. **Life Story**: Enter birth date → See total heartbeats → Learn facts
4. **Day Simulator**: Navigate rooms → Make choices → See impact on heart rate

## Educational Goals

This project aims to:

- Make cardiovascular health engaging and accessible
- Visualize the heart's incredible lifetime work
- Teach how daily activities affect heart rate
- Encourage heart-healthy lifestyle choices
- Provide age-appropriate comparisons and context

## Interesting Facts Included

- Average human heart beats ~100,000 times per day
- Heart starts beating just 18 days after conception
- Lifetime heartbeats: 2-3 billion beats
- Heart pumps ~2,000 gallons of blood daily
- Size comparisons: human heart ≈ fist, blue whale heart ≈ small car
- Metabolic rate correlation: smaller animals = faster heart rates

## Future Enhancements

Potential additions:

- Exercise tracking integration (connect to fitness devices)
- Historical heart health data visualization
- Multiplayer comparison mode (compare stats with friends)
- Additional mini-games for different activities
- Achievement system for healthy choices
- Persistent save data (localStorage)
- More detailed anatomical education
- Sound effects and background music toggle

## Browser Compatibility

- Modern browsers with ES6 support required
- Web Audio API for sound effects (optional, degrades gracefully)
- Tested on: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Performance Notes

- Live heart counter updates every 1000ms (1 second)
- Day simulator runs on requestAnimationFrame loop
- No external dependencies (fully self-contained)
- Lightweight: ~50KB total (HTML + CSS + JS)

## Credits

- **Design System**: ByteSized Game Boy retro aesthetic
- **Medical Data**: Average heart rates from medical literature
- **Educational Content**: Cardiovascular health basics
- **Art Style**: 8-bit pixel art and Game Boy Classic palette

---

**Note**: This tool is for educational and entertainment purposes only. It is
not a medical device and does not provide actual heart rate monitoring or
medical advice. For health concerns, consult a qualified healthcare provider.
