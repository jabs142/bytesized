# Walking Through Time - Evolution of Invention

> An educational pixel-art game that takes players on a journey through 7 historical eras

**Frontend-Only Cartridge** - Interactive Phaser 3 game with procedurally generated sprites

## What's Built

- **7 Historical Eras:** From Stone Age to Modern Era, each with unique environments, NPCs, and inventions
- **Interactive Gameplay:** Talk to NPCs, collect items, explore each era at your own pace
- **Educational Content:** Learn about key innovations and historical context through in-game dialogue
- **Retro Pixel Art:** Procedurally generated sprites with authentic 8-bit aesthetic
- **Timeline System:** Visual progress tracker showing historical progression

## Historical Eras

1. **Caveman Era** - Stone Age tools and fire
2. **Farming Era** - Agricultural revolution
3. **Medieval Era** - Castles and feudal systems
4. **Renaissance Era** - Arts and scientific discovery
5. **Ancient Civilizations** - Egyptian/Mesopotamian innovations
6. **Industrial Revolution** - Steam power and mechanization
7. **Modern Era** - Computers and digital technology

## Architecture

### Game Structure

The game is built using **Phaser 3.70.0** and uses procedurally generated pixel art sprites. Each era is implemented as a separate Phaser Scene class.

**File Structure:**
- `index.html` - Main HTML entry point
- `style.css` - Styling and layout
- `game.js` - All game scenes and sprite generation logic

### Scene Template

Each scene follows a consistent structure:

```javascript
class ExampleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ExampleScene' });
    }

    create(data) {
        // 1. Generate textures (NPCs, player, objects)
        // 2. Setup player speed and direction
        // 3. Create camera bounds
        // 4. Create ground/environment
        // 5. Create portal to next era
        // 6. Create interactive objects
        // 7. Create NPCs
        // 8. Create player at spawn point
        // 9. Setup camera follow
        // 10. Setup controls (cursors, space, E key)
        // 11. Create UI elements (timeline, info panel)
        // 12. Show era title card
    }

    createGround() {
        // Generate terrain/floor tiles
    }

    createPortal() {
        // Create exit portal to next era
    }

    createObjects() {
        // Create interactive environmental objects
    }

    createNPCs() {
        // Create and position NPCs with animations
    }

    createPlayer(x, y) {
        // Create player sprite with animations
    }

    update(time, delta) {
        // Handle interactions and movement
    }

    updatePlayerMovement() {
        // Process player input and animations
    }

    enterNextEra() {
        // Transition to next scene
    }
}
```

## NPC Guidelines

### Distribution Pattern

Each era should have **3-4 NPCs** spread across the map in a balanced pattern. **DO NOT** cluster NPCs together.

**Good Distribution Example (Caveman Scene):**
```
Map (800x600):
┌─────────────────────────┐
│    NPC1 (180, 180)      │  ← Top left quadrant
│                         │
│              NPC2       │  ← Top right (620, 240)
│         (550, 280)      │
│                         │
│  NPC3                   │  ← Bottom left (200, 450)
│  (250, 420)             │
│                         │
│              NPC4       │  ← Bottom right (600, 520)
│         (580, 480)      │
└─────────────────────────┘
```

**Key Spacing Rules:**
- Minimum 200-300 pixels between NPCs
- Cover all four quadrants of the map
- Each NPC should have a distinct activity
- Use depth values 48-51 for NPCs and their props

### NPC Creation Pattern

```javascript
createNPCs() {
    this.npcs = [];
    this.npcProps = [];

    // NPC 1: Top-left quadrant
    const npc1 = this.add.sprite(180, 180, 'era-npc1');
    npc1.setDepth(50);
    npc1.activity = 'activity-name';

    // Add activity animation
    this.anims.create({
        key: 'npc1-work',
        frames: [
            { key: 'era-npc1', frame: 0 },
            { key: 'era-npc1', frame: 1 }
        ],
        frameRate: 2,
        repeat: -1
    });
    npc1.play('npc1-work');

    // Optional: Add props (tools, objects)
    const prop1 = this.add.circle(180, 195, 8, 0xColor).setDepth(49);
    this.npcProps.push(prop1);

    this.npcs.push(npc1);

    // Repeat for NPCs 2-4 in other quadrants
    // ...
}
```

## Player Sprite System

### Era-Specific Player Characters

Each era should have its own player sprite to reflect the time period's clothing and appearance.

### Player Sprite Generator Pattern

All player sprites use a standardized canvas size and frame layout:

**Specifications:**
- Canvas: 96×192 pixels
- Frame size: 32×48 pixels per character
- Layout: 12 frames (3 frames per direction × 4 directions)
- Directions: down (row 0), left (row 1), right (row 2), up (row 3)

**Generator Function Template:**

```javascript
function generateEraPlayerSprite(scene, key) {
    const frameWidth = 32;
    const frameHeight = 48;
    const canvas = scene.textures.createCanvas(key, 96, 192);
    const ctx = canvas.getContext();

    function drawFrame(x, y, legOffset1, legOffset2) {
        const centerX = x + frameWidth / 2;
        const baseY = y;

        // Head
        ctx.fillStyle = '#skinTone';
        ctx.fillRect(centerX - 6, baseY + 4, 12, 12);

        // Hair
        ctx.fillStyle = '#hairColor';
        ctx.fillRect(centerX - 7, baseY + 2, 14, 6);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX - 4, baseY + 8, 2, 2);
        ctx.fillRect(centerX + 2, baseY + 8, 2, 2);

        // Body/Clothing (era-specific styling)
        ctx.fillStyle = '#clothingColor';
        ctx.fillRect(centerX - 8, baseY + 16, 16, 14);

        // Arms
        ctx.fillStyle = '#skinTone';
        ctx.fillRect(centerX - 10, baseY + 18, 3, 10);
        ctx.fillRect(centerX + 7, baseY + 18, 3, 10);

        // Legs
        ctx.fillStyle = '#pantsColor';
        ctx.fillRect(centerX - 6, baseY + 30, 5, 14 + legOffset1);
        ctx.fillRect(centerX + 1, baseY + 30, 5, 14 + legOffset2);

        // Feet
        ctx.fillStyle = '#shoeColor';
        ctx.fillRect(centerX - 6, baseY + 44 + legOffset1, 5, 4);
        ctx.fillRect(centerX + 1, baseY + 44 + legOffset2, 5, 4);
    }

    // Generate frames for each direction
    // Row 0: Walking down (frames 0-2)
    drawFrame(0, 0, 0, 0);   // Standing
    drawFrame(32, 0, 2, 0);  // Left leg forward
    drawFrame(64, 0, 0, 2);  // Right leg forward

    // Row 1: Walking left (frames 3-5)
    drawFrame(0, 48, 0, 0);
    drawFrame(32, 48, 2, 0);
    drawFrame(64, 48, 0, 2);

    // Row 2: Walking right (frames 6-8)
    drawFrame(0, 96, 0, 0);
    drawFrame(32, 96, 2, 0);
    drawFrame(64, 96, 0, 2);

    // Row 3: Walking up (frames 9-11)
    drawFrame(0, 144, 0, 0);
    drawFrame(32, 144, 2, 0);
    drawFrame(64, 144, 0, 2);

    canvas.refresh();
}
```

### Integrating Player Sprite in Scene

**Step 1: Generate texture in `create()` method:**

```javascript
create(data) {
    // Generate era-specific player character
    if (!this.textures.exists('player-era')) {
        generateEraPlayerSprite(this, 'player-era');
    }

    // Add frame configs for player sprite
    if (!this.textures.get('player-era').has(0)) {
        for (let i = 0; i < 12; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            this.textures.get('player-era').add(i, 0, col * 32, row * 48, 32, 48);
        }
    }

    // ... rest of scene setup
}
```

**Step 2: Create player with animations in `createPlayer()` method:**

```javascript
createPlayer(x, y) {
    // Create player sprite
    this.player = this.physics.add.sprite(x, y, 'player-era');
    this.player.setCollideWorldBounds(true);
    this.player.setSize(24, 40);
    this.player.setOffset(4, 8);
    this.player.setDepth(50);

    // Create animations if they don't exist yet
    if (!this.anims.exists('era-walk-down')) {
        this.anims.create({
            key: 'era-walk-down',
            frames: [
                { key: 'player-era', frame: 0 },
                { key: 'player-era', frame: 1 },
                { key: 'player-era', frame: 2 }
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'era-walk-left',
            frames: this.anims.generateFrameNumbers('player-era', { start: 3, end: 5 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'era-walk-right',
            frames: this.anims.generateFrameNumbers('player-era', { start: 6, end: 8 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'era-walk-up',
            frames: this.anims.generateFrameNumbers('player-era', { start: 9, end: 11 }),
            frameRate: 8,
            repeat: -1
        });
    }

    // Enable collision with portal
    this.physics.add.overlap(this.player, this.portal, this.handlePortalInteraction, null, this);
}
```

**Step 3: Use animations in `updatePlayerMovement()` method:**

```javascript
updatePlayerMovement() {
    // Reset velocity
    this.player.setVelocity(0);

    let moving = false;
    let newDirection = this.lastDirection;

    // Movement input
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.playerSpeed);
        newDirection = 'left';
        moving = true;
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.playerSpeed);
        newDirection = 'right';
        moving = true;
    }

    if (this.cursors.up.isDown) {
        this.player.setVelocityY(-this.playerSpeed);
        newDirection = 'up';
        moving = true;
    } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(this.playerSpeed);
        newDirection = 'down';
        moving = true;
    }

    // Normalize diagonal movement
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
        this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // Update animation
    if (moving) {
        if (newDirection !== this.lastDirection) {
            this.player.play(`era-walk-${newDirection}`);
            this.lastDirection = newDirection;
        }
    } else {
        this.player.stop();
        const frameMap = { down: 0, left: 3, right: 6, up: 9 };
        this.player.setFrame(frameMap[this.lastDirection]);
    }
}
```

## Naming Conventions

### Texture Keys

Follow these patterns for consistent naming:

- **Player sprites:** `player-{era}` (e.g., `player-caveman`, `player-medieval`)
- **NPC sprites:** `{era}-{role}` (e.g., `ancient-scribe`, `industrial-engineer`)
- **Object sprites:** `{object-name}` (e.g., `telescope`, `anvil`)

### Animation Keys

- **Player animations:** `{era}-walk-{direction}` (e.g., `caveman-walk-down`, `farming-walk-left`)
- **NPC animations:** `{role}-work` or `{role}-{action}` (e.g., `scribe-work`, `farmer-harvest`)

### Scene Keys

- Scene class names: `{Era}Scene` (e.g., `CavemanScene`, `IndustrialScene`)
- Scene keys: `{Era}Scene` (must match class name for Phaser routing)

## Map Layout Reference

All scenes use an **800×600 pixel** playable area.

```
Quadrant Layout:
┌───────────┬───────────┐
│           │           │
│  Q1       │      Q2   │
│  (0-400,  │ (400-800, │
│   0-300)  │   0-300)  │
│           │           │
├───────────┼───────────┤
│           │           │
│  Q3       │      Q4   │
│  (0-400,  │ (400-800, │
│   300-600)│   300-600)│
│           │           │
└───────────┴───────────┘

Portal typically at: (400, 90) - Top center
```

## Interactive System

### Info Panel

Each NPC and object can have an info panel with educational content:

```javascript
const infoData = {
    title: "Innovation Name",
    content: "Educational description (2-3 sentences max)",
    impact: "Why this innovation was important"
};

// Add to interactables array
this.interactables.push({
    x: npc.x,
    y: npc.y,
    indicator: indicatorSprite,
    infoData: infoData
});
```

### Controls

- **Arrow Keys:** Move player
- **E Key:** Interact with nearby NPCs/objects
- **Space Bar:** Enter portal to next era

## Best Practices

### Adding a New Era Scene

1. Create new scene class extending `Phaser.Scene`
2. Generate era-specific player sprite function
3. Generate 3-4 NPC sprite functions with unique activities
4. Create ground/terrain with era-appropriate styling
5. Position 3-4 NPCs across all quadrants (200-300px spacing)
6. Add interactive objects with educational info
7. Create portal to next era
8. Add to Phaser game config scenes array
9. Update previous era's `enterNextEra()` to transition to new scene
10. Add to timeline bar

### Performance Considerations

- Check if textures exist before generating: `if (!this.textures.exists(key))`
- Check if animations exist before creating: `if (!this.anims.exists(key))`
- Reuse shared textures across scenes when possible
- Keep sprite generation code in separate functions for organization

### Visual Consistency

- Use consistent pixel art style (blocky, low-res aesthetic)
- Maintain 32×48 pixel character size
- Use muted, period-appropriate color palettes
- Add depth layering (ground=0, objects=10-20, NPCs=48-51, player=50, UI=100+)

## Future Enhancements

Ideas for expanding the game:

- Add more historical eras (Ancient Greece, Age of Exploration, Space Age)
- Implement mini-games for each era
- Add achievement system for learning milestones
- Create branching paths showing different innovation timelines
- Add sound effects and period-appropriate music
- Implement save/load system for progress tracking

## Development Setup

1. Ensure you have a local web server (e.g., `npx http-server` or similar)
2. Open `index.html` in a modern browser
3. Edit `game.js` for gameplay changes
4. Edit `style.css` for UI styling
5. Refresh browser to see changes

## Troubleshooting

**Player not animating:**
- Check that frame configs are added after texture generation
- Verify animation keys match the keys used in `updatePlayerMovement()`
- Ensure texture key matches between generation and sprite creation

**NPCs clustered together:**
- Review NPC positions in `createNPCs()` method
- Ensure 200-300px minimum spacing between NPCs
- Distribute across all four map quadrants

**Animation conflicts between scenes:**
- Use era-specific animation key prefixes
- Check that animation keys are unique per scene
- Verify animation existence checks before creation

## Resources

- **Phaser 3 Documentation:** https://photonstorm.github.io/phaser3-docs/
- **Pixel Art Tutorial:** Focus on blocky, low-resolution style
- **Historical Reference:** Research each era for authentic details

---

**Created for educational purposes to teach history through interactive gameplay.**
