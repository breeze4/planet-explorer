/**
 * @fileoverview Planet class for the Planet Explorer game
 */

/**
 * Planet names for random generation
 * @type {Array<string>}
 */
const PLANET_NAMES = [
  "Xenon", "Nebuloria", "Astralus", "Celestis", "Novastella",
  "Quasaria", "Lunaris", "Pulsaria", "Graviton", "Solaris"
];

/**
 * Planet descriptions for random generation
 * @type {Array<string>}
 */
const PLANET_DESCRIPTIONS = [
  "A gas giant with swirling storms of various colors. The atmospheric pressure would crush any spacecraft that ventures too deep.",
  "A rocky planet with vast oceans covering 90% of its surface. Strange bioluminescent creatures inhabit its depths.",
  "A desert world with massive canyons and rock formations. Ancient ruins suggest it once hosted an advanced civilization.",
  "An ice planet with frozen methane lakes. The surface temperature never rises above -200°C.",
  "A volcanic world with rivers of molten lava. Despite the harsh conditions, some hardy lifeforms thrive near thermal vents.",
  "A lush jungle planet with abundant plant life. The rapid growth rate of vegetation can overtake structures in days.",
  "A ringed planet with spectacular views of its neighboring moons. Mining operations extract rare minerals from its asteroid belt.",
  "A planet with a highly eccentric orbit, causing extreme seasonal changes. Inhabitants have adapted with migratory patterns.",
  "A planet with low gravity and floating islands. Crystal formations throughout emit soft light in various colors.",
  "A world shrouded in perpetual mist. Navigation is extremely difficult, but the fog contains valuable therapeutic compounds."
];

/**
 * Class representing a planet
 */
export class Planet {
  /**
   * Create a planet
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} radius - Planet radius
   * @param {string} [color] - Planet color (optional, will be random if not specified)
   */
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color || randomColor();
    this.name = PLANET_NAMES[randomInt(0, PLANET_NAMES.length - 1)];
    this.description = PLANET_DESCRIPTIONS[randomInt(0, PLANET_DESCRIPTIONS.length - 1)];
    
    // Create a unique atmospheric ring
    this.ringColor = randomColor();
    this.ringSize = this.radius * (1.2 + Math.random() * 0.3);
    this.hasRings = Math.random() > 0.5;
    
    // Create some basic features
    this.features = [];
    const featureCount = randomInt(2, 5);
    for (let i = 0; i < featureCount; i++) {
      this.features.push({
        size: this.radius * (0.1 + Math.random() * 0.2),
        angle: Math.random() * Math.PI * 2,
        distance: this.radius * (0.3 + Math.random() * 0.5),
        color: randomColor()
      });
    }
  }

  /**
   * Draw the planet on the canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} offsetX - X offset for camera
   * @param {number} offsetY - Y offset for camera
   */
  draw(ctx, offsetX, offsetY) {
    const screenX = this.x - offsetX;
    const screenY = this.y - offsetY;
    
    // Draw ring if planet has rings
    if (this.hasRings) {
      ctx.beginPath();
      ctx.ellipse(
        screenX, 
        screenY, 
        this.ringSize, 
        this.ringSize * 0.3, 
        Math.PI / 3, 
        0, 
        Math.PI * 2
      );
      ctx.strokeStyle = this.ringColor;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Draw planet
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // Draw features (craters, mountains, etc.)
    for (const feature of this.features) {
      const featureX = screenX + Math.cos(feature.angle) * feature.distance;
      const featureY = screenY + Math.sin(feature.angle) * feature.distance;
      
      ctx.beginPath();
      ctx.arc(featureX, featureY, feature.size, 0, Math.PI * 2);
      ctx.fillStyle = feature.color;
      ctx.fill();
    }
  }
} 