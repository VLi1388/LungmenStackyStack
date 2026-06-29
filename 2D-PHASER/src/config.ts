/**
 * Central tunable constants for the 2D (Phaser) version.
 *
 * Gameplay numbers are kept in world units (the same mental model as the
 * 3D Babylon build) and converted to screen pixels by the iso projection
 * in `iso.ts`. Keeping them here makes balancing easy and lets both
 * versions stay conceptually in sync.
 */
export const Config = {
  // Logical block size in world units (width = swing axis, depth into
  // the screen, height = how much vertical room one block occupies).
  block: {
    width: 2,
    depth: 2,
    height: 1,
  },

  // Crane that carries and swings the next block above the tower.
  crane: {
    height: 8, // world units above the current tower top
    swingAmplitude: 4, // horizontal swing range (units from center)
    swingSpeed: 1.2, // radians per second
  },

  // Kinematic "drop" tuning. The skeleton uses simple gravity-driven
  // motion rather than a full physics engine (easy to swap for Matter.js).
  drop: {
    gravity: 22, // world units / s^2 pulling a falling block down
    maxFallSpeed: 30, // clamp so fast drops stay readable
  },

  // Rules that decide whether a landed block counts or ends the run.
  rules: {
    // If a block's center is farther than this (world units) from the
    // tower center when it lands, the run is over.
    maxOffsetFromCenter: 1.6,
  },

  // 2.5D dimetric rendering. These are screen pixels.
  render: {
    pxPerUnitX: 34, // horizontal pixels per world unit (swing axis)
    pxPerUnitY: 30, // vertical pixels per world unit of tower height
    // Size of one drawn cube, in screen pixels.
    cube: {
      tileW: 120, // full width of the top-face diamond
      tileH: 60, // full height of the top-face diamond (2:1 dimetric)
      depth: 34, // height of the visible side faces
    },
    // How quickly the camera rises to keep the tower top in frame (0..1).
    cameraFollowLerp: 0.06,
  },

  // Background clear color.
  backgroundColor: "#14141f",
} as const;
