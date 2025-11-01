/**
 * Walking Through Time - A Phaser.js Game
 * Player walks through different historical eras
 */

// ===== TEXTURE GENERATION UTILITIES =====

/**
 * Generate an improved dirt tile texture
 */
function generateDirtTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 32);
    const ctx = canvas.getContext();

    // Base dirt colors (multiple shades)
    const dirtColors = ['#8b7355', '#7a6348', '#6b5642', '#9a826d'];
    ctx.fillStyle = dirtColors[Math.floor(Math.random() * dirtColors.length)];
    ctx.fillRect(0, 0, 32, 32);

    // Add darker patches for depth
    for (let i = 0; i < 25; i++) {
        const x = Math.floor(Math.random() * 32);
        const y = Math.floor(Math.random() * 32);
        const size = Math.floor(Math.random() * 4) + 1;
        ctx.fillStyle = `rgba(60, 48, 38, ${Math.random() * 0.4 + 0.2})`;
        ctx.fillRect(x, y, size, size);
    }

    // Add small pebbles/highlights
    for (let i = 0; i < 10; i++) {
        const x = Math.floor(Math.random() * 30) + 1;
        const y = Math.floor(Math.random() * 30) + 1;
        ctx.fillStyle = `rgba(150, 130, 110, ${Math.random() * 0.3})`;
        ctx.fillRect(x, y, 2, 2);
    }

    canvas.refresh();
}

/**
 * Generate an improved stone tile texture
 */
function generateStoneTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 32);
    const ctx = canvas.getContext();

    // Base stone color with gradient
    const gradient = ctx.createLinearGradient(0, 0, 32, 32);
    gradient.addColorStop(0, '#787774');
    gradient.addColorStop(1, '#5a5956');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    // Add cracks/lines
    ctx.strokeStyle = 'rgba(40, 40, 40, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 32, Math.random() * 32);
        ctx.lineTo(Math.random() * 32, Math.random() * 32);
        ctx.stroke();
    }

    // Add texture variation
    for (let i = 0; i < 20; i++) {
        const x = Math.floor(Math.random() * 32);
        const y = Math.floor(Math.random() * 32);
        const size = Math.floor(Math.random() * 3) + 1;
        ctx.fillStyle = `rgba(96, 96, 92, ${Math.random() * 0.3 + 0.1})`;
        ctx.fillRect(x, y, size, size);
    }

    canvas.refresh();
}

/**
 * Generate a cave wall texture with gradient
 */
function generateCaveWallTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 64);
    const ctx = canvas.getContext();

    // Dark gradient for depth
    const gradient = ctx.createLinearGradient(0, 0, 0, 64);
    gradient.addColorStop(0, '#2a2a2a');
    gradient.addColorStop(0.5, '#1a1a1a');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 64);

    // Rocky highlights
    for (let i = 0; i < 15; i++) {
        const x = Math.floor(Math.random() * 32);
        const y = Math.floor(Math.random() * 64);
        const size = Math.floor(Math.random() * 4) + 1;
        ctx.fillStyle = `rgba(74, 74, 74, ${Math.random() * 0.3})`;
        ctx.fillRect(x, y, size, size);
    }

    canvas.refresh();
}

/**
 * Generate a humanoid character sprite with walking animation
 * @param {Phaser.Scene} scene - The scene
 * @param {string} key - Texture key
 * @param {Object} colors - Color scheme { skin, fur, hair }
 */
function generateCharacterSprite(scene, key, colors = {}) {
    // Default caveman colors - animal skins/furs
    const skin = colors.skin || '#d4a574';
    const fur = colors.fur || '#8b6f47'; // Tan animal skin
    const furDark = colors.furDark || '#6b5642'; // Darker patches
    const hair = colors.hair || '#3d2817';

    // Create sprite sheet: 3 frames × 4 directions = 12 frames
    // Layout: 96×192 (3 columns, 4 rows)
    const canvas = scene.textures.createCanvas(key, 96, 192);
    const ctx = canvas.getContext();

    const frameWidth = 32;
    const frameHeight = 48;

    // Helper function to draw a humanoid frame
    function drawFrame(x, y, legOffset1, legOffset2) {
        const centerX = x + frameWidth / 2;
        const baseY = y;

        // Head
        ctx.fillStyle = skin;
        ctx.fillRect(centerX - 6, baseY + 4, 12, 12);

        // Wild, messy hair
        ctx.fillStyle = hair;
        ctx.fillRect(centerX - 7, baseY + 3, 14, 5);
        ctx.fillRect(centerX - 8, baseY + 4, 2, 4); // Left side messy
        ctx.fillRect(centerX + 6, baseY + 4, 2, 4); // Right side messy

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX - 4, baseY + 8, 2, 2);
        ctx.fillRect(centerX + 2, baseY + 8, 2, 2);

        // Beard/facial hair
        ctx.fillStyle = hair;
        ctx.fillRect(centerX - 4, baseY + 12, 8, 3);

        // Animal skin wrap on torso (ragged edges)
        ctx.fillStyle = fur;
        ctx.fillRect(centerX - 8, baseY + 16, 16, 12);

        // Darker fur patches for texture
        ctx.fillStyle = furDark;
        ctx.fillRect(centerX - 6, baseY + 17, 4, 3);
        ctx.fillRect(centerX + 1, baseY + 21, 3, 4);

        // Ragged bottom edge of fur wrap
        ctx.fillRect(centerX - 7, baseY + 28, 3, 2);
        ctx.fillRect(centerX - 2, baseY + 28, 2, 2);
        ctx.fillRect(centerX + 2, baseY + 28, 3, 2);

        // Bare arms (primitive)
        ctx.fillStyle = skin;
        ctx.fillRect(centerX - 11, baseY + 18, 3, 12);
        ctx.fillRect(centerX + 8, baseY + 18, 3, 12);

        // Animal skin loincloth/wrap on legs
        ctx.fillStyle = fur;
        ctx.fillRect(centerX - 6, baseY + 30 + legOffset1, 5, 10);
        ctx.fillRect(centerX + 1, baseY + 30 + legOffset2, 5, 10);

        // Bare lower legs
        ctx.fillStyle = skin;
        ctx.fillRect(centerX - 6, baseY + 40 + legOffset1, 5, 6);
        ctx.fillRect(centerX + 1, baseY + 40 + legOffset2, 5, 6);

        // Bare feet (no shoes)
        ctx.fillStyle = '#b8956a';
        ctx.fillRect(centerX - 6, baseY + 44 + legOffset1, 5, 3);
        ctx.fillRect(centerX + 1, baseY + 44 + legOffset2, 5, 3);
    }

    // Generate frames for each direction
    // Row 0: Walk Down
    drawFrame(0, 0, 0, 0);      // Idle
    drawFrame(32, 0, -2, 2);    // Left leg forward
    drawFrame(64, 0, 2, -2);    // Right leg forward

    // Row 1: Walk Left
    for (let frame = 0; frame < 3; frame++) {
        const x = frame * frameWidth;
        const y = frameHeight;
        const legOffset = frame === 1 ? -2 : frame === 2 ? 2 : 0;

        drawFrame(x, y, legOffset, -legOffset);
    }

    // Row 2: Walk Right (mirror of left)
    for (let frame = 0; frame < 3; frame++) {
        const x = frame * frameWidth;
        const y = frameHeight * 2;
        const legOffset = frame === 1 ? -2 : frame === 2 ? 2 : 0;

        drawFrame(x, y, legOffset, -legOffset);
    }

    // Row 3: Walk Up (back view)
    drawFrame(0, frameHeight * 3, 0, 0);      // Idle
    drawFrame(32, frameHeight * 3, -2, 2);    // Left leg forward
    drawFrame(64, frameHeight * 3, 2, -2);    // Right leg forward

    canvas.refresh();
}

/**
 * Generate NPC sprites (different color variations)
 */
function generateNPCSprite(scene, key, variant = 0) {
    const variants = [
        { skin: '#c49a6c', fur: '#7a6348', furDark: '#5a4838', hair: '#4a3a2a' },
        { skin: '#d4a574', fur: '#9a826d', furDark: '#7a6348', hair: '#3d2817' },
        { skin: '#b8956a', fur: '#6b5642', furDark: '#4a3a2a', hair: '#2a1a0a' },
        { skin: '#c9a876', fur: '#8b7355', furDark: '#6b5642', hair: '#594a3a' }
    ];
    generateCharacterSprite(scene, key, variants[variant % variants.length]);
}

/**
 * Generate work animation frames for activity-specific poses
 */
function generateWorkFrames(scene, key, colors, activity) {
    const skin = colors.skin || '#d4a574';
    const fur = colors.fur || '#8b6f47';
    const furDark = colors.furDark || '#6b5642';
    const hair = colors.hair || '#3d2817';

    const frameWidth = 32;
    const frameHeight = 48;
    let numFrames = 3; // Default

    if (activity === 'fire') numFrames = 3;
    else if (activity === 'spear') numFrames = 4;
    else if (activity === 'crafting') numFrames = 4;

    const canvas = scene.textures.createCanvas(key, frameWidth * numFrames, frameHeight);
    const ctx = canvas.getContext();

    // Helper to draw body parts
    function drawBodyBase(x, y) {
        const centerX = x + frameWidth / 2;
        const baseY = y;

        // Head
        ctx.fillStyle = skin;
        ctx.fillRect(centerX - 6, baseY + 4, 12, 12);

        // Hair
        ctx.fillStyle = hair;
        ctx.fillRect(centerX - 7, baseY + 3, 14, 5);
        ctx.fillRect(centerX - 8, baseY + 4, 2, 4);
        ctx.fillRect(centerX + 6, baseY + 4, 2, 4);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX - 4, baseY + 8, 2, 2);
        ctx.fillRect(centerX + 2, baseY + 8, 2, 2);

        // Beard
        ctx.fillStyle = hair;
        ctx.fillRect(centerX - 4, baseY + 12, 8, 3);

        // Torso
        ctx.fillStyle = fur;
        ctx.fillRect(centerX - 8, baseY + 16, 16, 12);
        ctx.fillStyle = furDark;
        ctx.fillRect(centerX - 6, baseY + 17, 4, 3);
        ctx.fillRect(centerX + 1, baseY + 21, 3, 4);

        // Legs
        ctx.fillStyle = fur;
        ctx.fillRect(centerX - 6, baseY + 30, 5, 10);
        ctx.fillRect(centerX + 1, baseY + 30, 5, 10);
        ctx.fillStyle = skin;
        ctx.fillRect(centerX - 6, baseY + 40, 5, 6);
        ctx.fillRect(centerX + 1, baseY + 40, 5, 6);
        ctx.fillStyle = '#b8956a';
        ctx.fillRect(centerX - 6, baseY + 44, 5, 3);
        ctx.fillRect(centerX + 1, baseY + 44, 5, 3);

        return { centerX, baseY };
    }

    if (activity === 'fire') {
        // Frame 0: Idle
        const pos0 = drawBodyBase(0, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos0.centerX - 11, pos0.baseY + 18, 3, 12);
        ctx.fillRect(pos0.centerX + 8, pos0.baseY + 18, 3, 12);

        // Frame 1: Right arm reaching down
        const pos1 = drawBodyBase(frameWidth, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos1.centerX - 11, pos1.baseY + 18, 3, 12); // Left arm normal
        ctx.fillRect(pos1.centerX + 8, pos1.baseY + 24, 3, 14); // Right arm down

        // Frame 2: Right arm lower (poking fire)
        const pos2 = drawBodyBase(frameWidth * 2, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos2.centerX - 11, pos2.baseY + 18, 3, 12); // Left arm normal
        ctx.fillRect(pos2.centerX + 8, pos2.baseY + 28, 3, 16); // Right arm further down
    } else if (activity === 'spear') {
        // Frame 0: Holding spear horizontally
        const pos0 = drawBodyBase(0, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos0.centerX - 11, pos0.baseY + 20, 3, 8);
        ctx.fillRect(pos0.centerX + 8, pos0.baseY + 20, 3, 8);

        // Frame 1: Right hand down (sharpening)
        const pos1 = drawBodyBase(frameWidth, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos1.centerX - 11, pos1.baseY + 20, 3, 8);
        ctx.fillRect(pos1.centerX + 8, pos1.baseY + 26, 3, 10);

        // Frame 2: Right hand mid
        const pos2 = drawBodyBase(frameWidth * 2, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos2.centerX - 11, pos2.baseY + 20, 3, 8);
        ctx.fillRect(pos2.centerX + 8, pos2.baseY + 23, 3, 9);

        // Frame 3: Right hand up
        const pos3 = drawBodyBase(frameWidth * 3, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos3.centerX - 11, pos3.baseY + 20, 3, 8);
        ctx.fillRect(pos3.centerX + 8, pos3.baseY + 18, 3, 8);
    } else if (activity === 'crafting') {
        // Frame 0: Arms raised overhead
        const pos0 = drawBodyBase(0, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos0.centerX - 11, pos0.baseY + 10, 3, 8);
        ctx.fillRect(pos0.centerX + 8, pos0.baseY + 10, 3, 8);

        // Frame 1: Arms mid-swing
        const pos1 = drawBodyBase(frameWidth, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos1.centerX - 11, pos1.baseY + 16, 3, 10);
        ctx.fillRect(pos1.centerX + 8, pos1.baseY + 16, 3, 10);

        // Frame 2: Arms at bottom (impact)
        const pos2 = drawBodyBase(frameWidth * 2, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos2.centerX - 11, pos2.baseY + 24, 3, 12);
        ctx.fillRect(pos2.centerX + 8, pos2.baseY + 24, 3, 12);

        // Frame 3: Arms starting to rise
        const pos3 = drawBodyBase(frameWidth * 3, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos3.centerX - 11, pos3.baseY + 18, 3, 10);
        ctx.fillRect(pos3.centerX + 8, pos3.baseY + 18, 3, 10);
    }

    canvas.refresh();
}

/**
 * Generate wood/logs for fire base
 */
function generateWoodLogs(scene, key) {
    const canvas = scene.textures.createCanvas(key, 48, 24);
    const ctx = canvas.getContext();

    // Dark brown logs
    ctx.fillStyle = '#4a3a2a';

    // Log 1 (horizontal)
    ctx.fillRect(4, 12, 40, 8);
    // Wood texture lines
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, 14);
    ctx.lineTo(40, 14);
    ctx.stroke();

    // Log 2 (angled)
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(8, 6, 32, 8);

    // Bark texture
    for (let i = 0; i < 6; i++) {
        const x = 10 + i * 6;
        ctx.fillStyle = 'rgba(58, 42, 26, 0.5)';
        ctx.fillRect(x, 7, 2, 6);
    }

    canvas.refresh();
}

/**
 * Generate spear prop (bigger and more visible)
 */
function generateSpear(scene, key) {
    const canvas = scene.textures.createCanvas(key, 16, 48);
    const ctx = canvas.getContext();

    // Stone spearhead (brighter, sharper)
    ctx.fillStyle = '#a0a09c';
    ctx.fillRect(6, 0, 4, 10);
    ctx.fillRect(4, 2, 8, 6);

    // Dark outline for spearhead
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 2, 8, 6);

    // Brown binding where stone meets shaft
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(5, 10, 6, 3);

    // Wooden shaft (thicker, darker)
    ctx.fillStyle = '#6b5642';
    ctx.fillRect(5, 13, 6, 35);

    // Wood grain texture
    ctx.strokeStyle = '#5a4a32';
    ctx.lineWidth = 1;
    for (let i = 15; i < 48; i += 8) {
        ctx.beginPath();
        ctx.moveTo(6, i);
        ctx.lineTo(10, i);
        ctx.stroke();
    }

    canvas.refresh();
}

/**
 * Generate stone/tool props (bigger, more visible, distinct shapes)
 */
function generateStoneTool(scene, key, type = 'hammerstone') {
    const canvas = scene.textures.createCanvas(key, 28, 20);
    const ctx = canvas.getContext();

    // Use tan/beige to contrast with gray ground
    const baseColor = '#b8956a';
    const darkColor = '#8b7355';
    const highlightColor = '#d4c4a0';

    if (type === 'hammerstone') {
        // Oval hammerstone
        ctx.fillStyle = baseColor;
        ctx.fillRect(6, 4, 16, 12);
        ctx.fillRect(8, 2, 12, 16);
        ctx.fillRect(10, 1, 8, 18);

        // Dark patches
        ctx.fillStyle = darkColor;
        ctx.fillRect(8, 6, 4, 4);
        ctx.fillRect(16, 10, 4, 4);

        // Highlights
        ctx.fillStyle = highlightColor;
        ctx.fillRect(12, 5, 6, 3);
    } else if (type === 'scraper') {
        // Sharp-edged scraper
        ctx.fillStyle = baseColor;
        ctx.fillRect(8, 6, 14, 10);
        ctx.fillRect(10, 4, 12, 12);

        // Sharp edge (one side)
        ctx.fillStyle = darkColor;
        ctx.fillRect(8, 7, 2, 8);

        // Highlight on flat side
        ctx.fillStyle = highlightColor;
        ctx.fillRect(15, 8, 5, 4);
    } else if (type === 'flake') {
        // Rough flake
        ctx.fillStyle = baseColor;
        ctx.fillRect(10, 8, 12, 8);
        ctx.fillRect(8, 10, 14, 6);

        // Dark edge
        ctx.fillStyle = darkColor;
        ctx.fillRect(10, 8, 2, 8);

        // Highlight
        ctx.fillStyle = highlightColor;
        ctx.fillRect(16, 11, 4, 3);
    }

    // Black outline for all types
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 4, 14, 12);

    canvas.refresh();
}

/**
 * Generate wood stick for fire tending
 */
function generateStick(scene, key) {
    const canvas = scene.textures.createCanvas(key, 6, 40);
    const ctx = canvas.getContext();

    // Brown stick
    ctx.fillStyle = '#6b5642';
    ctx.fillRect(1, 0, 4, 40);

    // Darker end (burned from fire)
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(1, 35, 4, 5);

    // Wood texture
    ctx.strokeStyle = '#5a4a32';
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i += 8) {
        ctx.beginPath();
        ctx.moveTo(2, i);
        ctx.lineTo(4, i);
        ctx.stroke();
    }

    canvas.refresh();
}

/**
 * Generate realistic cave entrance texture with natural formations
 */
function generateCaveTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 80, 80);
    const ctx = canvas.getContext();

    // Dark cave opening with deep gradient
    const gradient = ctx.createRadialGradient(40, 45, 5, 40, 45, 35);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.7, '#0a0a0a');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;

    // Irregular cave opening shape (organic, not rectangular)
    ctx.beginPath();
    ctx.ellipse(40, 40, 30, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rocky cave walls (irregular stone formations)
    ctx.fillStyle = '#4a4238';

    // Top rocky overhang
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(15, 5);
    ctx.lineTo(25, 8);
    ctx.lineTo(35, 4);
    ctx.lineTo(45, 6);
    ctx.lineTo(55, 4);
    ctx.lineTo(65, 8);
    ctx.lineTo(70, 5);
    ctx.lineTo(75, 12);
    ctx.lineTo(60, 20);
    ctx.lineTo(50, 15);
    ctx.lineTo(40, 18);
    ctx.lineTo(30, 16);
    ctx.lineTo(20, 20);
    ctx.closePath();
    ctx.fill();

    // Left rocky wall
    ctx.beginPath();
    ctx.moveTo(5, 15);
    ctx.lineTo(8, 25);
    ctx.lineTo(12, 35);
    ctx.lineTo(10, 45);
    ctx.lineTo(15, 55);
    ctx.lineTo(20, 50);
    ctx.lineTo(18, 40);
    ctx.lineTo(15, 30);
    ctx.lineTo(12, 20);
    ctx.closePath();
    ctx.fill();

    // Right rocky wall
    ctx.beginPath();
    ctx.moveTo(75, 15);
    ctx.lineTo(72, 25);
    ctx.lineTo(68, 35);
    ctx.lineTo(70, 45);
    ctx.lineTo(65, 55);
    ctx.lineTo(60, 50);
    ctx.lineTo(62, 40);
    ctx.lineTo(65, 30);
    ctx.lineTo(68, 20);
    ctx.closePath();
    ctx.fill();

    // Stalagmites at bottom (pointy rocks coming up from ground)
    ctx.fillStyle = '#5a5248';

    // Left stalagmite
    ctx.beginPath();
    ctx.moveTo(18, 75);
    ctx.lineTo(22, 55);
    ctx.lineTo(26, 75);
    ctx.closePath();
    ctx.fill();

    // Center-left stalagmite
    ctx.beginPath();
    ctx.moveTo(32, 78);
    ctx.lineTo(35, 60);
    ctx.lineTo(38, 78);
    ctx.closePath();
    ctx.fill();

    // Center-right stalagmite
    ctx.beginPath();
    ctx.moveTo(46, 78);
    ctx.lineTo(48, 62);
    ctx.lineTo(50, 78);
    ctx.closePath();
    ctx.fill();

    // Right stalagmite
    ctx.beginPath();
    ctx.moveTo(58, 76);
    ctx.lineTo(61, 58);
    ctx.lineTo(64, 76);
    ctx.closePath();
    ctx.fill();

    // Add rocky texture and depth
    for (let i = 0; i < 80; i++) {
        const x = Math.floor(Math.random() * 80);
        const y = Math.floor(Math.random() * 80);
        const distFromCenter = Math.sqrt((x - 40) ** 2 + (y - 40) ** 2);

        // Only add texture to rock areas (not cave opening)
        if (distFromCenter > 30) {
            const size = Math.floor(Math.random() * 3) + 1;
            ctx.fillStyle = `rgba(90, 82, 72, ${Math.random() * 0.4 + 0.2})`;
            ctx.fillRect(x, y, size, size);
        }
    }

    // Darker cracks in the rock
    ctx.strokeStyle = 'rgba(30, 25, 20, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        const startX = Math.random() * 80;
        const startY = Math.random() * 30;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + (Math.random() * 20 - 10), startY + Math.random() * 40);
        ctx.stroke();
    }

    // Highlights on rock edges
    ctx.fillStyle = 'rgba(120, 110, 100, 0.3)';
    ctx.fillRect(12, 8, 4, 12);
    ctx.fillRect(66, 10, 3, 10);
    ctx.fillRect(8, 18, 3, 8);
    ctx.fillRect(70, 20, 3, 8);

    canvas.refresh();
}

/**
 * Generate fire particles (multiple colors)
 */
function generateFireParticles(scene) {
    // Red particle
    const redCanvas = scene.textures.createCanvas('fire-red', 8, 8);
    const redCtx = redCanvas.getContext();
    redCtx.fillStyle = '#ff0000';
    redCtx.beginPath();
    redCtx.arc(4, 4, 4, 0, Math.PI * 2);
    redCtx.fill();
    redCanvas.refresh();

    // Orange particle
    const orangeCanvas = scene.textures.createCanvas('fire-orange', 8, 8);
    const orangeCtx = orangeCanvas.getContext();
    orangeCtx.fillStyle = '#ff6b00';
    orangeCtx.beginPath();
    orangeCtx.arc(4, 4, 4, 0, Math.PI * 2);
    orangeCtx.fill();
    orangeCanvas.refresh();

    // Yellow particle
    const yellowCanvas = scene.textures.createCanvas('fire-yellow', 8, 8);
    const yellowCtx = yellowCanvas.getContext();
    yellowCtx.fillStyle = '#ffff00';
    yellowCtx.beginPath();
    yellowCtx.arc(4, 4, 4, 0, Math.PI * 2);
    yellowCtx.fill();
    yellowCanvas.refresh();

    // Smoke particle
    const smokeCanvas = scene.textures.createCanvas('fire-smoke', 8, 8);
    const smokeCtx = smokeCanvas.getContext();
    smokeCtx.fillStyle = '#666666';
    smokeCtx.beginPath();
    smokeCtx.arc(4, 4, 4, 0, Math.PI * 2);
    smokeCtx.fill();
    smokeCanvas.refresh();
}

// ===== FARMING ERA TEXTURES =====

/**
 * Generate grass texture for farming era
 */
function generateGrassTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 32);
    const ctx = canvas.getContext();

    // Base grass colors (multiple shades of green)
    const grassColors = ['#4a7c3a', '#5a8c4a', '#3a6c2a', '#6a9c5a'];
    ctx.fillStyle = grassColors[Math.floor(Math.random() * grassColors.length)];
    ctx.fillRect(0, 0, 32, 32);

    // Add darker grass patches for depth
    for (let i = 0; i < 30; i++) {
        const x = Math.floor(Math.random() * 32);
        const y = Math.floor(Math.random() * 32);
        const size = Math.floor(Math.random() * 3) + 1;
        ctx.fillStyle = `rgba(40, 80, 30, ${Math.random() * 0.3 + 0.2})`;
        ctx.fillRect(x, y, size, size);
    }

    // Add lighter highlights (grass blades catching light)
    for (let i = 0; i < 15; i++) {
        const x = Math.floor(Math.random() * 30) + 1;
        const y = Math.floor(Math.random() * 30) + 1;
        ctx.fillStyle = `rgba(140, 180, 120, ${Math.random() * 0.4})`;
        ctx.fillRect(x, y, 2, 2);
    }

    canvas.refresh();
}

/**
 * Generate farmland (tilled soil) texture
 */
function generateFarmlandTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 32);
    const ctx = canvas.getContext();

    // Dark brown tilled soil
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(0, 0, 32, 32);

    // Horizontal furrow lines
    for (let y = 4; y < 32; y += 8) {
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(0, y, 32, 3);
        ctx.fillStyle = '#6a5a4a';
        ctx.fillRect(0, y + 3, 32, 1);
    }

    // Add soil texture
    for (let i = 0; i < 25; i++) {
        const x = Math.floor(Math.random() * 32);
        const y = Math.floor(Math.random() * 32);
        const size = Math.floor(Math.random() * 2) + 1;
        ctx.fillStyle = `rgba(70, 60, 50, ${Math.random() * 0.4})`;
        ctx.fillRect(x, y, size, size);
    }

    canvas.refresh();
}

/**
 * Generate wheat stalk texture
 */
function generateWheatTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 16, 32);
    const ctx = canvas.getContext();

    // Golden wheat color
    const wheatColor = '#d4a832';
    const wheatDark = '#b48822';
    const stalkColor = '#8a7a4a';

    // Stalk
    ctx.fillStyle = stalkColor;
    ctx.fillRect(7, 12, 2, 20);

    // Wheat head (cluster at top)
    ctx.fillStyle = wheatColor;
    ctx.fillRect(5, 6, 6, 10);
    ctx.fillRect(6, 4, 4, 12);

    // Dark shading
    ctx.fillStyle = wheatDark;
    ctx.fillRect(5, 8, 2, 6);
    ctx.fillRect(9, 10, 2, 4);

    // Individual grains
    for (let i = 0; i < 6; i++) {
        const x = 5 + (i % 2) * 4;
        const y = 6 + Math.floor(i / 2) * 3;
        ctx.fillStyle = wheatColor;
        ctx.fillRect(x, y, 2, 2);
    }

    canvas.refresh();
}

/**
 * Generate wooden barn texture for portal
 */
function generateBarnTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 96, 96);
    const ctx = canvas.getContext();

    // Barn roof (wooden shingles)
    ctx.fillStyle = '#6a4a3a';
    ctx.beginPath();
    ctx.moveTo(10, 24);
    ctx.lineTo(48, 4);
    ctx.lineTo(86, 24);
    ctx.lineTo(86, 32);
    ctx.lineTo(48, 12);
    ctx.lineTo(10, 32);
    ctx.closePath();
    ctx.fill();

    // Darker roof shading
    ctx.fillStyle = '#5a3a2a';
    ctx.beginPath();
    ctx.moveTo(48, 4);
    ctx.lineTo(86, 24);
    ctx.lineTo(86, 32);
    ctx.lineTo(48, 12);
    ctx.closePath();
    ctx.fill();

    // Roof shingles texture
    ctx.strokeStyle = '#4a2a1a';
    ctx.lineWidth = 1;
    for (let y = 12; y < 30; y += 4) {
        ctx.beginPath();
        ctx.moveTo(48 - (30 - y) * 1.3, y);
        ctx.lineTo(48 + (30 - y) * 1.3, y);
        ctx.stroke();
    }

    // Main barn wall (red/brown wood)
    ctx.fillStyle = '#8a4a3a';
    ctx.fillRect(14, 28, 68, 58);

    // Vertical wooden planks
    ctx.fillStyle = '#7a3a2a';
    for (let i = 0; i < 8; i++) {
        const x = 16 + i * 8.5;
        ctx.fillRect(x, 28, 6, 58);
    }

    // Wood grain texture
    for (let i = 0; i < 7; i++) {
        const x = 18 + i * 8.5;
        ctx.strokeStyle = 'rgba(60, 30, 20, 0.4)';
        ctx.lineWidth = 1;
        for (let y = 30; y < 84; y += 6) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 4, y);
            ctx.stroke();
        }
    }

    // Large barn doors (slightly open, showing darkness inside)
    ctx.fillStyle = '#000000';
    ctx.fillRect(32, 48, 32, 38);

    // Left door (wooden planks)
    ctx.fillStyle = '#6a3a2a';
    ctx.fillRect(28, 48, 18, 38);
    // Door planks
    ctx.fillStyle = '#5a2a1a';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(30, 50 + i * 12, 14, 10);
    }
    // Door handle
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(42, 66, 3, 6);

    // Right door (wooden planks)
    ctx.fillStyle = '#6a3a2a';
    ctx.fillRect(50, 48, 18, 38);
    // Door planks
    ctx.fillStyle = '#5a2a1a';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(52, 50 + i * 12, 14, 10);
    }
    // Door handle
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(52, 66, 3, 6);

    // X-shaped door bracing
    ctx.strokeStyle = '#4a2a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 52);
    ctx.lineTo(44, 82);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(44, 52);
    ctx.lineTo(30, 82);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(52, 52);
    ctx.lineTo(66, 82);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(66, 52);
    ctx.lineTo(52, 82);
    ctx.stroke();

    // Hay loft window at top
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(40, 32, 16, 10);
    // Window frame
    ctx.strokeStyle = '#5a3a2a';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 32, 16, 10);

    // Hay bales in front of barn (left side)
    ctx.fillStyle = '#d4a832';
    ctx.fillRect(8, 78, 14, 10);
    ctx.fillRect(10, 70, 12, 8);
    // Hay texture (lines)
    ctx.strokeStyle = '#b48822';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(10, 72 + i * 3);
        ctx.lineTo(20, 72 + i * 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(9, 80 + i * 3);
        ctx.lineTo(20, 80 + i * 3);
        ctx.stroke();
    }

    // Hay bales (right side)
    ctx.fillStyle = '#d4a832';
    ctx.fillRect(74, 78, 14, 10);
    ctx.fillRect(76, 72, 10, 6);
    // Hay texture
    for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(76, 74 + i * 3);
        ctx.lineTo(84, 74 + i * 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(75, 80 + i * 3);
        ctx.lineTo(86, 80 + i * 3);
        ctx.stroke();
    }

    canvas.refresh();
}

/**
 * Generate hoe tool for farming
 */
function generateHoe(scene, key) {
    const canvas = scene.textures.createCanvas(key, 20, 48);
    const ctx = canvas.getContext();

    // Wooden handle
    ctx.fillStyle = '#6b5642';
    ctx.fillRect(9, 12, 2, 36);

    // Wood grain
    ctx.strokeStyle = '#5a4a32';
    ctx.lineWidth = 1;
    for (let i = 15; i < 48; i += 8) {
        ctx.beginPath();
        ctx.moveTo(9, i);
        ctx.lineTo(11, i);
        ctx.stroke();
    }

    // Metal hoe head
    ctx.fillStyle = '#787774';
    ctx.fillRect(0, 8, 16, 4);
    ctx.fillRect(1, 6, 14, 2);

    // Metal highlight
    ctx.fillStyle = '#a0a09c';
    ctx.fillRect(2, 7, 10, 1);

    // Dark outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 6, 16, 6);

    canvas.refresh();
}

/**
 * Generate sickle tool for harvesting
 */
function generateSickle(scene, key) {
    const canvas = scene.textures.createCanvas(key, 24, 24);
    const ctx = canvas.getContext();

    // Wooden handle
    ctx.fillStyle = '#6b5642';
    ctx.fillRect(4, 14, 6, 10);

    // Curved blade
    ctx.fillStyle = '#787774';
    ctx.beginPath();
    ctx.arc(12, 8, 8, 0, Math.PI);
    ctx.fill();

    // Blade inner curve (hollow)
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.arc(12, 8, 5, 0, Math.PI);
    ctx.fill();

    // Sharp edge highlight
    ctx.strokeStyle = '#a0a09c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(12, 8, 8, 0, Math.PI);
    ctx.stroke();

    // Black outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(12, 8, 8, 0, Math.PI);
    ctx.stroke();

    canvas.refresh();
}

/**
 * Generate work frames for farming activities
 */
function generateFarmingWorkFrames(scene, key, colors, activity) {
    const skin = colors.skin || '#d4a574';
    const shirt = colors.shirt || '#8b7355'; // Simple tunic
    const shirtDark = colors.shirtDark || '#6b5642';
    const pants = colors.pants || '#5a4a3a';
    const hair = colors.hair || '#3d2817';

    const frameWidth = 32;
    const frameHeight = 48;
    let numFrames = 4;

    const canvas = scene.textures.createCanvas(key, frameWidth * numFrames, frameHeight);
    const ctx = canvas.getContext();

    function drawFarmerBody(x, y) {
        const centerX = x + frameWidth / 2;
        const baseY = y;

        // Head
        ctx.fillStyle = skin;
        ctx.fillRect(centerX - 6, baseY + 4, 12, 12);

        // Hair
        ctx.fillStyle = hair;
        ctx.fillRect(centerX - 7, baseY + 3, 14, 5);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX - 4, baseY + 8, 2, 2);
        ctx.fillRect(centerX + 2, baseY + 8, 2, 2);

        // Simple tunic (peasant shirt)
        ctx.fillStyle = shirt;
        ctx.fillRect(centerX - 8, baseY + 16, 16, 14);
        ctx.fillStyle = shirtDark;
        ctx.fillRect(centerX - 7, baseY + 18, 4, 3);
        ctx.fillRect(centerX + 2, baseY + 20, 4, 3);

        // Pants
        ctx.fillStyle = pants;
        ctx.fillRect(centerX - 6, baseY + 30, 5, 12);
        ctx.fillRect(centerX + 1, baseY + 30, 5, 12);

        // Bare feet/simple shoes
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(centerX - 6, baseY + 42, 5, 4);
        ctx.fillRect(centerX + 1, baseY + 42, 5, 4);

        return { centerX, baseY };
    }

    if (activity === 'planting') {
        // Frame 0: Standing with seeds
        const pos0 = drawFarmerBody(0, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos0.centerX - 11, pos0.baseY + 18, 3, 10);
        ctx.fillRect(pos0.centerX + 8, pos0.baseY + 22, 3, 8);

        // Frame 1: Bending down
        const pos1 = drawFarmerBody(frameWidth, 2);
        ctx.fillStyle = skin;
        ctx.fillRect(pos1.centerX - 11, pos1.baseY + 20, 3, 12);
        ctx.fillRect(pos1.centerX + 8, pos1.baseY + 26, 3, 10);

        // Frame 2: Hand to ground
        const pos2 = drawFarmerBody(frameWidth * 2, 4);
        ctx.fillStyle = skin;
        ctx.fillRect(pos2.centerX - 11, pos2.baseY + 22, 3, 14);
        ctx.fillRect(pos2.centerX + 8, pos2.baseY + 30, 3, 12);

        // Frame 3: Rising back up
        const pos3 = drawFarmerBody(frameWidth * 3, 2);
        ctx.fillStyle = skin;
        ctx.fillRect(pos3.centerX - 11, pos3.baseY + 20, 3, 11);
        ctx.fillRect(pos3.centerX + 8, pos3.baseY + 24, 3, 9);
    } else if (activity === 'harvesting') {
        // Frame 0: Arms raised with sickle
        const pos0 = drawFarmerBody(0, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos0.centerX - 11, pos0.baseY + 14, 3, 8);
        ctx.fillRect(pos0.centerX + 8, pos0.baseY + 14, 3, 8);

        // Frame 1: Swinging down
        const pos1 = drawFarmerBody(frameWidth, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos1.centerX - 11, pos1.baseY + 18, 3, 10);
        ctx.fillRect(pos1.centerX + 8, pos1.baseY + 18, 3, 10);

        // Frame 2: At bottom of swing
        const pos2 = drawFarmerBody(frameWidth * 2, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos2.centerX - 11, pos2.baseY + 24, 3, 12);
        ctx.fillRect(pos2.centerX + 8, pos2.baseY + 24, 3, 12);

        // Frame 3: Pulling back
        const pos3 = drawFarmerBody(frameWidth * 3, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos3.centerX - 11, pos3.baseY + 20, 3, 10);
        ctx.fillRect(pos3.centerX + 8, pos3.baseY + 20, 3, 10);
    } else if (activity === 'tilling') {
        // Frame 0: Hoe raised
        const pos0 = drawFarmerBody(0, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos0.centerX - 11, pos0.baseY + 16, 3, 10);
        ctx.fillRect(pos0.centerX + 8, pos0.baseY + 16, 3, 10);

        // Frame 1: Swinging down
        const pos1 = drawFarmerBody(frameWidth, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos1.centerX - 11, pos1.baseY + 20, 3, 12);
        ctx.fillRect(pos1.centerX + 8, pos1.baseY + 20, 3, 12);

        // Frame 2: Impact with ground
        const pos2 = drawFarmerBody(frameWidth * 2, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos2.centerX - 11, pos2.baseY + 26, 3, 10);
        ctx.fillRect(pos2.centerX + 8, pos2.baseY + 26, 3, 10);

        // Frame 3: Pulling back
        const pos3 = drawFarmerBody(frameWidth * 3, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos3.centerX - 11, pos3.baseY + 22, 3, 11);
        ctx.fillRect(pos3.centerX + 8, pos3.baseY + 22, 3, 11);
    }

    canvas.refresh();
}

// ===== MEDIEVAL ERA TEXTURES =====

/**
 * Generate cobblestone texture
 */
function generateCobblestoneTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 32);
    const ctx = canvas.getContext();

    // Base stone color
    ctx.fillStyle = '#6a6a64';
    ctx.fillRect(0, 0, 32, 32);

    // Individual cobbles (4x4 grid)
    const cobbleSize = 7;
    const gap = 1;
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const x = col * (cobbleSize + gap) + 1;
            const y = row * (cobbleSize + gap) + 1;

            // Stone cobble
            ctx.fillStyle = row + col % 2 === 0 ? '#787874' : '#6a6a64';
            ctx.fillRect(x, y, cobbleSize, cobbleSize);

            // Darker shading
            ctx.fillStyle = 'rgba(50, 50, 50, 0.3)';
            ctx.fillRect(x, y + cobbleSize - 2, cobbleSize, 2);
            ctx.fillRect(x + cobbleSize - 2, y, 2, cobbleSize);

            // Highlight
            ctx.fillStyle = 'rgba(140, 140, 134, 0.4)';
            ctx.fillRect(x, y, 2, 2);
        }
    }

    // Mortar gaps
    ctx.fillStyle = '#5a5a54';
    for (let i = 0; i < 4; i++) {
        const pos = i * (cobbleSize + gap) + cobbleSize + 1;
        ctx.fillRect(0, pos, 32, gap);
        ctx.fillRect(pos, 0, gap, 32);
    }

    canvas.refresh();
}

/**
 * Generate castle wall texture
 */
function generateCastleWallTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 64, 96);
    const ctx = canvas.getContext();

    // Stone blocks
    ctx.fillStyle = '#787774';
    ctx.fillRect(0, 0, 64, 96);

    // Darker mortar lines between blocks
    ctx.fillStyle = '#4a4a48';
    ctx.fillRect(0, 24, 64, 2);
    ctx.fillRect(0, 48, 64, 2);
    ctx.fillRect(0, 72, 64, 2);
    ctx.fillRect(32, 0, 2, 96);

    // Stone texture
    for (let i = 0; i < 30; i++) {
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 96);
        const size = Math.floor(Math.random() * 3) + 1;
        ctx.fillStyle = `rgba(100, 100, 96, ${Math.random() * 0.4})`;
        ctx.fillRect(x, y, size, size);
    }

    // Cracks
    ctx.strokeStyle = 'rgba(60, 60, 58, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 64, Math.random() * 96);
        ctx.lineTo(Math.random() * 64, Math.random() * 96);
        ctx.stroke();
    }

    canvas.refresh();
}

/**
 * Generate grand castle entrance with flanking towers (portal)
 */
function generateCastleGateTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 160, 128);
    const ctx = canvas.getContext();

    // === LEFT TOWER ===
    // Tower base (stone blocks)
    ctx.fillStyle = '#6a6a64';
    ctx.fillRect(0, 24, 40, 104);

    // Stone block masonry lines
    ctx.strokeStyle = '#4a4a48';
    ctx.lineWidth = 2;
    for (let y = 40; y < 128; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(40, y);
        ctx.stroke();
    }
    // Vertical mortar line
    ctx.beginPath();
    ctx.moveTo(20, 24);
    ctx.lineTo(20, 128);
    ctx.stroke();

    // Battlements (crenellations) on left tower
    ctx.fillStyle = '#6a6a64';
    ctx.fillRect(0, 16, 8, 12);
    ctx.fillRect(16, 16, 8, 12);
    ctx.fillRect(32, 16, 8, 12);
    // Stone texture on battlements
    ctx.fillStyle = '#5a5a54';
    ctx.fillRect(1, 18, 6, 2);
    ctx.fillRect(17, 18, 6, 2);
    ctx.fillRect(33, 18, 6, 2);

    // Arrow slits in left tower
    ctx.fillStyle = '#000000';
    ctx.fillRect(16, 50, 4, 16);
    ctx.fillRect(16, 80, 4, 16);

    // === RIGHT TOWER ===
    // Tower base (stone blocks)
    ctx.fillStyle = '#6a6a64';
    ctx.fillRect(120, 24, 40, 104);

    // Stone block masonry lines
    for (let y = 40; y < 128; y += 16) {
        ctx.beginPath();
        ctx.moveTo(120, y);
        ctx.lineTo(160, y);
        ctx.stroke();
    }
    // Vertical mortar line
    ctx.beginPath();
    ctx.moveTo(140, 24);
    ctx.lineTo(140, 128);
    ctx.stroke();

    // Battlements on right tower
    ctx.fillStyle = '#6a6a64';
    ctx.fillRect(120, 16, 8, 12);
    ctx.fillRect(136, 16, 8, 12);
    ctx.fillRect(152, 16, 8, 12);
    // Stone texture
    ctx.fillStyle = '#5a5a54';
    ctx.fillRect(121, 18, 6, 2);
    ctx.fillRect(137, 18, 6, 2);
    ctx.fillRect(153, 18, 6, 2);

    // Arrow slits in right tower
    ctx.fillStyle = '#000000';
    ctx.fillRect(140, 50, 4, 16);
    ctx.fillRect(140, 80, 4, 16);

    // === CENTER ARCHWAY ===
    // Stone archway structure
    ctx.fillStyle = '#787774';
    ctx.fillRect(40, 32, 80, 96);

    // Arched opening (larger and more imposing)
    const gradient = ctx.createRadialGradient(80, 80, 15, 80, 80, 50);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.8, '#0a0a0a');
    gradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = gradient;

    // Draw arch shape
    ctx.beginPath();
    ctx.arc(80, 90, 32, Math.PI, 0, false);
    ctx.rect(48, 90, 64, 38);
    ctx.fill();

    // Portcullis (metal gate) showing at top of opening
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
        const x = 52 + i * 12;
        ctx.beginPath();
        ctx.moveTo(x, 68);
        ctx.lineTo(x, 88);
        ctx.stroke();
    }
    // Horizontal bars
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(52, 74);
    ctx.lineTo(112, 74);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(52, 82);
    ctx.lineTo(112, 82);
    ctx.stroke();

    // Wooden gate door (partially visible behind portcullis)
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(52, 90, 56, 38);

    // Vertical planks on door
    ctx.fillStyle = '#3a2a1a';
    for (let i = 0; i < 6; i++) {
        const x = 54 + i * 9;
        ctx.fillRect(x, 90, 6, 38);
    }

    // Metal bands across door
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(52, 100, 56, 4);
    ctx.fillRect(52, 115, 56, 4);

    // === DECORATIVE ELEMENTS ===
    // Stone archway detail above gate
    ctx.fillStyle = '#8a8a84';
    ctx.fillRect(44, 32, 72, 8);

    // Heraldic banners hanging from towers
    // Left banner (red)
    ctx.fillStyle = '#8a2a2a';
    ctx.fillRect(8, 32, 16, 24);
    // Banner pattern (simple cross)
    ctx.fillStyle = '#d4a832';
    ctx.fillRect(14, 36, 4, 16);
    ctx.fillRect(10, 42, 12, 4);

    // Right banner (blue)
    ctx.fillStyle = '#2a2a8a';
    ctx.fillRect(136, 32, 16, 24);
    // Banner pattern (simple cross)
    ctx.fillStyle = '#d4a832';
    ctx.fillRect(142, 36, 4, 16);
    ctx.fillRect(138, 42, 12, 4);

    // Stone texture variations for depth
    for (let i = 0; i < 50; i++) {
        const x = Math.floor(Math.random() * 160);
        const y = Math.floor(Math.random() * 128);
        // Only add texture to stone areas
        if ((x < 40 && y > 24) || (x > 120 && y > 24) || (x >= 40 && x <= 120 && y > 32 && y < 68)) {
            const size = Math.floor(Math.random() * 2) + 1;
            ctx.fillStyle = `rgba(100, 100, 96, ${Math.random() * 0.3})`;
            ctx.fillRect(x, y, size, size);
        }
    }

    canvas.refresh();
}

/**
 * Generate torch texture for ambient lighting
 */
function generateTorchTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 16, 32);
    const ctx = canvas.getContext();

    // Wooden handle
    ctx.fillStyle = '#5a4a32';
    ctx.fillRect(6, 12, 4, 20);

    // Torch head (wrapped cloth)
    ctx.fillStyle = '#6a5a42';
    ctx.fillRect(4, 8, 8, 6);

    // Flame (orange-red)
    ctx.fillStyle = '#ff6b00';
    ctx.fillRect(5, 2, 6, 8);

    // Yellow flame tip
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(6, 0, 4, 5);

    canvas.refresh();
}

/**
 * Generate anvil prop for blacksmith
 */
function generateAnvil(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 24);
    const ctx = canvas.getContext();

    // Dark metal base
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(8, 16, 16, 8);

    // Anvil body
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(4, 8, 24, 8);

    // Horn (tapered end)
    ctx.fillRect(2, 10, 4, 4);

    // Darker shading
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(5, 13, 22, 3);

    // Highlight on top
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(6, 8, 20, 2);

    // Black outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 8, 24, 8);

    canvas.refresh();
}

/**
 * Generate hammer prop for blacksmith
 */
function generateHammer(scene, key) {
    const canvas = scene.textures.createCanvas(key, 24, 32);
    const ctx = canvas.getContext();

    // Wooden handle
    ctx.fillStyle = '#6b5642';
    ctx.fillRect(10, 12, 4, 20);

    // Metal hammerhead
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(4, 8, 16, 8);

    // Darker side
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(5, 13, 14, 3);

    // Highlight
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(6, 8, 12, 2);

    // Black outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 8, 16, 8);

    canvas.refresh();
}

/**
 * Generate work frames for medieval activities
 */
function generateMedievalWorkFrames(scene, key, colors, activity) {
    const skin = colors.skin || '#d4a574';
    const tunic = colors.tunic || '#8a4a4a'; // Red/brown medieval tunic
    const tunicDark = colors.tunicDark || '#6a3a3a';
    const pants = colors.pants || '#5a4a3a';
    const hair = colors.hair || '#3d2817';

    const frameWidth = 32;
    const frameHeight = 48;
    let numFrames = 4;

    const canvas = scene.textures.createCanvas(key, frameWidth * numFrames, frameHeight);
    const ctx = canvas.getContext();

    function drawMedievalBody(x, y) {
        const centerX = x + frameWidth / 2;
        const baseY = y;

        // Head
        ctx.fillStyle = skin;
        ctx.fillRect(centerX - 6, baseY + 4, 12, 12);

        // Hair
        ctx.fillStyle = hair;
        ctx.fillRect(centerX - 7, baseY + 3, 14, 5);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX - 4, baseY + 8, 2, 2);
        ctx.fillRect(centerX + 2, baseY + 8, 2, 2);

        // Medieval tunic
        ctx.fillStyle = tunic;
        ctx.fillRect(centerX - 8, baseY + 16, 16, 16);
        ctx.fillStyle = tunicDark;
        ctx.fillRect(centerX - 7, baseY + 18, 4, 4);
        ctx.fillRect(centerX + 2, baseY + 20, 4, 4);

        // Belt
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(centerX - 8, baseY + 30, 16, 2);

        // Pants
        ctx.fillStyle = pants;
        ctx.fillRect(centerX - 6, baseY + 32, 5, 12);
        ctx.fillRect(centerX + 1, baseY + 32, 5, 12);

        // Boots
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(centerX - 6, baseY + 42, 5, 4);
        ctx.fillRect(centerX + 1, baseY + 42, 5, 4);

        return { centerX, baseY };
    }

    if (activity === 'blacksmith') {
        // Frame 0: Hammer raised
        const pos0 = drawMedievalBody(0, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos0.centerX - 11, pos0.baseY + 14, 3, 8);
        ctx.fillRect(pos0.centerX + 8, pos0.baseY + 14, 3, 8);

        // Frame 1: Swinging down
        const pos1 = drawMedievalBody(frameWidth, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos1.centerX - 11, pos1.baseY + 18, 3, 10);
        ctx.fillRect(pos1.centerX + 8, pos1.baseY + 18, 3, 10);

        // Frame 2: Impact on anvil
        const pos2 = drawMedievalBody(frameWidth * 2, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos2.centerX - 11, pos2.baseY + 24, 3, 10);
        ctx.fillRect(pos2.centerX + 8, pos2.baseY + 24, 3, 10);

        // Frame 3: Raising back up
        const pos3 = drawMedievalBody(frameWidth * 3, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos3.centerX - 11, pos3.baseY + 20, 3, 9);
        ctx.fillRect(pos3.centerX + 8, pos3.baseY + 20, 3, 9);
    } else if (activity === 'guarding') {
        // Standing animations with spear
        for (let i = 0; i < 4; i++) {
            const pos = drawMedievalBody(frameWidth * i, 0);
            ctx.fillStyle = skin;
            // Holding spear upright
            ctx.fillRect(pos.centerX - 11, pos.baseY + 18, 3, 12);
            ctx.fillRect(pos.centerX + 8, pos.baseY + 20, 3, 10);
        }
    }

    canvas.refresh();
}

// ===== RENAISSANCE ERA TEXTURES =====

/**
 * Generate marble tile texture for Renaissance ground
 */
function generateMarbleTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 32);
    const ctx = canvas.getContext();

    // Base marble color (cream/beige)
    ctx.fillStyle = '#f5f3e8';
    ctx.fillRect(0, 0, 32, 32);

    // Darker marble variations
    ctx.fillStyle = '#e8e5d5';
    ctx.fillRect(1, 1, 14, 14);
    ctx.fillRect(17, 17, 14, 14);

    // Lighter highlights
    ctx.fillStyle = '#faf8f0';
    ctx.fillRect(17, 1, 14, 14);
    ctx.fillRect(1, 17, 14, 14);

    // Grout lines
    ctx.strokeStyle = '#c8c5b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 32, 32);

    // Marble veining (random organic lines)
    ctx.strokeStyle = 'rgba(150, 140, 120, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const startX = Math.random() * 32;
        const startY = Math.random() * 32;
        const endX = startX + (Math.random() - 0.5) * 20;
        const endY = startY + (Math.random() - 0.5) * 20;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

    canvas.refresh();
}

/**
 * Generate Renaissance library portal (classical architecture)
 */
function generateLibraryPortalTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 128, 144);
    const ctx = canvas.getContext();

    // === BACKGROUND (stone wall) ===
    ctx.fillStyle = '#d4c4a8';
    ctx.fillRect(0, 0, 128, 144);

    // === DOME ROOF ===
    ctx.fillStyle = '#8a6a4a';
    ctx.beginPath();
    ctx.ellipse(64, 20, 50, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dome highlight
    ctx.fillStyle = '#a8886a';
    ctx.beginPath();
    ctx.ellipse(64, 18, 30, 15, 0, 0, Math.PI);
    ctx.fill();

    // Dome top ornament
    ctx.fillStyle = '#d4a832';
    ctx.fillRect(62, 0, 4, 12);
    ctx.beginPath();
    ctx.arc(64, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // === CLASSICAL COLUMNS (Ionic style) ===
    // Left column
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(20, 40, 16, 90);
    // Column fluting (vertical grooves)
    ctx.strokeStyle = '#c8bca8';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(22 + i * 5, 45);
        ctx.lineTo(22 + i * 5, 125);
        ctx.stroke();
    }
    // Capital (top of column)
    ctx.fillStyle = '#f5f0e0';
    ctx.fillRect(16, 38, 24, 8);
    // Base
    ctx.fillRect(16, 128, 24, 6);

    // Right column (mirrored)
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(92, 40, 16, 90);
    ctx.strokeStyle = '#c8bca8';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(94 + i * 5, 45);
        ctx.lineTo(94 + i * 5, 125);
        ctx.stroke();
    }
    ctx.fillStyle = '#f5f0e0';
    ctx.fillRect(88, 38, 24, 8);
    ctx.fillRect(88, 128, 24, 6);

    // === ARCHWAY ===
    ctx.fillStyle = '#4a3a2a';
    ctx.beginPath();
    ctx.arc(64, 100, 28, 0, Math.PI, true);
    ctx.fill();
    ctx.fillRect(36, 100, 56, 44);

    // Archway decorative molding
    ctx.strokeStyle = '#d4a832';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(64, 100, 30, 0, Math.PI, true);
    ctx.stroke();

    // === WOODEN DOUBLE DOORS ===
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(40, 105, 22, 39);
    ctx.fillRect(66, 105, 22, 39);

    // Door panels
    ctx.strokeStyle = '#3a2a0a';
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 108, 18, 15);
    ctx.strokeRect(42, 126, 18, 15);
    ctx.strokeRect(68, 108, 18, 15);
    ctx.strokeRect(68, 126, 18, 15);

    // Door handles (golden)
    ctx.fillStyle = '#d4a832';
    ctx.beginPath();
    ctx.arc(58, 122, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(70, 122, 2, 0, Math.PI * 2);
    ctx.fill();

    // === DECORATIVE FRIEZE above columns ===
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(16, 36, 96, 6);

    // Geometric pattern on frieze
    ctx.fillStyle = '#d4a832';
    for (let i = 0; i < 8; i++) {
        ctx.fillRect(20 + i * 12, 38, 4, 2);
    }

    // === BOOKS visible through archway ===
    // Bookshelves in background
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(44, 85, 18, 12);
    ctx.fillRect(66, 85, 18, 12);

    // Individual books (colorful spines)
    const bookColors = ['#8a2a2a', '#2a4a8a', '#2a6a2a', '#8a6a2a'];
    for (let i = 0; i < 6; i++) {
        ctx.fillStyle = bookColors[i % bookColors.length];
        ctx.fillRect(45 + i * 3, 86, 2, 10);
    }
    for (let i = 0; i < 6; i++) {
        ctx.fillStyle = bookColors[(i + 2) % bookColors.length];
        ctx.fillRect(67 + i * 3, 86, 2, 10);
    }

    // Stone texture details
    for (let i = 0; i < 100; i++) {
        const x = Math.floor(Math.random() * 128);
        const y = Math.floor(Math.random() * 144);
        const size = Math.floor(Math.random() * 2) + 1;
        ctx.fillStyle = `rgba(180, 160, 140, ${Math.random() * 0.2})`;
        ctx.fillRect(x, y, size, size);
    }

    canvas.refresh();
}

/**
 * Generate printing press texture
 */
function generatePrintingPressTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 48, 56);
    const ctx = canvas.getContext();

    // Wooden frame
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(8, 8, 32, 40);

    // Press screw (vertical)
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(22, 0, 4, 20);

    // Screw handle
    ctx.fillStyle = '#4a2a0a';
    ctx.fillRect(12, 8, 24, 4);

    // Press plate (metal)
    ctx.fillStyle = '#6a6a64';
    ctx.fillRect(10, 18, 28, 4);

    // Paper on press bed
    ctx.fillStyle = '#f5f3e8';
    ctx.fillRect(14, 26, 20, 16);

    // Ink on paper (printed text)
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 6; i++) {
        ctx.fillRect(16, 28 + i * 2, 16, 1);
    }

    // Press bed
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(6, 42, 36, 6);

    // Support legs
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(8, 48, 4, 8);
    ctx.fillRect(36, 48, 4, 8);

    canvas.refresh();
}

/**
 * Generate easel with canvas texture
 */
function generateEaselTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 40, 56);
    const ctx = canvas.getContext();

    // Wooden easel frame (tripod)
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 3;

    // Left leg
    ctx.beginPath();
    ctx.moveTo(8, 56);
    ctx.lineTo(15, 12);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(32, 56);
    ctx.lineTo(25, 12);
    ctx.stroke();

    // Back leg (center)
    ctx.beginPath();
    ctx.moveTo(20, 56);
    ctx.lineTo(20, 14);
    ctx.stroke();

    // Canvas on easel (white with painting)
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(10, 12, 20, 24);

    // Simple Renaissance-style portrait on canvas
    // Background (blue sky)
    ctx.fillStyle = '#6a9ac4';
    ctx.fillRect(11, 13, 18, 10);

    // Landscape (green hills)
    ctx.fillStyle = '#4a8a4a';
    ctx.fillRect(11, 20, 18, 6);

    // Figure (person - simple shape)
    ctx.fillStyle = '#d4a88a';
    ctx.beginPath();
    ctx.arc(20, 30, 3, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#8a2a2a';
    ctx.fillRect(17, 32, 6, 4);

    // Canvas frame
    ctx.strokeStyle = '#4a3a2a';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 12, 20, 24);

    canvas.refresh();
}

/**
 * Generate globe/astrolabe texture
 */
function generateGlobeTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 40);
    const ctx = canvas.getContext();

    // Wooden stand
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(14, 32, 4, 8);

    // Stand base
    ctx.fillStyle = '#4a2a0a';
    ctx.beginPath();
    ctx.ellipse(16, 40, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Globe (sphere)
    ctx.fillStyle = '#d4c4a8';
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.fill();

    // Globe continents (simplified)
    ctx.fillStyle = '#6a9a6a';
    ctx.beginPath();
    ctx.arc(12, 14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(20, 18, 4, 0, Math.PI * 2);
    ctx.fill();

    // Meridian ring (metal)
    ctx.strokeStyle = '#8a6a4a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Horizon ring
    ctx.strokeStyle = '#8a6a4a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(16, 16, 12, 4, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Axis rod
    ctx.strokeStyle = '#4a4a44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, 4);
    ctx.lineTo(16, 28);
    ctx.stroke();

    canvas.refresh();
}

/**
 * Generate manuscript/book texture
 */
function generateManuscriptTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 24, 32);
    const ctx = canvas.getContext();

    // Book cover (leather-bound)
    ctx.fillStyle = '#6a3a1a';
    ctx.fillRect(0, 0, 24, 32);

    // Cover decoration (gold)
    ctx.strokeStyle = '#d4a832';
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 2, 20, 28);

    // Decorative cross
    ctx.fillStyle = '#d4a832';
    ctx.fillRect(11, 8, 2, 16);
    ctx.fillRect(6, 15, 12, 2);

    // Pages (visible from side)
    ctx.fillStyle = '#f5f3e8';
    ctx.fillRect(22, 2, 2, 28);

    // Page lines
    ctx.strokeStyle = '#d4c4a8';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(22, 4 + i * 2.5);
        ctx.lineTo(24, 4 + i * 2.5);
        ctx.stroke();
    }

    // Leather texture
    for (let i = 0; i < 30; i++) {
        const x = Math.floor(Math.random() * 20) + 2;
        const y = Math.floor(Math.random() * 28) + 2;
        ctx.fillStyle = `rgba(90, 50, 20, ${Math.random() * 0.2})`;
        ctx.fillRect(x, y, 1, 1);
    }

    canvas.refresh();
}

// ===== INTERACTIVE OBJECT TEXTURES =====

/**
 * Generate wooden sign post with placard
 */
function generateSignPostTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 48);
    const ctx = canvas.getContext();

    // Wooden post
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(14, 16, 4, 32);

    // Placard (hanging sign)
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(6, 12, 20, 16);

    // Placard border
    ctx.strokeStyle = '#4a2a0a';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 12, 20, 16);

    // Wheat icon on placard
    ctx.fillStyle = '#d4a832';
    ctx.fillRect(15, 16, 2, 6);
    ctx.fillRect(13, 16, 2, 4);
    ctx.fillRect(17, 16, 2, 4);

    // Post texture
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = 'rgba(70, 40, 20, 0.2)';
        ctx.fillRect(14, 20 + i * 5, 4, 1);
    }

    canvas.refresh();
}

/**
 * Generate milestone marker stone
 */
function generateMilestoneTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 32);
    const ctx = canvas.getContext();

    // Stone base (gray)
    ctx.fillStyle = '#6a6a64';
    ctx.beginPath();
    ctx.moveTo(16, 8);
    ctx.lineTo(24, 16);
    ctx.lineTo(22, 28);
    ctx.lineTo(10, 28);
    ctx.lineTo(8, 16);
    ctx.closePath();
    ctx.fill();

    // Stone highlights
    ctx.fillStyle = '#8a8a84';
    ctx.fillRect(12, 12, 8, 4);

    // Stone cracks
    ctx.strokeStyle = '#4a4a44';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, 10);
    ctx.lineTo(14, 18);
    ctx.stroke();

    // Roman numeral
    ctx.fillStyle = '#3a3a3a';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('I', 16, 22);

    canvas.refresh();
}

/**
 * Generate hanging banner/flag
 */
function generateBannerTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 24, 40);
    const ctx = canvas.getContext();

    // Pole
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(10, 0, 4, 40);

    // Banner fabric (red)
    ctx.fillStyle = '#8a2a2a';
    ctx.fillRect(14, 4, 10, 24);

    // Banner pattern (golden stripe)
    ctx.fillStyle = '#d4a832';
    ctx.fillRect(14, 12, 10, 4);

    // Banner shadow/fold
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(20, 4, 4, 24);

    canvas.refresh();
}

/**
 * Generate market stall/cart
 */
function generateMarketStallTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 48, 40);
    const ctx = canvas.getContext();

    // Cart bed (brown wood)
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(8, 20, 32, 12);

    // Cart sides
    ctx.fillStyle = '#4a2a0a';
    ctx.fillRect(8, 20, 2, 12);
    ctx.fillRect(38, 20, 2, 12);

    // Canopy (striped)
    ctx.fillStyle = '#6a4a8a';
    ctx.beginPath();
    ctx.moveTo(4, 12);
    ctx.lineTo(24, 4);
    ctx.lineTo(44, 12);
    ctx.lineTo(40, 20);
    ctx.lineTo(8, 20);
    ctx.closePath();
    ctx.fill();

    // Canopy stripes
    ctx.fillStyle = '#f3f4f6';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(12 + i * 8, 12, 4, 8);
    }

    // Wheels
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(14, 34, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(34, 34, 5, 0, Math.PI * 2);
    ctx.fill();

    // Wheel spokes
    ctx.strokeStyle = '#2a1a0a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, 29);
    ctx.lineTo(14, 39);
    ctx.moveTo(9, 34);
    ctx.lineTo(19, 34);
    ctx.stroke();

    canvas.refresh();
}

/**
 * Generate guild sign (hanging shop sign)
 */
function generateGuildSignTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 40);
    const ctx = canvas.getContext();

    // Mounting arm
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(4, 4, 12, 2);
    ctx.fillRect(14, 2, 2, 8);

    // Hanging chain
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, 6);
    ctx.lineTo(8, 12);
    ctx.moveTo(12, 6);
    ctx.lineTo(12, 12);
    ctx.stroke();

    // Sign board (wooden)
    ctx.fillStyle = '#6a3a1a';
    ctx.fillRect(2, 12, 28, 20);

    // Sign border (metal)
    ctx.strokeStyle = '#4a4a44';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 12, 28, 20);

    // Guild symbol (hammer and tongs)
    ctx.fillStyle = '#d4a832';
    ctx.fillRect(14, 16, 4, 12); // Hammer handle
    ctx.fillRect(12, 16, 8, 4); // Hammer head

    ctx.fillRect(22, 18, 2, 8); // Tongs
    ctx.fillRect(20, 18, 6, 2);

    canvas.refresh();
}

/**
 * Generate coat of arms/heraldic shield
 */
function generateCoatOfArmsTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 32, 40);
    const ctx = canvas.getContext();

    // Shield shape (blue)
    ctx.fillStyle = '#2a4a8a';
    ctx.beginPath();
    ctx.moveTo(16, 4);
    ctx.lineTo(28, 8);
    ctx.lineTo(28, 24);
    ctx.lineTo(16, 36);
    ctx.lineTo(4, 24);
    ctx.lineTo(4, 8);
    ctx.closePath();
    ctx.fill();

    // Shield border (gold)
    ctx.strokeStyle = '#d4a832';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, 4);
    ctx.lineTo(28, 8);
    ctx.lineTo(28, 24);
    ctx.lineTo(16, 36);
    ctx.lineTo(4, 24);
    ctx.lineTo(4, 8);
    ctx.closePath();
    ctx.stroke();

    // Heraldic cross (gold)
    ctx.fillStyle = '#d4a832';
    ctx.fillRect(14, 12, 4, 16);
    ctx.fillRect(10, 18, 12, 4);

    // Crown at top
    ctx.fillStyle = '#d4a832';
    ctx.fillRect(12, 10, 8, 3);
    ctx.fillRect(13, 7, 2, 3);
    ctx.fillRect(17, 7, 2, 3);

    canvas.refresh();
}

/**
 * Generate telescope on stand
 */
function generateTelescopeTexture(scene, key) {
    const canvas = scene.textures.createCanvas(key, 48, 56);
    const ctx = canvas.getContext();

    // Tripod legs (wooden)
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, 56);
    ctx.lineTo(20, 28);
    ctx.moveTo(38, 56);
    ctx.lineTo(28, 28);
    ctx.moveTo(24, 56);
    ctx.lineTo(24, 28);
    ctx.stroke();

    // Center mount
    ctx.fillStyle = '#4a4a44';
    ctx.fillRect(22, 24, 4, 8);

    // Telescope tube (brass)
    ctx.fillStyle = '#8a6a4a';
    ctx.save();
    ctx.translate(24, 24);
    ctx.rotate(-Math.PI / 6); // Angle upward
    ctx.fillRect(-3, -20, 6, 24);

    // Telescope lens end (darker)
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(-4, -22, 8, 3);

    // Lens (glass)
    ctx.fillStyle = '#a8c8d8';
    ctx.fillRect(-2, -21, 4, 1);

    ctx.restore();

    // Brass bands on telescope
    ctx.fillStyle = '#d4a832';
    ctx.save();
    ctx.translate(24, 24);
    ctx.rotate(-Math.PI / 6);
    ctx.fillRect(-3, -12, 6, 1);
    ctx.fillRect(-3, -4, 6, 1);
    ctx.restore();

    canvas.refresh();
}

/**
 * Generate small walking character sprite for timeline
 */
function generateWalkingSpriteTexture(scene, key) {
    const frameWidth = 16;
    const frameHeight = 16;
    const canvas = scene.textures.createCanvas(key, frameWidth * 4, frameHeight);
    const ctx = canvas.getContext();

    // Simple stick figure walking animation (4 frames)
    for (let frame = 0; frame < 4; frame++) {
        const offsetX = frame * frameWidth;
        const centerX = offsetX + 8;
        const baseY = 14;

        // Head
        ctx.fillStyle = '#d4a88a';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 10, 2, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.strokeStyle = '#5C9EAD';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, baseY - 8);
        ctx.lineTo(centerX, baseY - 2);
        ctx.stroke();

        // Legs (alternating for walking animation)
        if (frame % 2 === 0) {
            // Left leg forward
            ctx.beginPath();
            ctx.moveTo(centerX, baseY - 2);
            ctx.lineTo(centerX - 2, baseY + 2);
            ctx.stroke();
            // Right leg back
            ctx.beginPath();
            ctx.moveTo(centerX, baseY - 2);
            ctx.lineTo(centerX + 2, baseY);
            ctx.stroke();
        } else {
            // Right leg forward
            ctx.beginPath();
            ctx.moveTo(centerX, baseY - 2);
            ctx.lineTo(centerX + 2, baseY + 2);
            ctx.stroke();
            // Left leg back
            ctx.beginPath();
            ctx.moveTo(centerX, baseY - 2);
            ctx.lineTo(centerX - 2, baseY);
            ctx.stroke();
        }

        // Arms (alternating opposite to legs)
        ctx.lineWidth = 1;
        if (frame % 2 === 0) {
            // Left arm back
            ctx.beginPath();
            ctx.moveTo(centerX, baseY - 6);
            ctx.lineTo(centerX - 2, baseY - 4);
            ctx.stroke();
            // Right arm forward
            ctx.beginPath();
            ctx.moveTo(centerX, baseY - 6);
            ctx.lineTo(centerX + 2, baseY - 8);
            ctx.stroke();
        } else {
            // Right arm back
            ctx.beginPath();
            ctx.moveTo(centerX, baseY - 6);
            ctx.lineTo(centerX + 2, baseY - 4);
            ctx.stroke();
            // Left arm forward
            ctx.beginPath();
            ctx.moveTo(centerX, baseY - 6);
            ctx.lineTo(centerX - 2, baseY - 8);
            ctx.stroke();
        }
    }

    canvas.refresh();
}

/**
 * Generate Renaissance NPC sprite sheet (artists, scholars, inventors)
 */
function generateRenaissanceNPCTexture(scene, key, activity) {
    const frameWidth = 32;
    const frameHeight = 48;
    const canvas = scene.textures.createCanvas(key, frameWidth * 4, frameHeight);
    const ctx = canvas.getContext();

    const skin = '#d4a88a';
    const hairColors = {
        'artist': '#4a3a2a',
        'scholar': '#6a6a6a',
        'inventor': '#8a6a4a'
    };
    const clothingColors = {
        'artist': '#6a4a8a', // Purple (artist's smock)
        'scholar': '#2a2a4a', // Dark blue (scholar's robe)
        'inventor': '#6a5a3a' // Brown (inventor's tunic)
    };

    const hair = hairColors[activity] || '#4a3a2a';
    const clothing = clothingColors[activity] || '#6a4a8a';

    // Helper function to draw basic Renaissance person body
    function drawRenaissanceBody(offsetX, offsetY) {
        const centerX = offsetX + frameWidth / 2;
        const baseY = offsetY + frameHeight - 8;

        // Head
        ctx.fillStyle = skin;
        ctx.fillRect(centerX - 4, baseY - 32, 8, 8);

        // Hair (Renaissance style - shoulder length)
        ctx.fillStyle = hair;
        ctx.fillRect(centerX - 5, baseY - 34, 10, 4); // Top
        ctx.fillRect(centerX - 5, baseY - 30, 2, 6); // Left side
        ctx.fillRect(centerX + 3, baseY - 30, 2, 6); // Right side

        // Body (Renaissance tunic/robe)
        ctx.fillStyle = clothing;
        ctx.fillRect(centerX - 6, baseY - 24, 12, 16); // Torso

        // Legs (pants/leggings)
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(centerX - 5, baseY - 8, 4, 8); // Left leg
        ctx.fillRect(centerX + 1, baseY - 8, 4, 8); // Right leg

        // Shoes
        ctx.fillStyle = '#2a1a0a';
        ctx.fillRect(centerX - 5, baseY, 4, 2);
        ctx.fillRect(centerX + 1, baseY, 4, 2);

        // Belt/sash
        ctx.fillStyle = '#8a6a4a';
        ctx.fillRect(centerX - 6, baseY - 12, 12, 2);

        return { centerX, baseY };
    }

    if (activity === 'artist') {
        // Artist painting (holding brush, moving arm)
        // Frame 0: Arm extended to canvas
        const pos0 = drawRenaissanceBody(0, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos0.centerX - 10, pos0.baseY - 20, 3, 10); // Left arm extended
        ctx.fillRect(pos0.centerX + 7, pos0.baseY - 22, 3, 8); // Right arm holding palette

        // Frame 1: Arm pulling back
        const pos1 = drawRenaissanceBody(frameWidth, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos1.centerX - 9, pos1.baseY - 22, 3, 10);
        ctx.fillRect(pos1.centerX + 7, pos1.baseY - 22, 3, 8);

        // Frame 2: Arm at center
        const pos2 = drawRenaissanceBody(frameWidth * 2, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos2.centerX - 8, pos2.baseY - 22, 3, 10);
        ctx.fillRect(pos2.centerX + 7, pos2.baseY - 22, 3, 8);

        // Frame 3: Arm extending again
        const pos3 = drawRenaissanceBody(frameWidth * 3, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos3.centerX - 9, pos3.baseY - 21, 3, 10);
        ctx.fillRect(pos3.centerX + 7, pos3.baseY - 22, 3, 8);

    } else if (activity === 'scholar') {
        // Scholar reading/writing (holding quill and book)
        for (let i = 0; i < 4; i++) {
            const pos = drawRenaissanceBody(frameWidth * i, 0);
            ctx.fillStyle = skin;

            // Left arm holding book
            ctx.fillRect(pos.centerX - 10, pos.baseY - 20, 3, 8);

            // Right arm with quill (slight movement for writing)
            const armOffset = (i % 2 === 0) ? 0 : 2;
            ctx.fillRect(pos.centerX + 7, pos.baseY - 22 + armOffset, 3, 10);

            // Book in hand (small rectangle)
            ctx.fillStyle = '#8a3a1a';
            ctx.fillRect(pos.centerX - 14, pos.baseY - 22, 6, 8);
        }

    } else if (activity === 'inventor') {
        // Inventor tinkering with tools (hammering/adjusting)
        // Frame 0: Arm raised with tool
        const pos0 = drawRenaissanceBody(0, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos0.centerX - 10, pos0.baseY - 28, 3, 10);
        ctx.fillRect(pos0.centerX + 7, pos0.baseY - 22, 3, 8);

        // Frame 1: Arm down (working)
        const pos1 = drawRenaissanceBody(frameWidth, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos1.centerX - 10, pos1.baseY - 18, 3, 10);
        ctx.fillRect(pos1.centerX + 7, pos1.baseY - 22, 3, 8);

        // Frame 2: Arm raised again
        const pos2 = drawRenaissanceBody(frameWidth * 2, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos2.centerX - 10, pos2.baseY - 28, 3, 10);
        ctx.fillRect(pos2.centerX + 7, pos2.baseY - 22, 3, 8);

        // Frame 3: Arm at middle position
        const pos3 = drawRenaissanceBody(frameWidth * 3, 0);
        ctx.fillStyle = skin;
        ctx.fillRect(pos3.centerX - 10, pos3.baseY - 23, 3, 10);
        ctx.fillRect(pos3.centerX + 7, pos3.baseY - 22, 3, 8);
    }

    canvas.refresh();
}

// ===== INFO PANEL SYSTEM =====

/**
 * Educational Info Panel that displays fun facts
 */
class InfoPanel {
    constructor(scene) {
        this.scene = scene;
        this.isVisible = false;
        this.currentInfo = null;

        // Create panel container
        this.panel = scene.add.container(400, 150).setDepth(200).setVisible(false);

        // Semi-transparent background
        this.background = scene.add.rectangle(0, 0, 500, 220, 0x000000, 0.9);
        this.background.setStrokeStyle(3, 0x5C9EAD);

        // Title text
        this.titleText = scene.add.text(0, -90, '', {
            fontSize: '18px',
            fill: '#5C9EAD',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 460 }
        }).setOrigin(0.5);

        // Icon text (emoji)
        this.iconText = scene.add.text(-220, -90, '', {
            fontSize: '24px'
        });

        // Content text
        this.contentText = scene.add.text(0, -20, '', {
            fontSize: '14px',
            fill: '#f3f4f6',
            align: 'center',
            lineSpacing: 8,
            wordWrap: { width: 460 }
        }).setOrigin(0.5);

        // Close instruction
        this.closeText = scene.add.text(0, 95, 'Press E to close', {
            fontSize: '12px',
            fill: '#9ca3af',
            align: 'center'
        }).setOrigin(0.5);

        // Add all elements to container
        this.panel.add([this.background, this.iconText, this.titleText, this.contentText, this.closeText]);
    }

    show(title, content, icon = '📚') {
        this.titleText.setText(title);
        this.contentText.setText(content);
        this.iconText.setText(icon);
        this.panel.setVisible(true);
        this.isVisible = true;
    }

    hide() {
        this.panel.setVisible(false);
        this.isVisible = false;
        this.currentInfo = null;
    }

    toggle(info) {
        if (this.isVisible && this.currentInfo === info) {
            this.hide();
        } else {
            this.show(info.title, info.content, info.icon);
            this.currentInfo = info;
        }
    }
}

/**
 * Timeline Bar - Persistent UI showing progress through eras
 */
class TimelineBar {
    constructor(scene, currentEra) {
        this.scene = scene;
        this.currentEra = currentEra; // 'caveman', 'farming', 'medieval', 'renaissance'

        // Era data
        this.eras = [
            { key: 'caveman', label: 'CAVEMAN', x: 150 },
            { key: 'farming', label: 'FARMING', x: 300 },
            { key: 'medieval', label: 'MEDIEVAL', x: 500 },
            { key: 'renaissance', label: 'RENAISSANCE', x: 650 }
        ];

        this.barY = 530;
        this.container = scene.add.container(0, 0).setDepth(150);

        this.createTimeline();
        this.createWalkingSprite();
    }

    createTimeline() {
        // Draw horizontal timeline bar
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(3, 0x5C9EAD);
        graphics.beginPath();
        graphics.moveTo(150, this.barY);
        graphics.lineTo(650, this.barY);
        graphics.strokePath();
        this.container.add(graphics);

        // Draw era milestones
        this.eras.forEach((era, index) => {
            // Milestone dot
            const dot = this.scene.add.circle(era.x, this.barY, 6, 0x5C9EAD);
            this.container.add(dot);

            // Era label
            const label = this.scene.add.text(era.x, this.barY + 15, era.label, {
                fontSize: '10px',
                fill: '#9ca3af',
                align: 'center'
            }).setOrigin(0.5);
            this.container.add(label);

            // Highlight current era
            if (era.key === this.currentEra) {
                dot.setFillStyle(0xd4a832);
                label.setStyle({ fill: '#5C9EAD', fontStyle: 'bold' });
            }
        });
    }

    createWalkingSprite() {
        // Find current era index
        const eraIndex = this.eras.findIndex(e => e.key === this.currentEra);
        const targetX = this.eras[eraIndex].x;

        // Create walking sprite at current era position
        this.walkingSprite = this.scene.add.sprite(targetX, this.barY - 20, 'walking-sprite');
        this.walkingSprite.setDepth(151);
        this.container.add(this.walkingSprite);

        // Create walking animation if it doesn't exist
        if (!this.scene.anims.exists('timeline-walk')) {
            this.scene.anims.create({
                key: 'timeline-walk',
                frames: this.scene.anims.generateFrameNumbers('walking-sprite', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Play walking animation
        this.walkingSprite.play('timeline-walk');
    }

    moveToNextEra(nextEraKey) {
        const nextEra = this.eras.find(e => e.key === nextEraKey);
        if (!nextEra) return;

        // Animate sprite walking to next position
        this.scene.tweens.add({
            targets: this.walkingSprite,
            x: nextEra.x,
            duration: 1000,
            ease: 'Linear'
        });
    }

    destroy() {
        this.container.destroy();
    }
}

/**
 * Create an interactable object with 'E' prompt
 */
function createInteractable(scene, x, y, width, height, info) {
    const interactable = scene.add.zone(x, y, width, height);
    scene.physics.world.enable(interactable);
    interactable.body.setImmovable(true);
    interactable.infoData = info;

    // Create 'E' indicator
    const indicator = scene.add.text(x, y - height/2 - 20, 'E', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#5C9EAD',
        padding: { x: 6, y: 4 }
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    interactable.indicator = indicator;

    return interactable;
}

// ===== CAVEMAN SCENE =====

class CavemanScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CavemanScene' });
    }

    create() {
        // Generate all textures procedurally
        generateDirtTexture(this, 'dirt');
        generateStoneTexture(this, 'stone');
        generateCaveWallTexture(this, 'cave-wall');
        generateCharacterSprite(this, 'player-char');

        // Generate multiple NPC variants
        const npcVariants = [
            { skin: '#c49a6c', fur: '#7a6348', furDark: '#5a4838', hair: '#4a3a2a' },
            { skin: '#d4a574', fur: '#9a826d', furDark: '#7a6348', hair: '#3d2817' },
            { skin: '#b8956a', fur: '#6b5642', furDark: '#4a3a2a', hair: '#2a1a0a' },
            { skin: '#c9a876', fur: '#8b7355', furDark: '#6b5642', hair: '#594a3a' }
        ];

        generateNPCSprite(this, 'npc-char-1', 0);
        generateWorkFrames(this, 'npc-work-1', npcVariants[0], 'fire');

        generateNPCSprite(this, 'npc-char-2', 1);
        generateWorkFrames(this, 'npc-work-2', npcVariants[1], 'spear');

        generateNPCSprite(this, 'npc-char-3', 2);
        generateWorkFrames(this, 'npc-work-3', npcVariants[2], 'crafting');

        generateNPCSprite(this, 'npc-char-4', 3);

        generateCaveTexture(this, 'cave');
        generateFireParticles(this);

        // Generate props
        generateWoodLogs(this, 'wood-logs');
        generateSpear(this, 'spear');
        generateStoneTool(this, 'stone-hammerstone', 'hammerstone');
        generateStoneTool(this, 'stone-scraper', 'scraper');
        generateStoneTool(this, 'stone-flake', 'flake');
        generateStick(this, 'fire-stick');

        // Generate walking sprite for timeline
        generateWalkingSpriteTexture(this, 'walking-sprite');

        // Add frames for walking sprite (4 frames of 16x16 pixels)
        for (let i = 0; i < 4; i++) {
            this.textures.get('walking-sprite').add(i, 0, i * 16, 0, 16, 16);
        }

        // Add sprite sheet frame configs
        // Add frames for player character sprite sheet
        for (let i = 0; i < 12; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            this.textures.get('player-char').add(i, 0, col * 32, row * 48, 32, 48);
        }

        // Add frames for all NPC character sprite sheets
        for (let npcNum = 1; npcNum <= 4; npcNum++) {
            const key = `npc-char-${npcNum}`;
            for (let i = 0; i < 12; i++) {
                const col = i % 3;
                const row = Math.floor(i / 3);
                this.textures.get(key).add(i, 0, col * 32, row * 48, 32, 48);
            }
        }

        // Add frames for work animation sprite sheets
        for (let npcNum = 1; npcNum <= 3; npcNum++) {
            const key = `npc-work-${npcNum}`;
            const numFrames = npcNum === 1 ? 3 : 4; // Fire has 3, spear and crafting have 4
            for (let i = 0; i < numFrames; i++) {
                this.textures.get(key).add(i, 0, i * 32, 0, 32, 48);
            }
        }

        // World bounds
        this.physics.world.setBounds(0, 0, 800, 600);

        // Create tile-based ground
        this.createGround();

        // Create cave walls
        this.createCaveWalls();

        // Create cave entrance (portal to next era)
        this.createCaveEntrance();

        // Create enhanced fire
        this.createFire();

        // Create player with animations
        this.createPlayer();

        // Create NPC
        this.createNPC();

        // Set up camera
        this.cameras.main.setBounds(0, 0, 800, 600);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.eKey = this.input.keyboard.addKey('E');

        // Create info panel system
        this.infoPanel = new InfoPanel(this);
        this.interactables = [];
        this.createInteractables();

        // Create timeline bar
        this.timelineBar = new TimelineBar(this, 'caveman');

        // Interaction text (moved down to accommodate timeline)
        this.interactionText = this.add.text(400, 560, '', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        // Era title card
        this.showEraTitleCard('CAVEMAN ERA', '2.5 Million BCE');

        // Track last direction
        this.lastDirection = 'down';
    }

    createInteractables() {
        // Spear sharpener NPC interactable
        const spearInfo = {
            title: 'Stone Tools',
            content: 'Early humans spent hours crafting hand axes and spears from flint. A well-made stone blade could last for years and was often traded between tribes.',
            icon: '🔧'
        };
        const spearZone = createInteractable(this, 180, 450, 60, 60, spearInfo);
        this.interactables.push(spearZone);

        // Fire tender NPC interactable
        const fireTenderInfo = {
            title: 'Fire Keepers',
            content: 'Controlling fire (~1.5 million years ago) was humanity\'s first major technological breakthrough. In prehistoric communities, keeping the fire alive was a sacred duty. Losing your fire meant starting over, which was difficult and dangerous.',
            icon: '🔥'
        };
        const fireTenderZone = createInteractable(this, 380, 110, 60, 60, fireTenderInfo);
        this.interactables.push(fireTenderZone);

        // Stone crafter NPC interactable
        const crafterInfo = {
            title: 'Tool Innovation',
            content: 'The stone hand axe was used for over 1 million years - making it the longest-used tool in human history!',
            icon: '📈'
        };
        const crafterZone = createInteractable(this, 620, 480, 60, 60, crafterInfo);
        this.interactables.push(crafterZone);
    }

    showEraTitleCard(title, subtitle) {
        // Title card background
        const titleCard = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setDepth(300);

        // Main title
        const titleText = this.add.text(400, 280, title, {
            fontSize: '48px',
            fill: '#5C9EAD',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(301);

        // Subtitle
        const subtitleText = this.add.text(400, 340, subtitle, {
            fontSize: '24px',
            fill: '#f3f4f6',
            align: 'center'
        }).setOrigin(0.5).setDepth(301);

        // Fade out after 3 seconds
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: [titleCard, titleText, subtitleText],
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    titleCard.destroy();
                    titleText.destroy();
                    subtitleText.destroy();
                }
            });
        });
    }

    createGround() {
        const tileSize = 32;
        const cols = 25;
        const rows = 19;

        // Create more organic pattern
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                // Use pseudo-random for natural variation
                const rand = (x * 7 + y * 13) % 100;
                const texture = rand > 75 ? 'stone' : 'dirt';
                this.add.image(x * tileSize + 16, y * tileSize + 16, texture);
            }
        }
    }

    createCaveWalls() {
        // Add cave walls around the cave entrance
        const wallPositions = [
            { x: 320, y: 48 }, { x: 352, y: 48 }, { x: 384, y: 48 },
            { x: 416, y: 48 }, { x: 448, y: 48 }, { x: 480, y: 48 }
        ];

        wallPositions.forEach(pos => {
            this.add.image(pos.x, pos.y, 'cave-wall');
        });
    }

    createCaveEntrance() {
        const caveX = 400;
        const caveY = 80;

        // Cave sprite
        this.cave = this.physics.add.sprite(caveX, caveY, 'cave');
        this.cave.setImmovable(true);

        // Add sign above cave
        this.add.text(caveX, caveY - 50, '⬆ CAVE\nNext Era', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 8, y: 4 },
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
    }

    createFire() {
        const fireX = 350;
        const fireY = 100;

        // Wood logs underneath fire
        this.add.image(fireX, fireY + 8, 'wood-logs').setDepth(1);

        // Red/hot coals at base (on top of logs)
        this.add.particles(fireX, fireY + 5, 'fire-red', {
            speed: { min: 10, max: 20 },
            angle: { min: 260, max: 280 },
            scale: { start: 0.8, end: 0.3 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 800,
            frequency: 80,
            gravityY: -30,
            blendMode: 'ADD'
        });

        // Orange flames (main fire)
        this.fireOrange = this.add.particles(fireX, fireY, 'fire-orange', {
            speed: { min: 25, max: 45 },
            angle: { min: 250, max: 290 },
            scale: { start: 1.2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            frequency: 40,
            gravityY: -60,
            blendMode: 'ADD'
        });

        // Yellow tips
        this.add.particles(fireX, fireY - 10, 'fire-yellow', {
            speed: { min: 30, max: 50 },
            angle: { min: 250, max: 290 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 600,
            frequency: 60,
            gravityY: -70,
            blendMode: 'ADD'
        });

        // Smoke
        this.add.particles(fireX, fireY - 20, 'fire-smoke', {
            speed: { min: 10, max: 20 },
            angle: { min: 260, max: 280 },
            scale: { start: 0.5, end: 1.5 },
            alpha: { start: 0.3, end: 0 },
            lifespan: 2000,
            frequency: 200,
            gravityY: -20
        });

        // Flickering animation
        this.time.addEvent({
            delay: 100,
            callback: () => {
                const intensity = Math.random() * 0.3 + 0.6;
                this.fireOrange.setAlpha({ start: intensity, end: 0 });
            },
            loop: true
        });
    }

    createPlayer() {
        // Create player sprite
        this.player = this.physics.add.sprite(400, 400, 'player-char');
        this.player.setCollideWorldBounds(true);
        this.player.setSize(24, 40);
        this.player.setOffset(4, 8);
        this.player.setDepth(50);

        // Create animations for each direction
        this.anims.create({
            key: 'walk-down',
            frames: [
                { key: 'player-char', frame: 0 },
                { key: 'player-char', frame: 1 },
                { key: 'player-char', frame: 2 }
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('player-char', { start: 3, end: 5 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player-char', { start: 6, end: 8 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('player-char', { start: 9, end: 11 }),
            frameRate: 8,
            repeat: -1
        });

        // Enable collision with cave
        this.physics.add.overlap(this.player, this.cave, this.handleCaveInteraction, null, this);

        // Player properties
        this.playerSpeed = 140;
        this.nearCave = false;
    }

    createNPC() {
        this.npcs = [];
        this.npcProps = []; // Track props that move with NPCs

        // NPC 1: Tending the fire (near fire)
        const npc1 = this.add.sprite(380, 110, 'npc-work-1');
        npc1.setDepth(50);
        npc1.activity = 'fire';
        npc1.workFrame = 0;
        this.npcs.push(npc1);

        // Fire stick prop (follows NPC 1's hand)
        const fireStick = this.add.image(390, 120, 'fire-stick').setDepth(49);
        npc1.prop = fireStick;

        // Animate NPC 1: Fire tending cycle
        this.time.addEvent({
            delay: 600,
            callback: () => {
                npc1.workFrame = (npc1.workFrame + 1) % 3;
                npc1.setFrame(npc1.workFrame);

                // Move stick with hand position
                if (npc1.workFrame === 0) {
                    fireStick.setPosition(390, 120); // At side
                } else if (npc1.workFrame === 1) {
                    fireStick.setPosition(392, 130); // Reaching down
                } else if (npc1.workFrame === 2) {
                    fireStick.setPosition(393, 135); // Poking fire
                }
            },
            loop: true
        });

        // NPC 2: Sharpening spear (bottom left)
        const npc2 = this.add.sprite(180, 450, 'npc-work-2');
        npc2.setDepth(50);
        npc2.activity = 'spear';
        npc2.workFrame = 0;
        this.npcs.push(npc2);

        // Spear prop (in NPC 2's hands)
        const spear = this.add.image(180, 445, 'spear').setDepth(49);
        spear.setAngle(90); // Horizontal
        npc2.prop = spear;

        // Sharpening stone on ground
        this.add.image(170, 465, 'stone-scraper').setDepth(48);

        // Animate NPC 2: Spear sharpening cycle
        this.time.addEvent({
            delay: 500,
            callback: () => {
                npc2.workFrame = (npc2.workFrame + 1) % 4;
                npc2.setFrame(npc2.workFrame);

                // Move spear with sharpening motion
                if (npc2.workFrame === 0) {
                    spear.setPosition(180, 445);
                    spear.setAngle(90);
                } else if (npc2.workFrame === 1) {
                    spear.setPosition(180, 450); // Scraping down
                    spear.setAngle(85);
                } else if (npc2.workFrame === 2) {
                    spear.setPosition(180, 448); // Mid scrape
                    spear.setAngle(88);
                } else if (npc2.workFrame === 3) {
                    spear.setPosition(180, 443); // Up
                    spear.setAngle(92);
                }
            },
            loop: true
        });

        // NPC 3: Crafting with stones (bottom right)
        const npc3 = this.add.sprite(620, 480, 'npc-work-3');
        npc3.setDepth(50);
        npc3.activity = 'crafting';
        npc3.workFrame = 0;
        this.npcs.push(npc3);

        // Stone tools workspace
        const groundStone = this.add.image(620, 495, 'stone-hammerstone').setDepth(48);
        this.add.image(600, 490, 'stone-flake').setDepth(48);
        this.add.image(635, 490, 'stone-scraper').setDepth(48);

        // Held stone (follows hands)
        const heldStone = this.add.image(620, 465, 'stone-hammerstone').setDepth(51);
        npc3.prop = heldStone;

        // Particle emitter for stone impacts
        const impactParticles = this.add.particles(620, 495, 'fire-yellow', {
            speed: { min: 20, max: 40 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 300,
            frequency: -1, // Manual emission
            gravityY: 100
        });

        // Animate NPC 3: Stone crafting cycle
        this.time.addEvent({
            delay: 400,
            callback: () => {
                npc3.workFrame = (npc3.workFrame + 1) % 4;
                npc3.setFrame(npc3.workFrame);

                // Move held stone with arms
                if (npc3.workFrame === 0) {
                    heldStone.setPosition(620, 460); // Raised overhead
                } else if (npc3.workFrame === 1) {
                    heldStone.setPosition(620, 475); // Mid-swing
                } else if (npc3.workFrame === 2) {
                    heldStone.setPosition(620, 490); // Impact!
                    // Emit impact particles
                    impactParticles.emitParticle(5);
                } else if (npc3.workFrame === 3) {
                    heldStone.setPosition(620, 470); // Rising
                }
            },
            loop: true
        });

        // NPC 4: Walking patrol (gathering)
        const npc4 = this.physics.add.sprite(500, 300, 'npc-char-4');
        npc4.setDepth(50);
        npc4.activity = 'patrol';
        npc4.patrolMinX = 450;
        npc4.patrolMaxX = 700;
        npc4.patrolDirection = 1;
        this.npcs.push(npc4);

        // Create animations for patrolling NPC
        this.anims.create({
            key: 'npc4-walk-left',
            frames: this.anims.generateFrameNumbers('npc-char-4', { start: 3, end: 5 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'npc4-walk-right',
            frames: this.anims.generateFrameNumbers('npc-char-4', { start: 6, end: 8 }),
            frameRate: 5,
            repeat: -1
        });

        npc4.play('npc4-walk-right');
    }

    handleCaveInteraction() {
        this.nearCave = true;
    }

    update() {
        this.nearCave = false;

        // Check for nearby interactables
        let nearInteractable = null;
        for (let interactable of this.interactables) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                interactable.x, interactable.y
            );

            if (dist < 80) {
                nearInteractable = interactable;
                interactable.indicator.setVisible(true);
            } else {
                interactable.indicator.setVisible(false);
            }
        }

        // Handle E key press for interactables
        if (Phaser.Input.Keyboard.JustDown(this.eKey) && nearInteractable) {
            this.infoPanel.toggle(nearInteractable.infoData);
        }

        // Check distance to cave
        const distToCave = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.cave.x, this.cave.y
        );

        if (distToCave < 80) {
            this.nearCave = true;
            this.interactionText.setText('Press SPACE to enter cave and travel forward in time!');
            this.interactionText.setVisible(true);

            // Check for space key
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.enterNextEra();
            }
        } else if (!nearInteractable) {
            this.interactionText.setVisible(false);
        }

        // Player movement with animation
        this.player.setVelocity(0);
        let moving = false;
        let newDirection = this.lastDirection;

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
                this.player.play(`walk-${newDirection}`);
                this.lastDirection = newDirection;
            }
        } else {
            this.player.stop();
            // Show idle frame for current direction
            const frameMap = { down: 0, left: 3, right: 6, up: 9 };
            this.player.setFrame(frameMap[this.lastDirection]);
        }

        // Update NPC
        this.updateNPC();
    }

    updateNPC() {
        // Only update the patrolling NPC (NPC 4) - others are animated by timers
        const patrolNPC = this.npcs.find(npc => npc.activity === 'patrol');
        if (patrolNPC) {
            const speed = 50;
            if (patrolNPC.patrolDirection === 1) {
                patrolNPC.setVelocityX(speed);
                if (patrolNPC.x > patrolNPC.patrolMaxX) {
                    patrolNPC.patrolDirection = -1;
                    patrolNPC.play('npc4-walk-left');
                }
            } else {
                patrolNPC.setVelocityX(-speed);
                if (patrolNPC.x < patrolNPC.patrolMinX) {
                    patrolNPC.patrolDirection = 1;
                    patrolNPC.play('npc4-walk-right');
                }
            }
        }
    }

    enterNextEra() {
        // Hide interaction text
        this.interactionText.setVisible(false);

        // Fade camera to black over 1 second
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        // After fade completes, transition directly to Farming Scene
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('FarmingScene');
        });
    }
}

// ===== FARMING SCENE =====

class FarmingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FarmingScene' });
    }

    create(data) {
        // Generate farming era textures
        generateGrassTexture(this, 'grass');
        generateFarmlandTexture(this, 'farmland');
        generateWheatTexture(this, 'wheat');
        generateBarnTexture(this, 'barn');

        // Generate farming tools
        generateHoe(this, 'hoe');
        generateSickle(this, 'sickle');

        // Generate farmer NPCs with different colors
        const farmerVariants = [
            { skin: '#c49a6c', shirt: '#8b7355', shirtDark: '#6b5642', pants: '#5a4a3a', hair: '#4a3a2a' },
            { skin: '#d4a574', shirt: '#9a826d', shirtDark: '#7a6348', pants: '#4a3a2a', hair: '#3d2817' },
            { skin: '#b8956a', shirt: '#7a6348', shirtDark: '#5a4838', pants: '#3a2a1a', hair: '#2a1a0a' }
        ];

        generateFarmingWorkFrames(this, 'farmer-work-1', farmerVariants[0], 'planting');
        generateFarmingWorkFrames(this, 'farmer-work-2', farmerVariants[1], 'harvesting');
        generateFarmingWorkFrames(this, 'farmer-work-3', farmerVariants[2], 'tilling');

        // Reuse player character from caveman era
        if (!this.textures.exists('player-char')) {
            generateCharacterSprite(this, 'player-char');
        }

        // Generate interactive object sprites
        generateSignPostTexture(this, 'sign-post');

        // Generate walking sprite for timeline (shared across scenes)
        if (!this.textures.exists('walking-sprite')) {
            generateWalkingSpriteTexture(this, 'walking-sprite');
            // Add frames for walking sprite (4 frames of 16x16 pixels)
            for (let i = 0; i < 4; i++) {
                this.textures.get('walking-sprite').add(i, 0, i * 16, 0, 16, 16);
            }
        }

        // Get spawn position from previous scene (or default)
        const spawnX = data?.spawnX || 400;
        const spawnY = data?.spawnY || 500;

        // Fade in effect when entering scene
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Add frame configs for work animations
        for (let i = 1; i <= 3; i++) {
            const key = `farmer-work-${i}`;
            const numFrames = 4;
            for (let f = 0; f < numFrames; f++) {
                this.textures.get(key).add(f, 0, f * 32, 0, 32, 48);
            }
        }

        // Add frame configs for player (if not already added)
        if (!this.anims.exists('walk-down')) {
            for (let i = 0; i < 12; i++) {
                const col = i % 3;
                const row = Math.floor(i / 3);
                this.textures.get('player-char').add(i, 0, col * 32, row * 48, 32, 48);
            }
        }

        // World bounds
        this.physics.world.setBounds(0, 0, 800, 600);

        // Create scene elements
        this.createGround();
        this.createWheatField();
        this.createBarnPortal();

        // Add sign post for wheat field interactable
        this.add.image(150, 300, 'sign-post').setDepth(10);

        this.createFarmers();
        this.createPlayer(spawnX, spawnY);

        // Camera setup
        this.cameras.main.setBounds(0, 0, 800, 600);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.eKey = this.input.keyboard.addKey('E');

        // Create info panel system
        this.infoPanel = new InfoPanel(this);
        this.interactables = [];
        this.createInteractables();

        // Create timeline bar
        this.timelineBar = new TimelineBar(this, 'farming');

        // Interaction text (moved down to accommodate timeline)
        this.interactionText = this.add.text(400, 560, '', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        // Era title card
        this.showEraTitleCard('FARMING ERA', '10,000 BCE');

        // Track player direction
        this.lastDirection = 'down';
        this.playerSpeed = 140;
    }

    createInteractables() {
        // Wheat field interactable
        const wheatInfo = {
            title: 'Agricultural Revolution',
            content: 'The shift from hunting-gathering to farming (~10,000 BCE) was humanity\'s most important transition. It allowed permanent settlements, population growth, and the birth of civilization.',
            icon: '🌾'
        };
        const wheatZone = createInteractable(this, 150, 300, 120, 100, wheatInfo);
        this.interactables.push(wheatZone);

        // Planter NPC interactable
        const planterInfo = {
            title: 'Early Farming',
            content: 'The first farmers planted wild seeds they had collected. Over generations, they selectively saved seeds from the best plants, slowly domesticating crops like wheat and barley.',
            icon: '🔧'
        };
        const planterZone = createInteractable(this, 300, 450, 60, 60, planterInfo);
        this.interactables.push(planterZone);

        // Harvester NPC interactable
        const harvesterInfo = {
            title: 'Harvest Season',
            content: 'In agricultural societies, the harvest was the most critical time of year. A failed harvest meant famine, so entire communities worked together to bring in crops.',
            icon: '🏛️'
        };
        const harvesterZone = createInteractable(this, 200, 300, 60, 60, harvesterInfo);
        this.interactables.push(harvesterZone);

        // Tiller NPC interactable
        const tillerInfo = {
            title: 'Timeline: Neolithic Revolution',
            content: 'Agriculture began in the Fertile Crescent around 10,000 BCE and spread to Europe by 7,000 BCE. This "Neolithic Revolution" changed human society forever.',
            icon: '📅'
        };
        const tillerZone = createInteractable(this, 620, 480, 60, 60, tillerInfo);
        this.interactables.push(tillerZone);

        // Barn portal interactable
        const barnInfo = {
            title: 'Food Storage Revolution',
            content: 'The ability to store surplus grain through winter was revolutionary. It freed people from constant food gathering and allowed specialization into other crafts and trades.',
            icon: '📈'
        };
        const barnZone = createInteractable(this, 400, 80, 96, 96, barnInfo);
        this.interactables.push(barnZone);
    }

    showEraTitleCard(title, subtitle) {
        const titleCard = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setDepth(300);
        const titleText = this.add.text(400, 280, title, {
            fontSize: '48px',
            fill: '#5C9EAD',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(301);
        const subtitleText = this.add.text(400, 340, subtitle, {
            fontSize: '24px',
            fill: '#f3f4f6',
            align: 'center'
        }).setOrigin(0.5).setDepth(301);

        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: [titleCard, titleText, subtitleText],
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    titleCard.destroy();
                    titleText.destroy();
                    subtitleText.destroy();
                }
            });
        });
    }

    createGround() {
        const tileSize = 32;
        const cols = 25;
        const rows = 19;

        // Create grass and farmland pattern
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const rand = (x * 7 + y * 13) % 100;
                // More farmland in bottom half
                const isFarmland = (y > 10 && rand < 40) || (y > 14 && rand < 70);
                const texture = isFarmland ? 'farmland' : 'grass';
                this.add.image(x * tileSize + 16, y * tileSize + 16, texture);
            }
        }
    }

    createWheatField() {
        // Create a cluster of wheat stalks
        this.wheatStalks = [];

        // Wheat field in the middle-left area
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 8; col++) {
                const x = 100 + col * 20 + Math.random() * 8;
                const y = 250 + row * 24 + Math.random() * 8;
                const wheat = this.add.image(x, y, 'wheat').setDepth(5);
                wheat.baseY = y;
                wheat.swayOffset = Math.random() * Math.PI * 2; // Random starting phase
                this.wheatStalks.push(wheat);
            }
        }

        // Another wheat patch in the bottom-right
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 6; col++) {
                const x = 550 + col * 20 + Math.random() * 8;
                const y = 420 + row * 24 + Math.random() * 8;
                const wheat = this.add.image(x, y, 'wheat').setDepth(5);
                wheat.baseY = y;
                wheat.swayOffset = Math.random() * Math.PI * 2;
                this.wheatStalks.push(wheat);
            }
        }
    }

    createBarnPortal() {
        const barnX = 400;
        const barnY = 80;

        // Barn sprite (portal to medieval era)
        this.barn = this.physics.add.sprite(barnX, barnY, 'barn');
        this.barn.setImmovable(true);

        // Add sign above barn
        this.add.text(barnX, barnY - 60, '⬆ BARN\nNext Era', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 8, y: 4 },
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
    }

    createFarmers() {
        this.farmers = [];

        // Farmer 1: Planting seeds (in farmland area)
        const farmer1 = this.add.sprite(300, 450, 'farmer-work-1');
        farmer1.setDepth(50);
        farmer1.activity = 'planting';
        farmer1.workFrame = 0;
        this.farmers.push(farmer1);

        // Animate planting cycle
        this.time.addEvent({
            delay: 700,
            callback: () => {
                farmer1.workFrame = (farmer1.workFrame + 1) % 4;
                farmer1.setFrame(farmer1.workFrame);
            },
            loop: true
        });

        // Farmer 2: Harvesting wheat (near wheat field)
        const farmer2 = this.add.sprite(200, 300, 'farmer-work-2');
        farmer2.setDepth(50);
        farmer2.activity = 'harvesting';
        farmer2.workFrame = 0;
        this.farmers.push(farmer2);

        // Sickle prop (follows farmer 2's hand)
        const sickle = this.add.image(210, 290, 'sickle').setDepth(51);
        farmer2.prop = sickle;

        // Animate harvesting cycle
        this.time.addEvent({
            delay: 500,
            callback: () => {
                farmer2.workFrame = (farmer2.workFrame + 1) % 4;
                farmer2.setFrame(farmer2.workFrame);

                // Move sickle with swinging motion
                if (farmer2.workFrame === 0) {
                    sickle.setPosition(210, 280); // Raised
                    sickle.setAngle(-20);
                } else if (farmer2.workFrame === 1) {
                    sickle.setPosition(210, 295); // Mid swing
                    sickle.setAngle(-10);
                } else if (farmer2.workFrame === 2) {
                    sickle.setPosition(210, 310); // Bottom of swing
                    sickle.setAngle(5);
                } else if (farmer2.workFrame === 3) {
                    sickle.setPosition(210, 300); // Pulling back
                    sickle.setAngle(-5);
                }
            },
            loop: true
        });

        // Farmer 3: Tilling soil (farmland area)
        const farmer3 = this.add.sprite(620, 480, 'farmer-work-3');
        farmer3.setDepth(50);
        farmer3.activity = 'tilling';
        farmer3.workFrame = 0;
        this.farmers.push(farmer3);

        // Hoe prop (follows farmer 3's hand)
        const hoe = this.add.image(630, 470, 'hoe').setDepth(51);
        farmer3.prop = hoe;

        // Animate tilling cycle
        this.time.addEvent({
            delay: 600,
            callback: () => {
                farmer3.workFrame = (farmer3.workFrame + 1) % 4;
                farmer3.setFrame(farmer3.workFrame);

                // Move hoe with tilling motion
                if (farmer3.workFrame === 0) {
                    hoe.setPosition(630, 465); // Raised
                    hoe.setAngle(-30);
                } else if (farmer3.workFrame === 1) {
                    hoe.setPosition(630, 480); // Swinging down
                    hoe.setAngle(-10);
                } else if (farmer3.workFrame === 2) {
                    hoe.setPosition(630, 495); // Impact with ground
                    hoe.setAngle(10);
                } else if (farmer3.workFrame === 3) {
                    hoe.setPosition(630, 485); // Pulling back
                    hoe.setAngle(0);
                }
            },
            loop: true
        });
    }

    createPlayer(x, y) {
        // Create player sprite
        this.player = this.physics.add.sprite(x, y, 'player-char');
        this.player.setCollideWorldBounds(true);
        this.player.setSize(24, 40);
        this.player.setOffset(4, 8);
        this.player.setDepth(50);

        // Create animations if they don't exist yet
        if (!this.anims.exists('walk-down')) {
            this.anims.create({
                key: 'walk-down',
                frames: [
                    { key: 'player-char', frame: 0 },
                    { key: 'player-char', frame: 1 },
                    { key: 'player-char', frame: 2 }
                ],
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: 'walk-left',
                frames: this.anims.generateFrameNumbers('player-char', { start: 3, end: 5 }),
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: 'walk-right',
                frames: this.anims.generateFrameNumbers('player-char', { start: 6, end: 8 }),
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: 'walk-up',
                frames: this.anims.generateFrameNumbers('player-char', { start: 9, end: 11 }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Enable collision with barn
        this.physics.add.overlap(this.player, this.barn, this.handleBarnInteraction, null, this);

        this.nearBarn = false;
    }

    handleBarnInteraction() {
        this.nearBarn = true;
    }

    update(time, delta) {
        this.nearBarn = false;

        // Check for nearby interactables
        let nearInteractable = null;
        for (let interactable of this.interactables) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                interactable.x, interactable.y
            );

            if (dist < 80) {
                nearInteractable = interactable;
                interactable.indicator.setVisible(true);
            } else {
                interactable.indicator.setVisible(false);
            }
        }

        // Handle E key press for interactables
        if (Phaser.Input.Keyboard.JustDown(this.eKey) && nearInteractable) {
            this.infoPanel.toggle(nearInteractable.infoData);
        }

        // Check distance to barn
        const distToBarn = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.barn.x, this.barn.y
        );

        if (distToBarn < 90) {
            this.nearBarn = true;
            this.interactionText.setText('Press SPACE to enter barn and travel to Medieval Era!');
            this.interactionText.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.enterNextEra();
            }
        } else if (!nearInteractable) {
            this.interactionText.setVisible(false);
        }

        // Update wheat swaying animation
        this.updateWheatSway(time);

        // Player movement
        this.updatePlayerMovement();
    }

    updateWheatSway(time) {
        // Ambient wheat swaying animation
        const swayAmount = 2; // pixels
        const swaySpeed = 0.002; // speed of sway

        this.wheatStalks.forEach(wheat => {
            const sway = Math.sin(time * swaySpeed + wheat.swayOffset) * swayAmount;
            wheat.x = wheat.x + sway * 0.1; // Very subtle horizontal sway
            wheat.setAngle(sway * 3); // More visible rotation sway
        });
    }

    updatePlayerMovement() {
        // Player movement logic (same as caveman era)
        this.player.setVelocity(0);
        let moving = false;
        let newDirection = this.lastDirection;

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
                this.player.play(`walk-${newDirection}`);
                this.lastDirection = newDirection;
            }
        } else {
            this.player.stop();
            const frameMap = { down: 0, left: 3, right: 6, up: 9 };
            this.player.setFrame(frameMap[this.lastDirection]);
        }
    }

    enterNextEra() {
        // Hide interaction text
        this.interactionText.setVisible(false);

        // Fade to black
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        // After fade, transition directly to Medieval Scene
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MedievalScene');
        });
    }
}

// ===== MEDIEVAL SCENE =====

class MedievalScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MedievalScene' });
    }

    create(data) {
        // Generate medieval era textures
        generateCobblestoneTexture(this, 'cobblestone');
        generateCastleWallTexture(this, 'castle-wall');
        generateCastleGateTexture(this, 'castle-gate');
        generateTorchTexture(this, 'torch');

        // Generate medieval props
        generateAnvil(this, 'anvil');
        generateHammer(this, 'blacksmith-hammer');
        generateSpear(this, 'guard-spear'); // Reuse spear from caveman era

        // Generate medieval character variants
        const medievalVariants = [
            { skin: '#c49a6c', tunic: '#8a4a4a', tunicDark: '#6a3a3a', pants: '#5a4a3a', hair: '#4a3a2a' },
            { skin: '#d4a574', tunic: '#6a5a4a', tunicDark: '#5a4a3a', pants: '#4a3a2a', hair: '#3d2817' }
        ];

        generateMedievalWorkFrames(this, 'medieval-work-1', medievalVariants[0], 'blacksmith');
        generateMedievalWorkFrames(this, 'medieval-work-2', medievalVariants[1], 'guarding');

        // Reuse player character
        if (!this.textures.exists('player-char')) {
            generateCharacterSprite(this, 'player-char');
        }

        // Generate fire particles for torch flames
        if (!this.textures.exists('fire-orange')) {
            generateFireParticles(this);
        }

        // Generate interactive object sprites
        generateMilestoneTexture(this, 'milestone');
        generateBannerTexture(this, 'banner');
        generateMarketStallTexture(this, 'market-stall');
        generateGuildSignTexture(this, 'guild-sign');
        generateCoatOfArmsTexture(this, 'coat-of-arms');

        // Generate walking sprite for timeline (shared across scenes)
        if (!this.textures.exists('walking-sprite')) {
            generateWalkingSpriteTexture(this, 'walking-sprite');
            // Add frames for walking sprite (4 frames of 16x16 pixels)
            for (let i = 0; i < 4; i++) {
                this.textures.get('walking-sprite').add(i, 0, i * 16, 0, 16, 16);
            }
        }

        // Get spawn position
        const spawnX = data?.spawnX || 400;
        const spawnY = data?.spawnY || 500;

        // Fade in effect
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Add frame configs for work animations
        for (let i = 1; i <= 2; i++) {
            const key = `medieval-work-${i}`;
            const numFrames = 4;
            for (let f = 0; f < numFrames; f++) {
                this.textures.get(key).add(f, 0, f * 32, 0, 32, 48);
            }
        }

        // Add frame configs for player (if not already added)
        if (!this.anims.exists('walk-down')) {
            for (let i = 0; i < 12; i++) {
                const col = i % 3;
                const row = Math.floor(i / 3);
                this.textures.get('player-char').add(i, 0, col * 32, row * 48, 32, 48);
            }
        }

        // World bounds
        this.physics.world.setBounds(0, 0, 800, 600);

        // Create scene elements
        this.createGround();
        this.createCastleWalls();
        this.createTorches();
        this.createCastleGate();
        this.createVillagers();

        // Add interactive object sprites
        this.add.image(400, 400, 'milestone').setDepth(5); // Cobblestone road
        this.add.image(400, 60, 'banner').setDepth(15); // Defensive wall banner
        this.add.image(500, 250, 'market-stall').setDepth(10); // Town square stall
        this.add.image(200, 250, 'guild-sign').setDepth(10); // Craft guilds sign
        this.add.image(600, 150, 'coat-of-arms').setDepth(10); // Feudal society shield

        this.createPlayer(spawnX, spawnY);

        // Camera setup
        this.cameras.main.setBounds(0, 0, 800, 600);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.eKey = this.input.keyboard.addKey('E');

        // Create info panel system
        this.infoPanel = new InfoPanel(this);
        this.interactables = [];
        this.createInteractables();

        // Create timeline bar
        this.timelineBar = new TimelineBar(this, 'medieval');

        // Interaction text (moved down to accommodate timeline)
        this.interactionText = this.add.text(400, 560, '', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        // Era title card
        this.showEraTitleCard('MEDIEVAL ERA', '1000-1500 CE');

        // Track player direction
        this.lastDirection = 'down';
        this.playerSpeed = 140;
    }

    createInteractables() {
        // Blacksmith & Anvil interactable
        const blacksmithInfo = {
            title: 'Medieval Metalworking',
            content: 'Blacksmiths were among the most respected craftsmen in medieval society. They made everything from horseshoes to armor, and their skills took years to master.',
            icon: '🔧'
        };
        const blacksmithZone = createInteractable(this, 260, 450, 80, 80, blacksmithInfo);
        this.interactables.push(blacksmithZone);

        // Guard NPC interactable
        const guardInfo = {
            title: 'Town Guards',
            content: 'Medieval towns employed guards to protect against bandits and enforce local laws. Being a guard was a respected position that often ran in families.',
            icon: '🏛️'
        };
        const guardZone = createInteractable(this, 600, 350, 60, 60, guardInfo);
        this.interactables.push(guardZone);

        // Castle Gate interactable
        const gateInfo = {
            title: 'Castle Architecture',
            content: 'Medieval castles (1000-1500 CE) were both homes and fortresses. Their thick walls, towers, and strategic design could withstand months-long sieges.',
            icon: '🏰'
        };
        const gateZone = createInteractable(this, 400, 90, 160, 128, gateInfo);
        this.interactables.push(gateZone);

        // Torches interactable
        const torchInfo = {
            title: 'Medieval Lighting',
            content: 'Before electricity, torches and candles were the only way to light dark spaces. A single torch burned for about 1-2 hours, making light an expensive luxury.',
            icon: '🕯️'
        };
        const torchZone = createInteractable(this, 150, 80, 60, 60, torchInfo);
        this.interactables.push(torchZone);

        // Cobblestone ground interactable
        const roadInfo = {
            title: 'Medieval Infrastructure',
            content: 'Cobblestone roads were a major advancement from dirt paths. They improved trade by allowing carts to travel in all weather and lasted for centuries with proper maintenance.',
            icon: '🛤️'
        };
        const roadZone = createInteractable(this, 400, 400, 100, 100, roadInfo);
        this.interactables.push(roadZone);

        // Castle walls interactable
        const wallInfo = {
            title: 'Defensive Fortifications',
            content: 'Castle walls could be up to 20 feet thick and 60 feet tall. Crenellations (the notched top) allowed defenders to shoot arrows while staying protected.',
            icon: '🧱'
        };
        const wallZone = createInteractable(this, 400, 48, 200, 60, wallInfo);
        this.interactables.push(wallZone);

        // Town square area
        const townInfo = {
            title: 'Medieval Towns & Trade',
            content: 'Medieval towns were centers of commerce and craft. Markets brought together farmers, craftsmen, and merchants. Town charters gave citizens rights and self-governance.',
            icon: '🏛️'
        };
        const townZone = createInteractable(this, 500, 250, 100, 100, townInfo);
        this.interactables.push(townZone);

        // Guilds and crafts
        const guildInfo = {
            title: 'Craft Guilds',
            content: 'Guilds controlled medieval trades through apprenticeship systems. Becoming a master craftsman took 7+ years of training and required creating a "masterpiece" to prove skill.',
            icon: '⚒️'
        };
        const guildZone = createInteractable(this, 200, 250, 80, 80, guildInfo);
        this.interactables.push(guildZone);

        // Feudal system
        const feudalInfo = {
            title: 'Feudal Society',
            content: 'Medieval Europe operated on feudalism: kings granted land to nobles, who provided knights for protection. Peasants worked the land in exchange for protection and housing.',
            icon: '👑'
        };
        const feudalZone = createInteractable(this, 600, 150, 80, 80, feudalInfo);
        this.interactables.push(feudalZone);
    }

    showEraTitleCard(title, subtitle) {
        const titleCard = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setDepth(300);
        const titleText = this.add.text(400, 280, title, {
            fontSize: '48px',
            fill: '#5C9EAD',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(301);
        const subtitleText = this.add.text(400, 340, subtitle, {
            fontSize: '24px',
            fill: '#f3f4f6',
            align: 'center'
        }).setOrigin(0.5).setDepth(301);

        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: [titleCard, titleText, subtitleText],
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    titleCard.destroy();
                    titleText.destroy();
                    subtitleText.destroy();
                }
            });
        });
    }

    createGround() {
        const tileSize = 32;
        const cols = 25;
        const rows = 19;

        // Create cobblestone ground
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.add.image(x * tileSize + 16, y * tileSize + 16, 'cobblestone');
            }
        }
    }

    createCastleWalls() {
        // Castle wall backdrop at the top
        const wallPositions = [
            { x: 64, y: 48 }, { x: 128, y: 48 }, { x: 192, y: 48 },
            { x: 320, y: 48 }, { x: 384, y: 48 }, { x: 448, y: 48 },
            { x: 512, y: 48 }, { x: 576, y: 48 }, { x: 640, y: 48 },
            { x: 704, y: 48 }
        ];

        wallPositions.forEach(pos => {
            this.add.image(pos.x, pos.y, 'castle-wall').setDepth(1);
        });
    }

    createTorches() {
        // Wall-mounted torches with animated flames
        this.torches = [];
        const torchPositions = [
            { x: 150, y: 80 }, { x: 650, y: 80 },
            { x: 100, y: 300 }, { x: 700, y: 300 }
        ];

        torchPositions.forEach(pos => {
            const torch = this.add.image(pos.x, pos.y, 'torch').setDepth(10);
            this.torches.push(torch);

            // Animated flame particles
            this.add.particles(pos.x, pos.y - 12, 'fire-orange', {
                speed: { min: 15, max: 25 },
                angle: { min: 260, max: 280 },
                scale: { start: 0.6, end: 0 },
                alpha: { start: 0.9, end: 0 },
                lifespan: 500,
                frequency: 80,
                gravityY: -40,
                blendMode: 'ADD'
            }).setDepth(11);
        });

        // Flickering animation timer for torches
        this.time.addEvent({
            delay: 150,
            callback: () => {
                this.torches.forEach(torch => {
                    const flicker = Math.random() * 0.2 - 0.1;
                    torch.setScale(1 + flicker, 1 + flicker);
                });
            },
            loop: true
        });
    }

    createCastleGate() {
        const gateX = 400;
        const gateY = 90;

        // Castle gate sprite (portal to next era)
        this.castleGate = this.physics.add.sprite(gateX, gateY, 'castle-gate');
        this.castleGate.setImmovable(true);

        // Add sign above gate
        this.add.text(gateX, gateY - 70, '⬆ CASTLE GATE\nNext Era', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 8, y: 4 },
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
    }

    createVillagers() {
        this.villagers = [];

        // Villager 1: Blacksmith hammering
        const blacksmith = this.add.sprite(250, 450, 'medieval-work-1');
        blacksmith.setDepth(50);
        blacksmith.activity = 'blacksmith';
        blacksmith.workFrame = 0;
        this.villagers.push(blacksmith);

        // Anvil next to blacksmith
        const anvil = this.add.image(270, 465, 'anvil').setDepth(48);

        // Hammer prop (follows blacksmith's hand)
        const hammer = this.add.image(260, 440, 'blacksmith-hammer').setDepth(51);
        blacksmith.prop = hammer;

        // Yellow sparks particle emitter for hammer strikes
        const sparks = this.add.particles(270, 460, 'fire-yellow', {
            speed: { min: 30, max: 50 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 400,
            frequency: -1, // Manual emission
            gravityY: 150
        });

        // Animate blacksmith hammering cycle
        this.time.addEvent({
            delay: 500,
            callback: () => {
                blacksmith.workFrame = (blacksmith.workFrame + 1) % 4;
                blacksmith.setFrame(blacksmith.workFrame);

                // Move hammer with arm motion
                if (blacksmith.workFrame === 0) {
                    hammer.setPosition(260, 430); // Raised
                    hammer.setAngle(-45);
                } else if (blacksmith.workFrame === 1) {
                    hammer.setPosition(265, 445); // Swinging down
                    hammer.setAngle(-20);
                } else if (blacksmith.workFrame === 2) {
                    hammer.setPosition(270, 460); // Impact!
                    hammer.setAngle(0);
                    // Emit sparks on impact
                    sparks.emitParticle(8);
                } else if (blacksmith.workFrame === 3) {
                    hammer.setPosition(265, 450); // Raising back
                    hammer.setAngle(-10);
                }
            },
            loop: true
        });

        // Villager 2: Guard with spear (patrolling)
        const guard = this.physics.add.sprite(550, 350, 'medieval-work-2');
        guard.setDepth(50);
        guard.activity = 'guarding';
        guard.workFrame = 0;
        guard.patrolMinX = 500;
        guard.patrolMaxX = 700;
        guard.patrolDirection = 1;
        this.villagers.push(guard);

        // Spear prop (held by guard)
        const guardSpear = this.add.image(560, 340, 'guard-spear').setDepth(49);
        guardSpear.setAngle(-90); // Vertical
        guard.prop = guardSpear;

        // Animate guard (simple frame cycling while patrolling)
        this.time.addEvent({
            delay: 600,
            callback: () => {
                guard.workFrame = (guard.workFrame + 1) % 4;
                guard.setFrame(guard.workFrame);
            },
            loop: true
        });
    }

    createPlayer(x, y) {
        // Create player sprite
        this.player = this.physics.add.sprite(x, y, 'player-char');
        this.player.setCollideWorldBounds(true);
        this.player.setSize(24, 40);
        this.player.setOffset(4, 8);
        this.player.setDepth(50);

        // Create animations if they don't exist yet
        if (!this.anims.exists('walk-down')) {
            this.anims.create({
                key: 'walk-down',
                frames: [
                    { key: 'player-char', frame: 0 },
                    { key: 'player-char', frame: 1 },
                    { key: 'player-char', frame: 2 }
                ],
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: 'walk-left',
                frames: this.anims.generateFrameNumbers('player-char', { start: 3, end: 5 }),
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: 'walk-right',
                frames: this.anims.generateFrameNumbers('player-char', { start: 6, end: 8 }),
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: 'walk-up',
                frames: this.anims.generateFrameNumbers('player-char', { start: 9, end: 11 }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Enable collision with castle gate
        this.physics.add.overlap(this.player, this.castleGate, this.handleGateInteraction, null, this);

        this.nearGate = false;
    }

    handleGateInteraction() {
        this.nearGate = true;
    }

    update(time, delta) {
        // Check for nearby interactables
        let nearInteractable = null;
        for (let interactable of this.interactables) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                interactable.x, interactable.y
            );

            if (dist < 80) {
                nearInteractable = interactable;
                interactable.indicator.setVisible(true);
            } else {
                interactable.indicator.setVisible(false);
            }
        }

        // Handle E key press for info panels
        if (Phaser.Input.Keyboard.JustDown(this.eKey) && nearInteractable) {
            this.infoPanel.toggle(nearInteractable.infoData);
        }

        this.nearGate = false;

        // Check distance to castle gate
        const distToGate = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.castleGate.x, this.castleGate.y
        );

        if (distToGate < 90) {
            this.nearGate = true;
            this.interactionText.setText('Press SPACE to enter castle gate!\n(Next era coming soon)');
            this.interactionText.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.enterNextEra();
            }
        } else if (!nearInteractable) {
            this.interactionText.setVisible(false);
        }

        // Update guard patrol
        this.updateGuardPatrol();

        // Player movement
        this.updatePlayerMovement();
    }

    updateGuardPatrol() {
        const guard = this.villagers.find(v => v.activity === 'guarding');
        if (guard) {
            const speed = 30;
            if (guard.patrolDirection === 1) {
                guard.setVelocityX(speed);
                guard.prop.x = guard.x + 10;
                guard.prop.y = guard.y - 10;
                if (guard.x > guard.patrolMaxX) {
                    guard.patrolDirection = -1;
                    guard.setFlipX(true);
                }
            } else {
                guard.setVelocityX(-speed);
                guard.prop.x = guard.x - 10;
                guard.prop.y = guard.y - 10;
                if (guard.x < guard.patrolMinX) {
                    guard.patrolDirection = 1;
                    guard.setFlipX(false);
                }
            }
        }
    }

    updatePlayerMovement() {
        // Player movement logic
        this.player.setVelocity(0);
        let moving = false;
        let newDirection = this.lastDirection;

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
                this.player.play(`walk-${newDirection}`);
                this.lastDirection = newDirection;
            }
        } else {
            this.player.stop();
            const frameMap = { down: 0, left: 3, right: 6, up: 9 };
            this.player.setFrame(frameMap[this.lastDirection]);
        }
    }

    enterNextEra() {
        // Hide interaction text
        this.interactionText.setVisible(false);

        // Fade to black
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        // After fade, transition directly to Renaissance Scene
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('RenaissanceScene');
        });
    }
}

// ===== RENAISSANCE SCENE =====

class RenaissanceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RenaissanceScene' });
    }

    create(data) {
        // Generate all textures procedurally
        generateMarbleTexture(this, 'marble');
        generateLibraryPortalTexture(this, 'library-portal');
        generatePrintingPressTexture(this, 'printing-press');
        generateEaselTexture(this, 'easel');
        generateGlobeTexture(this, 'globe');
        generateManuscriptTexture(this, 'manuscript');

        // Generate NPC textures
        generateRenaissanceNPCTexture(this, 'renaissance-artist', 'artist');
        generateRenaissanceNPCTexture(this, 'renaissance-scholar', 'scholar');
        generateRenaissanceNPCTexture(this, 'renaissance-inventor', 'inventor');

        // Generate player character (reuse from previous scenes)
        if (!this.textures.exists('player-char')) {
            generateCharacterSprite(this, 'player-char');
        }

        // Generate fire particles (for candles/lamps)
        if (!this.textures.exists('fire-orange')) {
            generateFireParticles(this);
        }

        // Generate interactive object sprites
        generateTelescopeTexture(this, 'telescope');

        // Generate walking sprite for timeline (shared across scenes)
        if (!this.textures.exists('walking-sprite')) {
            generateWalkingSpriteTexture(this, 'walking-sprite');
            // Add frames for walking sprite (4 frames of 16x16 pixels)
            for (let i = 0; i < 4; i++) {
                this.textures.get('walking-sprite').add(i, 0, i * 16, 0, 16, 16);
            }
        }

        // Setup
        this.playerSpeed = 160;
        this.lastDirection = 'down';

        // Camera setup
        this.cameras.main.setBounds(0, 0, 800, 600);
        this.physics.world.setBounds(0, 0, 800, 600);

        // Create scene elements
        this.createGround();
        this.createLibraryPortal();
        this.createObjects();
        this.createScholars();

        // Create player at spawn point
        const spawnX = data.fromEra ? 400 : 400;
        const spawnY = data.fromEra ? 500 : 500;
        this.createPlayer(spawnX, spawnY);

        // Camera follows player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.eKey = this.input.keyboard.addKey('E');

        // Interaction text
        this.interactionText = this.add.text(400, 550, '', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        // Create info panel system
        this.infoPanel = new InfoPanel(this);
        this.interactables = [];
        this.createInteractables();

        // Era title card
        this.showEraTitleCard('RENAISSANCE ERA', '1400-1600 CE');
    }

    createGround() {
        const tileSize = 32;
        const cols = 25;
        const rows = 19;

        // Create marble floor
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.add.image(x * tileSize + 16, y * tileSize + 16, 'marble');
            }
        }
    }

    createLibraryPortal() {
        const portalX = 400;
        const portalY = 90;

        // Library portal sprite (portal to next era)
        this.libraryPortal = this.physics.add.sprite(portalX, portalY, 'library-portal');
        this.libraryPortal.setImmovable(true);

        // Add sign above portal
        this.add.text(portalX, portalY - 80, '⬆ LIBRARY\nNext Era', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 8, y: 4 },
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
    }

    createObjects() {
        // Printing press (left side)
        this.printingPress = this.add.image(150, 200, 'printing-press').setDepth(10);

        // Easel with painting (right side)
        this.easel = this.add.image(650, 250, 'easel').setDepth(10);

        // Globe on pedestal (center-left)
        this.globe = this.add.image(250, 400, 'globe').setDepth(10);

        // Stack of manuscripts (various positions)
        this.add.image(600, 450, 'manuscript').setDepth(5);
        this.add.image(620, 445, 'manuscript').setDepth(6);
        this.add.image(610, 440, 'manuscript').setDepth(7);

        this.add.image(200, 500, 'manuscript').setDepth(5);
        this.add.image(215, 495, 'manuscript').setDepth(6);

        // Candles with flickering flames (ambient lighting)
        const candlePositions = [
            { x: 100, y: 100 }, { x: 700, y: 100 },
            { x: 120, y: 400 }, { x: 680, y: 400 }
        ];

        candlePositions.forEach(pos => {
            // Candlestick (simple rectangle)
            const candle = this.add.rectangle(pos.x, pos.y, 4, 12, 0xf5f3e8).setDepth(10);

            // Flame particles
            this.add.particles(pos.x, pos.y - 8, 'fire-orange', {
                speed: { min: 10, max: 15 },
                angle: { min: 260, max: 280 },
                scale: { start: 0.4, end: 0 },
                alpha: { start: 0.8, end: 0 },
                lifespan: 400,
                frequency: 100,
                gravityY: -30,
                blendMode: 'ADD'
            }).setDepth(11);
        });
    }

    createScholars() {
        this.scholars = [];

        // Scholar 1: Artist painting at easel
        const artist = this.add.sprite(620, 250, 'renaissance-artist');
        artist.setDepth(50);
        artist.activity = 'artist';
        artist.workFrame = 0;
        this.scholars.push(artist);

        // Animate artist
        this.time.addEvent({
            delay: 500,
            callback: () => {
                artist.workFrame = (artist.workFrame + 1) % 4;
                artist.setFrame(artist.workFrame);
            },
            loop: true
        });

        // Scholar 2: Scholar reading/writing
        const scholar = this.add.sprite(180, 500, 'renaissance-scholar');
        scholar.setDepth(50);
        scholar.activity = 'scholar';
        scholar.workFrame = 0;
        this.scholars.push(scholar);

        // Animate scholar
        this.time.addEvent({
            delay: 600,
            callback: () => {
                scholar.workFrame = (scholar.workFrame + 1) % 4;
                scholar.setFrame(scholar.workFrame);
            },
            loop: true
        });

        // Scholar 3: Inventor tinkering
        const inventor = this.add.sprite(280, 400, 'renaissance-inventor');
        inventor.setDepth(50);
        inventor.activity = 'inventor';
        inventor.workFrame = 0;
        this.scholars.push(inventor);

        // Animate inventor
        this.time.addEvent({
            delay: 450,
            callback: () => {
                inventor.workFrame = (inventor.workFrame + 1) % 4;
                inventor.setFrame(inventor.workFrame);
            },
            loop: true
        });
    }

    createInteractables() {
        // Printing Press interactable
        const printingPressInfo = {
            title: 'The Printing Press Revolution',
            content: 'Johannes Gutenberg\'s printing press (1440) revolutionized knowledge sharing. Before this, books were hand-copied and took months to produce. The press could print 3,600 pages per day, making books affordable and spreading literacy across Europe.',
            icon: '📖'
        };
        const printingPressZone = createInteractable(this, 150, 200, 60, 70, printingPressInfo);
        this.interactables.push(printingPressZone);

        // Easel/Artist interactable
        const artInfo = {
            title: 'Renaissance Art & Perspective',
            content: 'Renaissance artists like Leonardo da Vinci and Michelangelo pioneered linear perspective, making paintings look 3D. They studied anatomy, light, and mathematics to create realistic art that still amazes us today.',
            icon: '🎨'
        };
        const artZone = createInteractable(this, 650, 250, 80, 80, artInfo);
        this.interactables.push(artZone);

        // Globe interactable
        const explorationInfo = {
            title: 'Age of Exploration',
            content: 'Renaissance explorers like Columbus (1492) and Magellan (1519) mapped the world using new navigation tools: the compass, astrolabe, and printed maps. These voyages connected continents and changed global trade forever.',
            icon: '🌍'
        };
        const globeZone = createInteractable(this, 250, 400, 50, 50, explorationInfo);
        this.interactables.push(globeZone);

        // Scholar NPC interactable
        const scholarInfo = {
            title: 'Humanism & Classical Learning',
            content: 'Renaissance scholars revived ancient Greek and Roman texts, studying philosophy, science, and literature. This "rebirth" of classical knowledge sparked new ideas about human potential and individual achievement.',
            icon: '📚'
        };
        const scholarZone = createInteractable(this, 180, 500, 60, 60, scholarInfo);
        this.interactables.push(scholarZone);

        // Inventor NPC interactable
        const inventorInfo = {
            title: 'Renaissance Inventions',
            content: 'Renaissance inventors like Leonardo da Vinci designed flying machines, submarines, and mechanical devices centuries ahead of their time. Though many weren\'t built, their detailed drawings inspired future engineers.',
            icon: '⚙️'
        };
        const inventorZone = createInteractable(this, 280, 400, 60, 60, inventorInfo);
        this.interactables.push(inventorZone);

        // Manuscripts interactable
        const manuscriptInfo = {
            title: 'From Manuscripts to Print',
            content: 'Before printing, monks spent years hand-copying books with beautiful illuminated letters. A single Bible took 2-3 years! The printing press made the same book in days, democratizing knowledge.',
            icon: '✍️'
        };
        const manuscriptZone = createInteractable(this, 610, 450, 80, 60, manuscriptInfo);
        this.interactables.push(manuscriptZone);

        // Library Portal interactable
        const libraryInfo = {
            title: 'Centers of Learning',
            content: 'Renaissance libraries and universities became temples of knowledge. The Medici Library in Florence held thousands of books on science, art, and philosophy, fueling the intellectual revolution.',
            icon: '🏛️'
        };
        const libraryZone = createInteractable(this, 400, 90, 130, 150, libraryInfo);
        this.interactables.push(libraryZone);

        // Scientific Method area
        const scienceInfo = {
            title: 'Birth of Modern Science',
            content: 'Renaissance thinkers like Galileo and Copernicus challenged old beliefs with observation and experiments. Their scientific method - question, test, prove - became the foundation of all modern science.',
            icon: '🔬'
        };
        const scienceZone = createInteractable(this, 500, 350, 100, 100, scienceInfo);
        this.interactables.push(scienceZone);
    }

    showEraTitleCard(title, subtitle) {
        const titleCard = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setDepth(300);
        const titleText = this.add.text(400, 280, title, {
            fontSize: '48px',
            fill: '#5C9EAD',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(301);

        const subtitleText = this.add.text(400, 340, subtitle, {
            fontSize: '24px',
            fill: '#f3f4f6',
            align: 'center'
        }).setOrigin(0.5).setDepth(301);

        // Fade out after 3 seconds
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: [titleCard, titleText, subtitleText],
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    titleCard.destroy();
                    titleText.destroy();
                    subtitleText.destroy();
                }
            });
        });
    }

    createPlayer(x, y) {
        // Create player sprite
        this.player = this.physics.add.sprite(x, y, 'player-char');
        this.player.setCollideWorldBounds(true);
        this.player.setSize(24, 40);
        this.player.setOffset(4, 8);
        this.player.setDepth(50);

        // Create animations if they don't exist yet
        if (!this.anims.exists('walk-down')) {
            this.anims.create({
                key: 'walk-down',
                frames: [
                    { key: 'player-char', frame: 0 },
                    { key: 'player-char', frame: 1 },
                    { key: 'player-char', frame: 2 }
                ],
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: 'walk-left',
                frames: this.anims.generateFrameNumbers('player-char', { start: 3, end: 5 }),
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: 'walk-right',
                frames: this.anims.generateFrameNumbers('player-char', { start: 6, end: 8 }),
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: 'walk-up',
                frames: this.anims.generateFrameNumbers('player-char', { start: 9, end: 11 }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Enable collision with library portal
        this.physics.add.overlap(this.player, this.libraryPortal, this.handlePortalInteraction, null, this);

        this.nearPortal = false;
    }

    handlePortalInteraction() {
        this.nearPortal = true;
    }

    update(time, delta) {
        // Check for nearby interactables
        let nearInteractable = null;
        for (let interactable of this.interactables) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                interactable.x, interactable.y
            );

            if (dist < 80) {
                nearInteractable = interactable;
                interactable.indicator.setVisible(true);
            } else {
                interactable.indicator.setVisible(false);
            }
        }

        // Handle E key press for info panels
        if (Phaser.Input.Keyboard.JustDown(this.eKey) && nearInteractable) {
            this.infoPanel.toggle(nearInteractable.infoData);
        }

        this.nearPortal = false;

        // Check distance to library portal
        const distToPortal = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.libraryPortal.x, this.libraryPortal.y
        );

        if (distToPortal < 100) {
            this.nearPortal = true;
            this.interactionText.setText('Press SPACE to enter library!\n(Next era coming soon)');
            this.interactionText.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.enterNextEra();
            }
        } else if (!nearInteractable) {
            this.interactionText.setVisible(false);
        }

        // Player movement
        this.updatePlayerMovement();
    }

    updatePlayerMovement() {
        // Reset velocity
        this.player.setVelocity(0);

        let moving = false;
        let newDirection = this.lastDirection;

        // Movement
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
                this.player.play(`walk-${newDirection}`);
                this.lastDirection = newDirection;
            }
        } else {
            this.player.stop();
            const frameMap = { down: 0, left: 3, right: 6, up: 9 };
            this.player.setFrame(frameMap[this.lastDirection]);
        }
    }

    enterNextEra() {
        // Show coming soon message
        this.interactionText.setText('🎉 More eras coming soon!');
        this.interactionText.setVisible(true);

        this.time.delayedCall(2000, () => {
            this.interactionText.setVisible(false);
        });
    }
}

// ===== PROGRESS TIMELINE SCENE =====

class ProgressTimelineScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ProgressTimelineScene' });
    }

    create(data) {
        // Data contains: previousEra, nextEra, nextSceneKey
        this.previousEra = data.previousEra || 'caveman';
        this.nextEra = data.nextEra || 'farming';
        this.nextSceneKey = data.nextSceneKey || 'FarmingScene';

        // Black background
        this.cameras.main.setBackgroundColor('#000000');

        // Title
        this.add.text(400, 50, 'THE ACCELERATION OF PROGRESS', {
            fontSize: '32px',
            fill: '#5C9EAD',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(400, 90, 'Notice how gaps between major innovations are shrinking...', {
            fontSize: '16px',
            fill: '#f3f4f6',
            align: 'center'
        }).setOrigin(0.5);

        // Timeline data - key inventions with years (negative = BCE, positive = CE)
        const inventions = [
            { name: 'Stone Tools', year: -2500000, icon: '🔧' },
            { name: 'Fire', year: -1500000, icon: '🔥' },
            { name: 'Agriculture', year: -10000, icon: '🌾' },
            { name: 'Wheel', year: -3500, icon: '⚙️' },
            { name: 'Writing', year: -3200, icon: '✍️' },
            { name: 'Printing Press', year: 1440, icon: '📖' },
            { name: 'Steam Engine', year: 1712, icon: '🚂' },
            { name: 'Electricity', year: 1879, icon: '💡' },
            { name: 'Automobile', year: 1885, icon: '🚗' },
            { name: 'Airplane', year: 1903, icon: '✈️' },
            { name: 'Computer', year: 1946, icon: '💻' },
            { name: 'Internet', year: 1969, icon: '🌐' },
            { name: 'Smartphone', year: 2007, icon: '📱' },
            { name: 'AI', year: 2015, icon: '🤖' }
        ];

        // Draw timeline visualization
        this.drawTimeline(inventions);

        // Calculate gaps to show acceleration
        this.showAccelerationStats(inventions);

        // Instructions
        this.add.text(400, 570, 'Press SPACE to continue or wait 5 seconds...', {
            fontSize: '14px',
            fill: '#9ca3af',
            align: 'center'
        }).setOrigin(0.5);

        // Space key to skip
        this.spaceKey = this.input.keyboard.addKey('SPACE');

        // Auto-advance after 5 seconds
        this.time.delayedCall(5000, () => {
            this.transitionToNextScene();
        });
    }

    drawTimeline(inventions) {
        // Use logarithmic scale to show all inventions on screen
        // Convert years to log scale for visualization

        const startY = 150;
        const lineHeight = 360;
        const leftX = 100;
        const rightX = 700;

        // Draw vertical timeline bar
        const graphics = this.add.graphics();
        graphics.lineStyle(3, 0x5C9EAD);
        graphics.beginPath();
        graphics.moveTo(leftX, startY);
        graphics.lineTo(leftX, startY + lineHeight);
        graphics.strokePath();

        // Normalize positions (logarithmic scale for early dates)
        const minYear = inventions[0].year;
        const maxYear = inventions[inventions.length - 1].year;

        inventions.forEach((invention, index) => {
            // Use custom positioning to show acceleration
            // Early inventions are spaced out, later ones compressed
            let position;
            if (invention.year < 0) {
                // Logarithmic scale for BCE dates
                const logMin = Math.log10(Math.abs(minYear));
                const logCurrent = Math.log10(Math.abs(invention.year));
                position = (logMin - logCurrent) / logMin;
            } else {
                // Linear scale for CE dates (compressed)
                position = 0.7 + (invention.year / maxYear) * 0.3;
            }

            const y = startY + lineHeight * position;

            // Timeline dot
            graphics.fillStyle(0x5C9EAD);
            graphics.fillCircle(leftX, y, 5);

            // Icon
            this.add.text(leftX - 40, y, invention.icon, {
                fontSize: '20px'
            }).setOrigin(0.5);

            // Invention name and year
            const yearText = invention.year < 0
                ? `${Math.abs(invention.year).toLocaleString()} BCE`
                : `${invention.year} CE`;

            this.add.text(leftX + 20, y - 8, invention.name, {
                fontSize: '14px',
                fill: '#f3f4f6',
                fontStyle: 'bold'
            });

            this.add.text(leftX + 20, y + 8, yearText, {
                fontSize: '11px',
                fill: '#9ca3af'
            });

            // Draw gap indicator lines between major eras
            if (index > 0) {
                const prevY = startY + lineHeight * ((inventions[index - 1].year < 0)
                    ? (Math.log10(Math.abs(minYear)) - Math.log10(Math.abs(inventions[index - 1].year))) / Math.log10(Math.abs(minYear))
                    : 0.7 + (inventions[index - 1].year / maxYear) * 0.3);

                const gap = invention.year - inventions[index - 1].year;

                // Show major gaps (> 1000 years)
                if (Math.abs(gap) > 1000) {
                    graphics.lineStyle(1, 0x4a4a4a, 0.3);
                    graphics.beginPath();
                    graphics.moveTo(leftX, prevY);
                    graphics.lineTo(leftX, y);
                    graphics.strokePath();

                    const gapYears = Math.abs(gap);
                    let gapText;
                    if (gapYears >= 1000000) {
                        gapText = `${(gapYears / 1000000).toFixed(1)}M years`;
                    } else if (gapYears >= 1000) {
                        gapText = `${(gapYears / 1000).toFixed(0)}k years`;
                    } else {
                        gapText = `${gapYears} years`;
                    }

                    this.add.text(leftX - 80, (prevY + y) / 2, gapText, {
                        fontSize: '10px',
                        fill: '#6a6a6a',
                        align: 'right'
                    }).setOrigin(1, 0.5);
                }
            }
        });
    }

    showAccelerationStats(inventions) {
        // Show statistics highlighting acceleration
        const statsX = 450;
        const statsY = 180;

        this.add.text(statsX, statsY, 'Progress is Accelerating:', {
            fontSize: '20px',
            fill: '#5C9EAD',
            fontStyle: 'bold'
        });

        const stats = [
            '⏰ First 2.4 million years:',
            '   Fire, stone tools',
            '',
            '⏰ Last 10,000 years:',
            '   Agriculture, writing, wheel',
            '',
            '⏰ Last 500 years:',
            '   Printing, steam, electricity',
            '',
            '⏰ Last 100 years:',
            '   Cars, planes, computers,',
            '   internet, AI',
            '',
            '💡 Each era brings more change',
            '   in less time than the last!'
        ];

        stats.forEach((stat, index) => {
            this.add.text(statsX, statsY + 35 + index * 20, stat, {
                fontSize: '14px',
                fill: stat.startsWith('⏰') || stat.startsWith('💡') ? '#f3f4f6' : '#9ca3af',
                fontStyle: stat.startsWith('⏰') || stat.startsWith('💡') ? 'bold' : 'normal'
            });
        });
    }

    update() {
        // Check for space key press
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.transitionToNextScene();
        }
    }

    transitionToNextScene() {
        // Prevent multiple transitions
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Fade out
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Start next scene
            this.scene.start(this.nextSceneKey, { fromEra: this.previousEra });
        });
    }
}

// ===== PHASER GAME CONFIGURATION =====

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#000000',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [CavemanScene, FarmingScene, MedievalScene, RenaissanceScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Initialize the game
const game = new Phaser.Game(config);
