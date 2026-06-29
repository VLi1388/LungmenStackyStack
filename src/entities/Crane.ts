import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";

import { Config } from "../config";
import { createBlock } from "./Block";
import { Tower } from "./Tower";

/**
 * The crane holds the next block, swinging it back and forth above
 * the tower. On drop, the held block becomes a dynamic physics body.
 */
export class Crane {
  private readonly scene: Scene;
  private readonly tower: Tower;

  private heldBlock?: Mesh;
  private swingTime = 0;

  constructor(scene: Scene, tower: Tower) {
    this.scene = scene;
    this.tower = tower;
    this.spawnNextBlock();
  }

  /** Position the crane above the current tower top and create a new block. */
  private spawnNextBlock(): void {
    const y = this.tower.topY + Config.crane.height;
    this.heldBlock = createBlock(this.scene, new Vector3(0, y, 0));
    this.swingTime = 0;
  }

  /** Called every frame to animate the swing of the held block. */
  update(dt: number): void {
    if (!this.heldBlock) {
      return;
    }

    this.swingTime += dt * Config.crane.swingSpeed;
    const x = Math.sin(this.swingTime) * Config.crane.swingAmplitude;
    this.heldBlock.position.x = x;
  }

  /** Release the held block, giving it a dynamic physics body. */
  dropBlock(): void {
    if (!this.heldBlock) {
      return;
    }

    const block = this.heldBlock;
    this.heldBlock = undefined;

    // eslint-disable-next-line no-new
    new PhysicsAggregate(
      block,
      PhysicsShapeType.BOX,
      { mass: Config.block.mass, restitution: 0.05, friction: 0.8 },
      this.scene,
    );

    this.tower.addBlock(block);

    // TODO: wait until the block settles before spawning the next one,
    // and detect misses (block falls off the tower) to end the game.
    this.spawnNextBlock();
  }
}
