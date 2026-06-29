import { Config } from "../config";
import { Block } from "./Block";

/**
 * Tracks the settled blocks and exposes the geometry the rest of the game
 * needs: how tall the tower is and where the next block should rest.
 *
 * Mirrors the 3D build's `Tower`, but in 2D world units.
 */
export class Tower {
  private readonly blocks: Block[] = [];

  /** Number of successfully stacked blocks. */
  get count(): number {
    return this.blocks.length;
  }

  /** World Y of the current top surface (ground top is at y = 0). */
  get surfaceY(): number {
    return this.count * Config.block.height;
  }

  /** World Y where the next block's center should come to rest. */
  get nextRestY(): number {
    return this.surfaceY + Config.block.height / 2;
  }

  /** The most recently stacked block, if any. */
  get topBlock(): Block | undefined {
    return this.blocks[this.blocks.length - 1];
  }

  /** Horizontal (X) center the next block is judged against. */
  get centerX(): number {
    return this.topBlock?.worldX ?? 0;
  }

  addBlock(block: Block): void {
    this.blocks.push(block);
  }

  /** Drop and dispose every stacked block. */
  reset(): void {
    for (const block of this.blocks) {
      block.destroy();
    }
    this.blocks.length = 0;
  }
}
