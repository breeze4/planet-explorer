/**
 * @fileoverview Manages game entities like spaceships and planets.
 */

// Assuming Spaceship and Planet classes are globally available or loaded via <script> tags
// If using modules, uncomment the following lines:
// import { Spaceship } from './spaceship.js'; 
// import { Planet } from './planet.js';

/**
 * Manages collections of game entities.
 */
export class EntityManager {
    /**
     * Creates an instance of EntityManager.
     */
    constructor() {
        /** 
         * @type {Array<Spaceship>} 
         * @private 
         */
        this.spaceships = [];
        
        /** 
         * @type {Array<Planet>} 
         * @private 
         */
        this.planets = [];
        // Could potentially add other entity types later (asteroids, stations etc.)
    }

    /**
     * Adds a spaceship to the manager.
     * @param {Spaceship} ship - The spaceship instance to add.
     */
    addSpaceship(ship) {
        this.spaceships.push(ship);
    }

    /**
     * Adds a planet to the manager.
     * @param {Planet} planet - The planet instance to add.
     */
    addPlanet(planet) {
        this.planets.push(planet);
    }

    /**
     * Gets the player ship.
     * Assumes the first spaceship added is the player.
     * @returns {Spaceship | undefined} The player spaceship or undefined if none exist.
     */
    getPlayerShip() {
        // TODO: Implement a more robust way to identify the player ship
        return this.spaceships[0];
    }

    /**
     * Gets all planets managed by the entity manager.
     * @returns {Array<Planet>} An array of all planet instances.
     */
    getAllPlanets() {
        return this.planets;
    }
    
    /**
     * Gets all spaceships managed by the entity manager.
     * @returns {Array<Spaceship>} An array of all spaceship instances.
     */
    getAllSpaceships() {
        return this.spaceships;
    }

    /**
     * Updates the state of all managed entities.
     * @param {number} deltaTime - Time elapsed since the last update (unused currently).
     * @param {number} worldWidth - The width of the game world.
     * @param {number} worldHeight - The height of the game world.
     */
    update(deltaTime, worldWidth, worldHeight) {
        // Update all spaceships
        for (const ship of this.spaceships) {
            ship.update(); // Spaceship.update doesn't currently use deltaTime, worldWidth, worldHeight
            
            // Basic collision detection/handling (example - can be expanded)
            for (const planet of this.planets) {
                const dx = ship.x - planet.x;
                const dy = ship.y - planet.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const collisionThreshold = planet.radius + (ship.radius || 5); // Use ship radius if available

                if (distance < collisionThreshold) {
                    // Basic collision handling: stop movement towards planet
                    // A better approach might involve physics or specific game rules
                    const angleToPlanet = Math.atan2(dy, dx);
                    const overlap = collisionThreshold - distance;
                    
                    // Push ship back slightly
                    ship.x += Math.cos(angleToPlanet) * overlap * 0.1; // Gentle push back
                    ship.y += Math.sin(angleToPlanet) * overlap * 0.1;
                    
                    // Optional: Reduce speed upon collision
                    // ship.speed *= 0.95;

                    // console.log('Collision detected between ship and planet');
                }
            }
        }

        // Update planets if they have update logic
        // for (const planet of this.planets) {
        //     planet.update(deltaTime);
        // }
    }

    /**
     * Renders all managed entities.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} offsetX - The camera X offset.
     * @param {number} offsetY - The camera Y offset.
     */
    render(ctx, offsetX, offsetY) {
        // Render planets first
        for (const planet of this.planets) {
            planet.draw(ctx, offsetX, offsetY);
        }

        // Render spaceships
        for (const ship of this.spaceships) {
            ship.draw(ctx, offsetX, offsetY);
        }
    }

    // Optional: Methods to find entities by ID, type, or spatial query
    // findEntityById(id) { ... }
    // findEntitiesInRadius(x, y, radius) { ... }
} 