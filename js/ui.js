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
    
    /** @type {boolean} */
    this.isPlanetViewActive = false;
    /** @type {number|null} */
    this.messageTimeout = null;
    
    // Set up event listeners
    this.leaveButton.addEventListener('click', this.hidePlanetInfo.bind(this));
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