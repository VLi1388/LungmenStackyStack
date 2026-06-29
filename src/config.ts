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

  // Rules that decide when a dropped block has settled or missed.
  rules: {
    // A block is considered "settled" once its linear + angular speed
    // stay below these thresholds for `settleFrames` consecutive frames.
    settleLinearSpeed: 0.15,
    settleAngularSpeed: 0.15,
    settleFrames: 18,
    // Max time (seconds) to wait for a block to settle before giving up.
    settleTimeout: 5,
    // If a block's center drifts farther than this from the tower center
    // (X/Z), or falls below the previous top, it counts as a miss.
    maxOffsetFromCenter: 2.4,
    missFallBelow: 0.6, // units a block may drop below its target rest height
  },

  // Camera framing.
  camera: {
    startRadius: 24,
    startBeta: Math.PI / 2.6,
    minRadius: 12,
    maxRadius: 60,
    followLerp: 0.05, // how quickly the camera target rises with the tower
  },

  // Physics.
  physics: {
    gravity: -19.6,
  },
} as const;
