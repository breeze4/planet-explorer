/**
 * @fileoverview Main entry point for the Planet Explorer game.
 */

import { Game } from './js/game.js';

// Wait for the DOM to be fully loaded before starting the game
document.addEventListener('DOMContentLoaded', () => {
  console.log('[main.js] DOM loaded. Initializing game...');
  // Create the main game instance
  const game = new Game();
  console.log('[main.js] Game initialized.');
}); 