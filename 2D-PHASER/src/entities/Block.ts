import Phaser from "phaser";

import { drawIsoCube } from "../iso";
import { worldToScreen } from "../iso";

/** RGB triple in 0..255. */
export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Generates a pleasant random block color (mirrors the 3D build's HSV pick). */
export function randomBlockColor(): Rgb {
  return hsvToRgb(Math.random() * 360, 0.55, 0.9);
}

/** Converts an Rgb triple to a CSS `#rrggbb` string (used by the HUD). */
export function rgbToCss({ r, g, b }: Rgb): string {
  const hex = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function hsvToRgb(h: number, s: number, v: number): Rgb {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

/**
 * A single stackable block. Owns a Phaser Graphics object that renders the
 * dimetric cube, and tracks its logical position in world units. Call
 * `syncToScreen` after changing `worldX` / `worldY` to update the visuals.
 */
export class Block {
  /** Horizontal position along the swing axis, in world units. */
  worldX: number;
  /** Tower-height position (center of the block), in world units. */
  worldY: number;

  readonly color: Rgb;
  readonly gfx: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, worldX: number, worldY: number, color: Rgb) {
    this.worldX = worldX;
    this.worldY = worldY;
    this.color = color;

    this.gfx = scene.add.graphics();
    drawIsoCube(this.gfx, color);
    this.syncToScreen();
  }

  /** Reposition the Graphics object to match the current world coordinates. */
  syncToScreen(): void {
    const p = worldToScreen(this.worldX, this.worldY);
    this.gfx.setPosition(p.x, p.y);
    // Draw order: taller (higher up the stack) blocks render in front, so a
    // newly placed block sits on top of the one below it rather than behind.
    this.gfx.setDepth(this.worldY);
  }

  destroy(): void {
    this.gfx.destroy();
  }
}
