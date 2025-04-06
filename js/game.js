/**
 * @fileoverview Main game logic for the Planet Explorer game
 */

/**
 * Main game class
 */
class Game {
  /**
   * Create the game
   * @param {Object} [options] - Game configuration options
   * @param {number} [options.speedScale=0.3] - Speed scaling factor (1.0 = 100% speed)
   */
  constructor(options = {}) {
    // Game configuration
    this.config = {
      speedScale: options.speedScale || 0.3
    };
    
    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById('game-canvas');
    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext('2d');
    
    // Store base ship dimensions
    this.baseShipWidth = 42;
    this.baseShipHeight = 21;
    
    // Resize canvas to full window
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    
    // Set up game state
    /** @type {UI} */
    this.ui = new UI();
    
    // Get initial size scale from UI
    const initialSizeScale = this.ui.getInitialSizeScale();
    const initialShipWidth = this.baseShipWidth * initialSizeScale;
    const initialShipHeight = this.baseShipHeight * initialSizeScale;
    
    /** @type {Spaceship} */
    this.spaceship = new Spaceship(
      window.innerWidth / 2, 
      window.innerHeight / 2,
      this.config.speedScale, // Pass initial speed scale
      initialShipWidth,       // Pass initial calculated width
      initialShipHeight       // Pass initial calculated height
    );
    /** @type {Array<Planet>} */
    this.planets = [];
    /** @type {Array<Object>} */
    this.stars = [];
    
    // Camera position
    /** @type {number} */
    this.cameraX = 0;
    /** @type {number} */
    this.cameraY = 0;
    
    // Game space dimensions
    /** @type {number} */
    this.worldWidth = 5000;
    /** @type {number} */
    this.worldHeight = 5000;
    
    // Game state
    /** @type {boolean} */
    this.isPaused = false;
    
    // Generate game world
    this.generateWorld();
    
    // Start the game loop
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));

    // Register UI listeners
    this.setupUIListeners();
  }
  
  /**
   * Change the game speed
   * @param {number} scale - New speed scale (1.0 = 100% speed)
   */
  setGameSpeed(scale) {
    this.config.speedScale = scale;
    this.spaceship.setSpeedScale(scale);
  }
  
  /**
   * Resize the canvas to match the window size
   */
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  /**
   * Generate the game world
   */
  generateWorld() {
    // Create stars for background
    this.stars = createStars(this.worldWidth, this.worldHeight, 200);
    
    // Create planets
    const numPlanets = randomInt(8, 12);
    for (let i = 0; i < numPlanets; i++) {
      // Ensure planets are spread out
      let validPosition = false;
      let x, y, radius;
      
      while (!validPosition) {
        radius = randomInt(40, 100);
        x = randomInt(radius * 2, this.worldWidth - radius * 2);
        y = randomInt(radius * 2, this.worldHeight - radius * 2);
        
        // Check if this position conflicts with existing planets
        validPosition = true;
        for (const planet of this.planets) {
          const dist = distance(x, y, planet.x, planet.y);
          const minDist = radius + planet.radius + 200; // Add spacing between planets
          
          if (dist < minDist) {
            validPosition = false;
            break;
          }
        }
        
        // Also ensure not too close to starting position
        const distToStart = distance(x, y, this.worldWidth / 2, this.worldHeight / 2);
        if (distToStart < 300) {
          validPosition = false;
        }
      }
      
      this.planets.push(new Planet(x, y, radius));
    }
  }
  
  /**
   * Main game loop
   * @param {number} timestamp - Current timestamp
   */
  gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    // Only update if game is not paused
    if (!this.isPaused) {
      this.update(deltaTime);
    }
    
    this.render();
    
    // Request next frame
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  /**
   * Update game state
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Skip update if in planet view
    if (this.ui.isPlanetView()) {
      return;
    }
    
    // Update spaceship
    this.spaceship.update();
    
    // Update camera to follow spaceship
    this.cameraX = this.spaceship.x - this.canvas.width / 2;
    this.cameraY = this.spaceship.y - this.canvas.height / 2;
    
    // Keep camera within world bounds
    this.cameraX = clamp(this.cameraX, 0, this.worldWidth - this.canvas.width);
    this.cameraY = clamp(this.cameraY, 0, this.worldHeight - this.canvas.height);
    
    // Keep spaceship within world bounds
    this.spaceship.x = clamp(this.spaceship.x, 0, this.worldWidth);
    this.spaceship.y = clamp(this.spaceship.y, 0, this.worldHeight);
    
    // Update UI elements
    this.ui.updateBoostMeter(this.spaceship.getBoostPercentage());
    
    // Check if spaceship is over a planet (for info display without landing)
    let hoveredPlanet = null;
    for (const planet of this.planets) {
      if (checkCollision(this.spaceship, planet)) {
        hoveredPlanet = planet;
        break;
      }
    }
    
    // Handle planet hover and landing
    if (hoveredPlanet) {
      const speedThreshold = this.spaceship.maxSpeed * 0.5;
      const canLand = Math.abs(this.spaceship.speed) < speedThreshold;
      
      // Show hover message
      if (canLand) {
        this.ui.showMessage(`Press E to land on ${hoveredPlanet.name}`, 0); // Keep showing while hovering
      } else {
        this.ui.showMessage(`Slow down to land on ${hoveredPlanet.name}`, 0);
      }
      
      // Handle E key press for landing
      if (this.spaceship.keys.e && canLand) {
        // Land on planet
        this.isPaused = true;
        
        // Show planet info after a short delay to prevent immediate E key re-triggering
        setTimeout(() => {
          this.ui.showPlanetInfo(hoveredPlanet, () => {
            // Resume game when leaving planet
            this.isPaused = false;
            // We need to manually reset this since we might still be over the planet
            this.spaceship.keys.e = false;
            this.ui.showMessage(`Left ${hoveredPlanet.name}`, 3000);
          });
        }, 100);
        
        // Reset the E key to prevent immediate re-landing
        this.spaceship.keys.e = false;
      }
    } else {
      // Clear any hover messages when not over a planet
      this.ui.clearMessage();
    }
  }
  
  /**
   * Render game state
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw stars in background
    this.ctx.fillStyle = '#ffffff';
    for (const star of this.stars) {
      // Only draw stars that are visible on screen
      if (
        star.x >= this.cameraX - 10 &&
        star.x <= this.cameraX + this.canvas.width + 10 &&
        star.y >= this.cameraY - 10 &&
        star.y <= this.cameraY + this.canvas.height + 10
      ) {
        this.ctx.beginPath();
        this.ctx.arc(
          star.x - this.cameraX,
          star.y - this.cameraY,
          star.size,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
      }
    }
    
    // Draw planets
    for (const planet of this.planets) {
      // Only draw planets that are visible on screen
      if (
        planet.x + planet.radius + 50 >= this.cameraX &&
        planet.x - planet.radius - 50 <= this.cameraX + this.canvas.width &&
        planet.y + planet.radius + 50 >= this.cameraY &&
        planet.y - planet.radius - 50 <= this.cameraY + this.canvas.height
      ) {
        planet.draw(this.ctx, this.cameraX, this.cameraY);
      }
    }
    
    // Draw spaceship
    this.spaceship.draw(this.ctx, this.cameraX, this.cameraY);
    
    // Draw minimap
    this.drawMinimap();
  }
  
  /**
   * Draw a minimap in the corner
   */
  drawMinimap() {
    const mapSize = 150;
    const mapX = this.canvas.width - mapSize - 20;
    const mapY = 20;
    const mapScale = mapSize / this.worldWidth;
    
    // Draw map background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(mapX, mapY, mapSize, mapSize);
    this.ctx.strokeStyle = '#4dacff';
    this.ctx.strokeRect(mapX, mapY, mapSize, mapSize);
    
    // Draw visible area
    const viewX = mapX + this.cameraX * mapScale;
    const viewY = mapY + this.cameraY * mapScale;
    const viewWidth = this.canvas.width * mapScale;
    const viewHeight = this.canvas.height * mapScale;
    
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.strokeRect(viewX, viewY, viewWidth, viewHeight);
    
    // Draw planets on minimap
    for (const planet of this.planets) {
      this.ctx.fillStyle = planet.color;
      this.ctx.beginPath();
      this.ctx.arc(
        mapX + planet.x * mapScale,
        mapY + planet.y * mapScale,
        planet.radius * mapScale * 1.5, // Make planets a bit bigger on the map
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
    
    // Draw spaceship on minimap
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(
      mapX + this.spaceship.x * mapScale,
      mapY + this.spaceship.y * mapScale,
      3,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  /**
   * Sets up listeners for UI controls like sliders.
   */
  setupUIListeners() {
    // Listener for speed changes (assuming ui.js handles this now)
    this.ui.registerSpeedChangeListener((newScale) => {
      this.setGameSpeed(newScale); // Reuse existing speed setting logic
    });

    // Listener for size changes
    this.ui.registerSizeChangeListener((newScale) => {
      const newWidth = this.baseShipWidth * newScale;
      const newHeight = this.baseShipHeight * newScale;
      this.spaceship.setSize(newWidth, newHeight);
    });
  }
}

// Start the game when the window loads
window.addEventListener('load', () => {
  // Create game with 30% of original speed
  new Game({ speedScale: 0.3 });
}); 