/**
 * @fileoverview Main game logic for the Planet Explorer game
 */

import { Spaceship } from './spaceship';
import { Planet } from './planet';
import { EntityManager } from './EntityManager.js';
import { UI } from './ui'; // Assuming UI is exported from ui.js
import { createStars, randomInt, distance, clamp, checkCollision } from './utils'; // Assuming these are exported from utils.js

/**
 * Main game class
 */
export class Game { // Added export
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

    // Create the Entity Manager
    /** @type {EntityManager} */
    this.entityManager = new EntityManager();
    
    // Get initial size scale from UI
    const initialSizeScale = this.ui.getInitialSizeScale();
    const initialShipWidth = this.baseShipWidth * initialSizeScale;
    const initialShipHeight = this.baseShipHeight * initialSizeScale;
    
    // Create player spaceship and add to EntityManager
    const playerShip = new Spaceship(
      window.innerWidth / 2, 
      window.innerHeight / 2,
      this.config.speedScale, // Pass initial speed scale
      initialShipWidth,       // Pass initial calculated width
      initialShipHeight       // Pass initial calculated height
    );
    this.entityManager.addSpaceship(playerShip);

    // Removed: this.spaceship = ...
    // Removed: this.planets = [];
    
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
    this.isPaused = false; // Pause state remains for now, might be refactored later
    
    // Generate game world (planets are added to entityManager inside this method)
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
    const playerShip = this.entityManager.getPlayerShip();
    if (playerShip) {
        playerShip.setSpeedScale(scale);
    }
  }
  
  /**
   * Resize the canvas to match the window size
   */
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // TODO: Potentially notify UI or other components about resize?
  }
  
  /**
   * Generate the game world
   */
  generateWorld() {
    // Create stars for background
    this.stars = createStars(this.worldWidth, this.worldHeight, 200);
    
    // Create planets and add them to the EntityManager
    const numPlanets = randomInt(8, 12);
    const currentPlanets = this.entityManager.getAllPlanets(); // Get existing planets for collision check

    for (let i = 0; i < numPlanets; i++) {
      // Ensure planets are spread out
      let validPosition = false;
      let x, y, radius;
      let attempts = 0;
      const maxAttempts = 50; // Prevent infinite loop
      
      while (!validPosition && attempts < maxAttempts) {
        radius = randomInt(40, 100);
        x = randomInt(radius * 2, this.worldWidth - radius * 2);
        y = randomInt(radius * 2, this.worldHeight - radius * 2);
        attempts++;
        
        // Check if this position conflicts with existing planets
        validPosition = true;
        for (const planet of currentPlanets) {
          const dist = distance(x, y, planet.x, planet.y);
          const minDist = radius + planet.radius + 200; // Add spacing between planets
          
          if (dist < minDist) {
            validPosition = false;
            break;
          }
        }
        
        // Also ensure not too close to starting position (player ship starts near center)
        const playerShip = this.entityManager.getPlayerShip();
        const startX = playerShip ? playerShip.x : this.worldWidth / 2;
        const startY = playerShip ? playerShip.y : this.worldHeight / 2;
        const distToStart = distance(x, y, startX, startY);
        if (distToStart < 300) {
          validPosition = false;
        }
      }

      if (validPosition) {
          const newPlanet = new Planet(x, y, radius);
          this.entityManager.addPlanet(newPlanet);
          currentPlanets.push(newPlanet); // Add to local list for subsequent checks in this loop
      } else {
          console.warn('Could not find valid position for planet after', maxAttempts, 'attempts.');
      }
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
    // Skip update if in planet view (controlled by UI)
    if (this.ui.isPlanetView()) {
      return;
    }
    
    // Update all entities via EntityManager
    this.entityManager.update(deltaTime, this.worldWidth, this.worldHeight);

    const playerShip = this.entityManager.getPlayerShip();
    if (!playerShip) return; // Exit if player ship doesn't exist for some reason
    
    // Update camera to follow spaceship
    this.cameraX = playerShip.x - this.canvas.width / 2;
    this.cameraY = playerShip.y - this.canvas.height / 2;
    
    // Keep camera within world bounds
    this.cameraX = clamp(this.cameraX, 0, this.worldWidth - this.canvas.width);
    this.cameraY = clamp(this.cameraY, 0, this.worldHeight - this.canvas.height);
    
    // Keep spaceship within world bounds (should this be in Spaceship.update or EntityManager?)
    // Let's keep it here for now, affects the player ship specifically.
    playerShip.x = clamp(playerShip.x, 0, this.worldWidth);
    playerShip.y = clamp(playerShip.y, 0, this.worldHeight);
    
    // Update UI elements
    this.ui.updateBoostMeter(playerShip.getBoostPercentage());
    
    // Check if spaceship is over a planet (for info display without landing)
    let hoveredPlanet = null;
    const allPlanets = this.entityManager.getAllPlanets();
    for (const planet of allPlanets) {
      // Assuming checkCollision works with spaceship and planet objects
      if (checkCollision(playerShip, planet)) { 
        hoveredPlanet = planet;
        break;
      }
    }
    
    // Handle planet hover and landing
    if (hoveredPlanet) {
      const speedThreshold = playerShip.maxSpeed * 0.5;
      const canLand = Math.abs(playerShip.speed) < speedThreshold;
      
      // Show hover message
      if (canLand) {
        this.ui.showMessage(`Press E to land on ${hoveredPlanet.name}`, 0); // Keep showing while hovering
      } else {
        this.ui.showMessage(`Slow down to land on ${hoveredPlanet.name}`, 0);
      }
      
      // Handle E key press for landing
      if (playerShip.keys.e && canLand) {
        // Land on planet - Pause game
        this.isPaused = true; 
        
        // Show planet info panel via UI
        // Delay slightly to prevent immediate E key re-trigger from closing the panel
        setTimeout(() => {
          this.ui.showPlanetInfo(hoveredPlanet, () => {
            // Callback when leaving planet view:
            this.isPaused = false; // Resume game
            // Manually reset E key state as the keyup event might have been missed while paused
            if (playerShip) playerShip.keys.e = false; 
            this.ui.showMessage(`Left ${hoveredPlanet.name}`, 3000); // Show brief message
          });
        }, 100); 
        
        // Reset the E key immediately after initiating landing to prevent issues
        playerShip.keys.e = false;
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
    
    // Draw stars in background (relative to camera)
    this.ctx.fillStyle = '#ffffff';
    for (const star of this.stars) {
      const screenX = star.x - this.cameraX;
      const screenY = star.y - this.cameraY;
      
      // Only draw stars that are potentially visible on screen
      if (screenX >= -1 && screenX <= this.canvas.width + 1 && 
          screenY >= -1 && screenY <= this.canvas.height + 1) {
        this.ctx.fillRect(screenX, screenY, star.size, star.size);
      }
    }
    
    // Delegate rendering of planets and spaceships to EntityManager
    this.entityManager.render(this.ctx, this.cameraX, this.cameraY);

    // Draw minimap
    this.drawMinimap();

    // Note: UI elements (like boost meter, messages, planet info) are likely 
    // handled by the UI class itself using HTML/CSS, not drawn on canvas here.
  }
  
  /**
   * Draw the minimap
   */
  drawMinimap() {
    const minimapSize = 200;
    const minimapX = this.canvas.width - minimapSize - 20;
    const minimapY = 20;
    const padding = 5;
    const scale = minimapSize / Math.max(this.worldWidth, this.worldHeight);

    // Background
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
    this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);

    // Draw planets on minimap
    const allPlanets = this.entityManager.getAllPlanets();
    for (const planet of allPlanets) {
        const mapX = minimapX + planet.x * scale;
        const mapY = minimapY + planet.y * scale;
        const mapRadius = Math.max(1, planet.radius * scale); // Ensure minimum size
        this.ctx.fillStyle = planet.color;
        this.ctx.beginPath();
        this.ctx.arc(mapX, mapY, mapRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Draw player spaceship on minimap
    const playerShip = this.entityManager.getPlayerShip();
    if (playerShip) {
        const mapShipX = minimapX + playerShip.x * scale;
        const mapShipY = minimapY + playerShip.y * scale;
        this.ctx.fillStyle = '#00ff00'; // Green for player
        this.ctx.fillRect(mapShipX - 2, mapShipY - 2, 4, 4); // Simple square for ship
    }
    
    // Optional: Draw other ships if EntityManager supports them
    // const otherShips = this.entityManager.getAllSpaceships().filter(s => s !== playerShip);
    // for (const ship of otherShips) {
    //     const mapShipX = minimapX + ship.x * scale;
    //     const mapShipY = minimapY + ship.y * scale;
    //     this.ctx.fillStyle = '#ff0000'; // Red for others (example)
    //     this.ctx.fillRect(mapShipX - 1, mapShipY - 1, 2, 2);
    // }
  }

  /**
   * Set up listeners for UI controls
   */
  setupUIListeners() {
    // Listen for speed slider changes
    this.ui.onSpeedChange((newSpeedScale) => {
      this.setGameSpeed(newSpeedScale);
    });

    // Listen for size slider changes
    this.ui.onSizeChange((newSizeScale) => {
      const playerShip = this.entityManager.getPlayerShip();
      if (playerShip) {
          const newWidth = this.baseShipWidth * newSizeScale;
          const newHeight = this.baseShipHeight * newSizeScale;
          playerShip.setSize(newWidth, newHeight);
      }
    });
  }
}

// Helper functions (assuming they are defined elsewhere or in utils.js)
// function randomColor() { ... }
// function randomInt(min, max) { ... }
// function distance(x1, y1, x2, y2) { ... }
// function clamp(value, min, max) { ... }
// function checkCollision(obj1, obj2) { ... }
// function createStars(worldWidth, worldHeight, count) { ... }

// Global instantiation (moved to main.js or similar entry point)
// const game = new Game(); 