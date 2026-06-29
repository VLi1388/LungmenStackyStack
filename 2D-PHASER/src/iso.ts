import { Config } from "./config";

/**
 * Screen position, in pixels, within the game world (before the camera
 * scroll is applied by Phaser).
 */
export interface ScreenPoint {
  x: number;
  y: number;
}

/**
 * Projects a point from game "world" space into screen space to create the
 * top-down 2.5D (dimetric) look.
 *
 * World axes:
 *   - `worldX`  → horizontal swing axis (left/right on screen)
 *   - `worldY`  → tower height (up on screen as it grows)
 *
 * The third axis (depth) is faked entirely by how each cube is drawn in
 * `drawIsoCube`, which gives the flat 2D scene its sense of volume.
 *
 * Screen Y grows downward (Phaser convention), so increasing tower height
 * moves a block *up* the screen — hence the subtraction.
 */
export function worldToScreen(worldX: number, worldY: number): ScreenPoint {
  return {
    x: worldX * Config.render.pxPerUnitX,
    y: -worldY * Config.render.pxPerUnitY,
  };
}

/** Convenience helpers around the configured cube dimensions. */
export const Cube = {
  get halfW(): number {
    return Config.render.cube.tileW / 2;
  },
  get halfH(): number {
    return Config.render.cube.tileH / 2;
  },
  get depth(): number {
    return Config.render.cube.depth;
  },
} as const;

/** RGB triple in 0..255. */
interface Rgb {
  r: number;
  g: number;
  b: number;
}

function shade({ r, g, b }: Rgb, factor: number): number {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (clamp(r * factor) << 16) | (clamp(g * factor) << 8) | clamp(b * factor);
}

/**
 * Draws a single dimetric cube into a Phaser Graphics object, centered on
 * the origin of that Graphics object (so the owner can simply position the
 * Graphics/Container at the projected screen point).
 *
 * The cube is drawn with three visible faces — a lit top and two side faces
 * at different shades — which is what sells the 2.5D volume on a flat canvas.
 *
 * The origin (0, 0) is the *center of the top face*.
 */
export function drawIsoCube(g: Phaser.GameObjects.Graphics, baseColor: Rgb): void {
  const { halfW, halfH, depth } = Cube;

  // Top-face diamond, centered on the origin.
  const top = { x: 0, y: -halfH };
  const right = { x: halfW, y: 0 };
  const bottom = { x: 0, y: halfH };
  const left = { x: -halfW, y: 0 };

  // Top face (brightest).
  g.fillStyle(shade(baseColor, 1.0), 1);
  g.beginPath();
  g.moveTo(top.x, top.y);
  g.lineTo(right.x, right.y);
  g.lineTo(bottom.x, bottom.y);
  g.lineTo(left.x, left.y);
  g.closePath();
  g.fillPath();

  // Left side face (darkest).
  g.fillStyle(shade(baseColor, 0.6), 1);
  g.beginPath();
  g.moveTo(left.x, left.y);
  g.lineTo(bottom.x, bottom.y);
  g.lineTo(bottom.x, bottom.y + depth);
  g.lineTo(left.x, left.y + depth);
  g.closePath();
  g.fillPath();

  // Right side face (mid shade).
  g.fillStyle(shade(baseColor, 0.8), 1);
  g.beginPath();
  g.moveTo(right.x, right.y);
  g.lineTo(bottom.x, bottom.y);
  g.lineTo(bottom.x, bottom.y + depth);
  g.lineTo(right.x, right.y + depth);
  g.closePath();
  g.fillPath();

  // Subtle outline to separate stacked cubes.
  g.lineStyle(2, 0x000000, 0.18);
  g.strokePath();
}
