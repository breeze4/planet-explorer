/**
 * @fileoverview UI handling for the Planet Explorer game
 */

/**
 * UI manager for the game
 */
class UI {
  /**
   * Create the UI manager
   */
  constructor() {
    /** @type {HTMLElement} */
    this.uiOverlay = document.getElementById('ui-overlay');
    /** @type {HTMLElement} */
    this.planetInfo = document.getElementById('planet-info');
    /** @type {HTMLElement} */
    this.planetName = document.getElementById('planet-name');
    /** @type {HTMLElement} */
    this.planetDescription = document.getElementById('planet-description');
    /** @type {HTMLElement} */
    this.leaveButton = document.getElementById('leave-planet');
    /** @type {HTMLElement} */
    this.boostFill = document.getElementById('boost-fill');
    /** @type {HTMLElement} */
    this.messageDisplay = document.getElementById('message-display');
    
    // Speed Slider Elements (Assuming these might exist or be added similarly)
    /** @type {HTMLInputElement | null} */
    this.speedScaleSlider = document.getElementById('speed-scale-slider');
    /** @type {HTMLElement | null} */
    this.speedScaleValue = document.getElementById('speed-scale-value');
    /** @type {Function | null} */
    this.onSpeedChangeCallback = null;
    
    // Size Slider Elements
    /** @type {HTMLInputElement | null} */
    this.sizeScaleSlider = document.getElementById('size-scale-slider');
    /** @type {HTMLElement | null} */
    this.sizeScaleValue = document.getElementById('size-scale-value');
    /** @type {Function | null} */
    this.onSizeChangeCallback = null;
    
    /** @type {boolean} */
    this.isPlanetViewActive = false;
    /** @type {number|null} */
    this.messageTimeout = null;
    
    // Set up event listeners
    this.leaveButton.addEventListener('click', this.hidePlanetInfo.bind(this));
    
    // Set up slider listeners if elements exist
    if (this.speedScaleSlider && this.speedScaleValue) {
      this.speedScaleSlider.addEventListener('input', (event) => {
        const scale = parseFloat(event.target.value);
        this.speedScaleValue.textContent = `${scale.toFixed(1)}x`;
        if (this.onSpeedChangeCallback) {
          this.onSpeedChangeCallback(scale);
        }
      });
    }

    if (this.sizeScaleSlider && this.sizeScaleValue) {
      this.sizeScaleSlider.addEventListener('input', (event) => {
        const scale = parseFloat(event.target.value);
        this.sizeScaleValue.textContent = `${scale.toFixed(1)}x`;
        if (this.onSizeChangeCallback) {
          this.onSizeChangeCallback(scale);
        }
      });
    }
  }
  
  /**
   * Register a listener for speed scale changes
   * @param {Function} callback - Function to call with the new scale value
   */
  registerSpeedChangeListener(callback) {
    this.onSpeedChangeCallback = callback;
    // Optionally call immediately with initial value
    // if (this.speedScaleSlider) {
    //   callback(parseFloat(this.speedScaleSlider.value));
    // }
  }

  /**
   * Register a listener for size scale changes
   * @param {Function} callback - Function to call with the new scale value
   */
  registerSizeChangeListener(callback) {
    this.onSizeChangeCallback = callback;
    // Optionally call immediately with initial value
    // if (this.sizeScaleSlider) {
    //   callback(parseFloat(this.sizeScaleSlider.value));
    // }
  }

  /**
   * Get the initial value of the speed scale slider
   * @returns {number} Initial speed scale
   */
  getInitialSpeedScale() {
    return this.speedScaleSlider ? parseFloat(this.speedScaleSlider.value) : 0.3; // Default if slider not found
  }
  
  /**
   * Get the initial value of the size scale slider
   * @returns {number} Initial size scale
   */
  getInitialSizeScale() {
    return this.sizeScaleSlider ? parseFloat(this.sizeScaleSlider.value) : 1.4; // Default if slider not found
  }
  
  /**
   * Show planet information
   * @param {Planet} planet - Planet to display information for
   * @param {Function} onLeave - Callback function when leaving the planet
   */
  showPlanetInfo(planet, onLeave) {
    this.isPlanetViewActive = true;
    this.planetName.textContent = planet.name;
    this.planetDescription.textContent = planet.description;
    
    // Make sure the UI overlay is visible
    this.uiOverlay.classList.remove('hidden');
    
    // Make the planet info visible
    this.planetInfo.classList.add('visible');
    
    // Store the callback for when the leave button is clicked
    this._onLeaveCallback = onLeave;
    
    // Clear any active messages
    this.clearMessage();
  }
  
  /**
   * Hide planet information
   */
  hidePlanetInfo() {
    this.isPlanetViewActive = false;
    this.planetInfo.classList.remove('visible');
    
    // Call the onLeave callback if it exists
    if (this._onLeaveCallback) {
      this._onLeaveCallback();
      this._onLeaveCallback = null;
    }
  }
  
  /**
   * Show a temporary message in the HUD
   * @param {string} message - The message to display
   * @param {number} [duration=3000] - Duration to show the message in milliseconds
   */
  showMessage(message, duration = 3000) {
    // Clear any existing timeout
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    
    this.messageDisplay.textContent = message;
    this.messageDisplay.classList.add('active');
    
    if (duration > 0) {
      this.messageTimeout = setTimeout(() => {
        this.clearMessage();
      }, duration);
    }
  }
  
  /**
   * Clear the current message
   */
  clearMessage() {
    this.messageDisplay.classList.remove('active');
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
  }
  
  /**
   * Update the boost meter
   * @param {number} percentage - Boost charge percentage (0-100)
   */
  updateBoostMeter(percentage) {
    this.boostFill.style.width = `${percentage}%`;
    
    // Change color based on boost level
    if (percentage > 70) {
      this.boostFill.style.backgroundColor = '#4dff4d'; // Green when highly charged
    } else if (percentage > 30) {
      this.boostFill.style.backgroundColor = '#4dacff'; // Blue for medium charge
    } else {
      this.boostFill.style.backgroundColor = '#ff4d4d'; // Red for low charge
    }
  }
  
  /**
   * Check if the planet view is currently active
   * @returns {boolean} True if planet view is active
   */
  isPlanetView() {
    return this.isPlanetViewActive;
  }
} 