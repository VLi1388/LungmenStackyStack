import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";

import { Config } from "../config";
import { createBlock, randomBlockColor } from "./Block";
import { Tower } from "./Tower";

/** A block released from the crane, now a dynamic physics body. */
export interface DroppedBlock {
  mesh: Mesh;
  aggregate: PhysicsAggregate;
}

/**
 * The crane holds the next block, swinging it back and forth above the
 * tower. Dropping releases the held block as a dynamic physics body and
 * hands ownership back to the caller (the scene/game loop).
 */
export class Crane {
  private readonly scene: Scene;
  private readonly tower: Tower;

  private heldBlock?: Mesh;
  private swingTime = 0;
  private pendingColor: Color3 = randomBlockColor();

  constructor(scene: Scene, tower: Tower) {
    this.scene = scene;
    this.tower = tower;
  }

  /** True while a block is loaded and swinging, ready to drop. */
  get hasBlock(): boolean {
    return this.heldBlock !== undefined;
  }

  /** Color of the next block to be spawned (for the HUD preview). */
  get nextColor(): Color3 {
    return this.pendingColor;
  }

  /** Create a new block above the current tower top and start swinging it. */
  spawnNextBlock(): void {
    const y = this.tower.nextRestY + Config.crane.height;
    this.heldBlock = createBlock(this.scene, new Vector3(0, y, 0), this.pendingColor);
    this.pendingColor = randomBlockColor();
    this.swingTime = 0;
  }

  /** Called every frame to animate the swing of the held block. */
  update(dt: number): void {
    if (!this.heldBlock) {
      return;
    }

    this.swingTime += dt * Config.crane.swingSpeed;
    this.heldBlock.position.x = Math.sin(this.swingTime) * Config.crane.swingAmplitude;
  }

  /**
   * Release the held block, giving it a dynamic physics body.
   * Returns the dropped block, or `undefined` if nothing was loaded.
   */
  dropBlock(): DroppedBlock | undefined {
    if (!this.heldBlock) {
      return undefined;
    }

    const mesh = this.heldBlock;
    this.heldBlock = undefined;

    const aggregate = new PhysicsAggregate(
      mesh,
      PhysicsShapeType.BOX,
      { mass: Config.block.mass, restitution: 0.05, friction: 0.8 },
      this.scene,
    );

    return { mesh, aggregate };
  }
}
