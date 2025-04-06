/**
 * @fileoverview System for handling player interactions with game objects, primarily planets.
 */

import { checkCollision } from './utils.js';
import { GameState } from './game.js'; // Need to import GameState if it's defined in game.js

export class InteractionSystem {
  /**
   * Creates an instance of the InteractionSystem.
   * @param {EntityManager} entityManager - The game's entity manager.
   * @param {UI} ui - The game's UI manager.
   * @param {Game} game - The main game instance (to access setGameState).
   */
  constructor(entityManager, ui, game) {
    this.entityManager = entityManager;
    this.ui = ui;
    this.game = game; // Store the game instance
  }

  /**
   * Updates the interaction logic, called each frame.
   * @param {number} deltaTime - Time since the last update.
   */
  update(deltaTime) {
    // We only need to check interactions when the game is in the FLYING state
    if (this.game.gameState !== GameState.FLYING) {
      return;
    }

    const playerShip = this.entityManager.getPlayerShip();
    if (!playerShip) return; // No player, no interactions

    let hoveredPlanet = null;
    const allPlanets = this.entityManager.getAllPlanets();

    // Check collision with planets
    for (const planet of allPlanets) {
      if (checkCollision(playerShip, planet)) {
        hoveredPlanet = planet;
        break;
      }
    }

    // Handle planet hover and landing logic
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
        this.game.setGameState(GameState.PLANET_VIEW);

        // Reset the E key immediately after initiating landing to prevent issues
        playerShip.keys.e = false;

        // Delay slightly to prevent immediate E key re-trigger from closing the panel
        // Note: The responsibility of showing the UI panel is still tied to the Game's UI instance
        // and the callback needs to set the Game's state back.
        setTimeout(() => {
          this.ui.showPlanetInfo(hoveredPlanet, () => {
            // Callback when leaving planet view:
            this.game.setGameState(GameState.FLYING);
            // Manually reset E key state as the keyup event might have been missed
            if (playerShip) playerShip.keys.e = false; 
            this.ui.showMessage(`Left ${hoveredPlanet.name}`, 3000);
          });
        }, 100);
      }
    } else {
      // Clear any hover messages when not over a planet
      // Only clear if the message is currently a landing prompt (or similar)
      // This check might need refinement depending on other message types
      if (this.ui.getCurrentMessage().includes('Press E') || this.ui.getCurrentMessage().includes('Slow down')) {
           this.ui.clearMessage();
      }
    }
  }
} 