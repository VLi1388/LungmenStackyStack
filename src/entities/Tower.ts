import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { Config } from "../config";

/**
 * Tracks the settled blocks and exposes the geometry the rest of the
 * game needs: how tall the tower is and where the next block should rest.
 */
export class Tower {
  private readonly blocks: Mesh[] = [];

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
  get topBlock(): Mesh | undefined {
    return this.blocks[this.blocks.length - 1];
  }

  /** Horizontal (X) center the next block is judged against. */
  get centerX(): number {
    return this.topBlock?.position.x ?? 0;
  }

  addBlock(block: Mesh): void {
    this.blocks.push(block);
  }

  /** Forget all stacked blocks (caller is responsible for disposing meshes). */
  reset(): void {
    this.blocks.length = 0;
  }
}
