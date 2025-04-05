/**
 * @fileoverview Utility functions for the Planet Explorer game
 */

/**
 * Calculates the distance between two points
 * @param {number} x1 - x coordinate of first point
 * @param {number} y1 - y coordinate of first point
 * @param {number} x2 - x coordinate of second point
 * @param {number} y2 - y coordinate of second point
 * @returns {number} The distance between the points
 */
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Checks for collision between two circular objects
 * @param {Object} obj1 - First object with x, y, and radius properties
 * @param {Object} obj2 - Second object with x, y, and radius properties
 * @returns {boolean} True if objects are colliding
 */
function checkCollision(obj1, obj2) {
  const dist = distance(obj1.x, obj1.y, obj2.x, obj2.y);
  return dist < obj1.radius + obj2.radius;
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer between min and max
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random color in the format 'rgb(r, g, b)'
 * @returns {string} Random color
 */
function randomColor() {
  const r = randomInt(0, 255);
  const g = randomInt(0, 255);
  const b = randomInt(0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Creates star data for the background
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} count - Number of stars to create
 * @returns {Array<Object>} Array of star objects with x, y, size properties
 */
function createStars(width, height, count) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: randomInt(0, width),
      y: randomInt(0, height),
      size: Math.random() * 2 + 0.5
    });
  }
  return stars;
}

/**
 * Clamps a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
} 