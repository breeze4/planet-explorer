/**
 * @fileoverview Spaceship class for the Planet Explorer game
 */

/**
 * Class representing the player's spaceship
 */
class Spaceship {
  /**
   * Create a spaceship
   * @param {number} x - Initial X coordinate
   * @param {number} y - Initial Y coordinate
   * @param {number} [speedScale=0.3] - Speed scaling factor (1.0 = 100% speed)
   * @param {number} [width=42] - Optional width of the spaceship
   * @param {number} [height=21] - Optional height of the spaceship
   */
  constructor(x, y, speedScale = 0.3, width = 42, height = 21) {
    /** @type {number} */
    this.x = x;
    /** @type {number} */
    this.y = y;
    /** @type {number} */
    this.width = width;
    /** @type {number} */
    this.height = height;
    /** @type {number} */
    this.rotation = 0;
    /** @type {number} */
    this.speed = 0;
    
    // Sprite loading
    /** @type {Image} */
    this.sprite = new Image();
    /** @type {boolean} */
    this.spriteLoaded = false;
    this.sprite.onload = () => {
      this.spriteLoaded = true;
      // Optional: Update width/height based on image natural dimensions
      // this.width = this.sprite.naturalWidth;
      // this.height = this.sprite.naturalHeight;
    };
    this.sprite.onerror = () => {
      console.error(`Error loading sprite: assets/triangle_ship.png`);
      // Keep spriteLoaded = false, fallback drawing will be used
    };
    this.sprite.src = 'assets/triangle_ship.png'; // Path to the sprite

    // Speed configuration
    /** @type {number} */
    this.speedScale = speedScale;
    /** @type {number} */
    this.baseMaxSpeed = 5;
    /** @type {number} */
    this.baseAcceleration = 0.1;
    /** @type {number} */
    this.baseDeceleration = 0.05;
    /** @type {number} */
    this.baseRotationSpeed = 0.1;
    /** @type {number} */
    this.baseBoostSpeed = 10;
    
    // Apply speed scaling
    /** @type {number} */
    this.maxSpeed = this.baseMaxSpeed * this.speedScale;
    /** @type {number} */
    this.acceleration = this.baseAcceleration * this.speedScale;
    /** @type {number} */
    this.deceleration = this.baseDeceleration * this.speedScale;
    /** @type {number} */
    this.rotationSpeed = this.baseRotationSpeed * this.speedScale;
    
    // Boost properties
    /** @type {number} */
    this.boostCharge = 0;
    /** @type {number} */
    this.maxBoostCharge = 100;
    /** @type {number} */
    this.boostChargeRate = 0.5;
    /** @type {number} */
    this.boostSpeed = this.baseBoostSpeed * this.speedScale;
    /** @type {boolean} */
    this.isBoosting = false;
    /** @type {number} */
    this.boostDecayRate = 2;
    
    // Collision properties
    /** @type {number} */
    this.radius = this.width / 2;
    
    // Controls state
    /** @type {Object<string, boolean>} */
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      space: false,
      e: false  // Added E key for landing on planets
    };
    
    // Set up event listeners for controls
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }
  
  /**
   * Set a new size for the spaceship
   * @param {number} newWidth - The new width
   * @param {number} newHeight - The new height
   */
  setSize(newWidth, newHeight) {
    this.width = newWidth;
    this.height = newHeight;
    this.radius = this.width / 2; // Update radius based on new width
  }
  
  /**
   * Set a new speed scaling factor
   * @param {number} scale - New scaling factor (1.0 = 100% speed)
   */
  setSpeedScale(scale) {
    this.speedScale = scale;
    this.maxSpeed = this.baseMaxSpeed * this.speedScale;
    this.acceleration = this.baseAcceleration * this.speedScale;
    this.deceleration = this.baseDeceleration * this.speedScale;
    this.rotationSpeed = this.baseRotationSpeed * this.speedScale;
    this.boostSpeed = this.baseBoostSpeed * this.speedScale;
  }
  
  /**
   * Handle keydown events
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyDown(event) {
    switch(event.key.toLowerCase()) {
      case 'w':
        this.keys.w = true;
        break;
      case 'a':
        this.keys.a = true;
        break;
      case 's':
        this.keys.s = true;
        break;
      case 'd':
        this.keys.d = true;
        break;
      case ' ':
        this.keys.space = true;
        break;
      case 'e':
        this.keys.e = true;
        break;
    }
  }
  
  /**
   * Handle keyup events
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyUp(event) {
    switch(event.key.toLowerCase()) {
      case 'w':
        this.keys.w = false;
        break;
      case 'a':
        this.keys.a = false;
        break;
      case 's':
        this.keys.s = false;
        break;
      case 'd':
        this.keys.d = false;
        break;
      case ' ':
        this.keys.space = false;
        break;
      case 'e':
        this.keys.e = false;
        break;
    }
  }
  
  /**
   * Update spaceship state
   */
  update() {
    // Rotation based on A and D keys
    if (this.keys.a) {
      this.rotation -= this.rotationSpeed;
    }
    
    if (this.keys.d) {
      this.rotation += this.rotationSpeed;
    }
    
    // Acceleration based on W and S keys
    if (this.keys.w) {
      this.speed += this.acceleration;
      if (this.speed > this.maxSpeed) {
        this.speed = this.maxSpeed;
      }
    } else if (this.keys.s) {
      this.speed -= this.acceleration;
      if (this.speed < -this.maxSpeed) {
        this.speed = -this.maxSpeed;  // Allow full reverse speed equal to forward speed
      }
    } else {
      // Apply deceleration when not accelerating
      if (this.speed > 0) {
        this.speed -= this.deceleration;
        if (this.speed < 0) this.speed = 0;
      } else if (this.speed < 0) {
        this.speed += this.deceleration;
        if (this.speed > 0) this.speed = 0;
      }
    }
    
    // Handle boost
    if (!this.isBoosting) {
      // Charge boost when not using it
      if (this.boostCharge < this.maxBoostCharge) {
        this.boostCharge += this.boostChargeRate;
        if (this.boostCharge > this.maxBoostCharge) {
          this.boostCharge = this.maxBoostCharge;
        }
      }
      
      // Activate boost when spacebar is pressed and we have charge
      if (this.keys.space && this.boostCharge > 0) {
        this.isBoosting = true;
      }
    } else {
      // Consume boost charge
      this.boostCharge -= this.boostDecayRate;
      
      // End boost when charge depleted or space released
      if (this.boostCharge <= 0 || !this.keys.space) {
        this.boostCharge = Math.max(0, this.boostCharge);
        this.isBoosting = false;
      }
    }
    
    // Calculate actual speed with boost
    const currentSpeed = this.isBoosting ? this.speed + this.boostSpeed : this.speed;
    
    // Update position based on speed and rotation
    this.x += Math.cos(this.rotation) * currentSpeed;
    this.y += Math.sin(this.rotation) * currentSpeed;
  }
  
  /**
   * Draw the spaceship
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} offsetX - X offset for camera
   * @param {number} offsetY - Y offset for camera
   */
  draw(ctx, offsetX, offsetY) {
    const screenX = this.x - offsetX;
    const screenY = this.y - offsetY;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.rotation);
    
    // Draw spaceship sprite if loaded, otherwise draw fallback shape
    if (this.spriteLoaded) {
      // Draw sprite centered at the ship's origin
      ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      // Fallback drawing: Draw original spaceship body
      ctx.beginPath();
      ctx.moveTo(this.width / 2, 0);
      ctx.lineTo(-this.width / 2, this.height / 2);
      ctx.lineTo(-this.width / 3, 0);
      ctx.lineTo(-this.width / 2, -this.height / 2);
      ctx.closePath();
      
      ctx.fillStyle = '#4dacff'; // Default color if sprite fails
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw engine glow when accelerating or boosting (drawn on top of sprite or fallback)
    if (this.keys.w || this.isBoosting) {
      ctx.beginPath();
      ctx.moveTo(-this.width / 3, 0);
      ctx.lineTo(-this.width * 0.7, this.height / 3);
      ctx.lineTo(-this.width * 0.9, 0);
      ctx.lineTo(-this.width * 0.7, -this.height / 3);
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(
        -this.width / 3, 0, 
        -this.width * 0.9, 0
      );
      
      if (this.isBoosting) {
        gradient.addColorStop(0, 'rgba(255, 153, 0, 0.9)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(77, 172, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(77, 172, 255, 0)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  /**
   * Get boost charge percentage
   * @returns {number} Percentage of boost charge (0-100)
   */
  getBoostPercentage() {
    return (this.boostCharge / this.maxBoostCharge) * 100;
  }
} 