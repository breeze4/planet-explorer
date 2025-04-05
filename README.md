# Planet Explorer

A 2D space exploration game built with JavaScript. Navigate through space, discover planets, and explore their unique characteristics.

## How to Play

1. Open `index.html` in a modern web browser
2. Use the following controls:
   - **W**: Accelerate forward
   - **S**: Decelerate/reverse
   - **A**: Rotate counterclockwise
   - **D**: Rotate clockwise
   - **Spacebar**: Activate boost (when boost meter is charged)
   - **E**: Land on a planet (when hovering over a planet and moving slowly)
3. Adjust speed using the slider in the top-left corner

## Features

- WASD controls for flying your spaceship
- Boost mechanic that charges over time
- Procedurally generated space environment with unique planets
- Land on planets to discover information about them
- Minimap for navigation
- Speed control slider

## Game Mechanics

- The boost meter charges automatically when not in use
- You can fly over planets freely and only land when you choose to (press E)
- You must slow down to land on a planet
- Press the "Leave Planet" button to take off and continue exploring
- The minimap in the corner shows your position and nearby planets

## Implementation Details

The game uses vanilla JavaScript with a object-oriented architecture:
- Uses HTML5 Canvas for rendering
- Includes JSDoc comments for type documentation
- Features a simple physics system for spaceship movement
- Implements a camera system that follows the player

## File Structure

- `index.html` - Main game HTML
- `style.css` - Game styling
- `js/game.js` - Main game logic
- `js/spaceship.js` - Player spaceship class
- `js/planet.js` - Planet generation and rendering
- `js/ui.js` - UI elements and interactions
- `js/utils.js` - Utility functions

## Future Enhancements

Potential features for future development:
- Resource collection from planets
- Upgrades for your spaceship
- More diverse planet types with different interactions
- Enemy ships or obstacles
- Sound effects and music

---

Created by [Your Name] as a JavaScript gaming project. 