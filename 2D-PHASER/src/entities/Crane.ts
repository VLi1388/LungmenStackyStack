import Phaser from "phaser";

import { Config } from "../config";
import { Block, randomBlockColor, type Rgb } from "./Block";
import { Tower } from "./Tower";

/**
 * The crane holds the next block, swinging it back and forth above the
 * tower. Dropping releases the held block and hands ownership back to the
 * caller (the scene), which then watches it fall.
 *
 * Mirrors the 3D build's `Crane`, minus the physics body.
 */
export class Crane {
  private readonly scene: Phaser.Scene;
  private readonly tower: Tower;

  private heldBlock?: Block;
  private swingTime = 0;
  private pendingColor: Rgb = randomBlockColor();

  constructor(scene: Phaser.Scene, tower: Tower) {
    this.scene = scene;
    this.tower = tower;
  }

  /** True while a block is loaded and swinging, ready to drop. */
  get hasBlock(): boolean {
    return this.heldBlock !== undefined;
  }

  /** Color of the next block to be spawned (for the HUD preview). */
  get nextColor(): Rgb {
    return this.pendingColor;
  }

  /** Create a new block above the current tower top and start swinging it. */
  spawnNextBlock(): void {
    const y = this.tower.nextRestY + Config.crane.height;
    this.heldBlock = new Block(this.scene, 0, y, this.pendingColor);
    this.pendingColor = randomBlockColor();
    this.swingTime = 0;
  }

  /** Called every frame to animate the swing of the held block. */
  update(dt: number): void {
    if (!this.heldBlock) {
      return;
    }
    this.swingTime += dt * Config.crane.swingSpeed;
    this.heldBlock.worldX = Math.sin(this.swingTime) * Config.crane.swingAmplitude;
    this.heldBlock.syncToScreen();
  }

  /**
   * Release the held block. Returns the freed block (now owned by the
   * caller), or `undefined` if nothing was loaded.
   */
  dropBlock(): Block | undefined {
    if (!this.heldBlock) {
      return undefined;
    }
    const block = this.heldBlock;
    this.heldBlock = undefined;
    return block;
  }
}
