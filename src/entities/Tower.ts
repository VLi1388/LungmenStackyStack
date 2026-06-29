import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { Config } from "../config";

/**
 * Tracks the stacked blocks and exposes the current tower height,
 * which the crane uses to position the next block.
 */
export class Tower {
  private readonly blocks: Mesh[] = [];

  /** Number of successfully stacked blocks. */
  get height(): number {
    return this.blocks.length;
  }

  /** World-space Y position where the next block should rest. */
  get topY(): number {
    return this.height * Config.block.height;
  }

  /** World-space position of the current tower top, centered on X/Z origin. */
  get topPosition(): Vector3 {
    return new Vector3(0, this.topY, 0);
  }

  addBlock(block: Mesh): void {
    this.blocks.push(block);
  }
}
