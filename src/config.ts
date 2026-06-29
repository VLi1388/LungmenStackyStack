/**
 * Central tunable constants for the game.
 * Keeping gameplay numbers here makes balancing easier.
 */
export const Config = {
  // Block dimensions (width, height, depth in world units).
  block: {
    width: 2,
    height: 1,
    depth: 2,
    mass: 1,
  },

  // Crane that carries and swings the next block.
  crane: {
    height: 14, // height above the current tower top
    swingAmplitude: 6, // horizontal swing range (units from center)
    swingSpeed: 1.2, // radians per second
  },

  // Camera framing.
  camera: {
    startRadius: 24,
    startBeta: Math.PI / 2.6,
    minRadius: 12,
    maxRadius: 60,
  },

  // Physics.
  physics: {
    gravity: -19.6,
  },
} as const;
