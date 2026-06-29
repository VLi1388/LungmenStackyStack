import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import HavokPhysics from "@babylonjs/havok";

// Side-effect imports required for the features used above.
import "@babylonjs/core/Physics/v2/physicsEngineComponent";
import "@babylonjs/core/Materials/standardMaterial";

import { Config } from "../config";
import { Crane, type DroppedBlock } from "../entities/Crane";
import { Tower } from "../entities/Tower";
import { Hud } from "../ui/Hud";

type GameState = "ready" | "dropping" | "gameover";

/** A block currently falling and being watched until it settles or misses. */
interface ActiveDrop extends DroppedBlock {
  framesStill: number;
  elapsed: number;
  targetRestY: number;
}

/**
 * The main playable scene: sets up camera, lighting, ground, physics,
 * and drives the core gameplay loop (drop → settle → score / game over).
 */
export class GameScene {
  private readonly engine: Engine;
  private readonly canvas: HTMLCanvasElement;

  private scene!: Scene;
  private camera!: ArcRotateCamera;
  private crane!: Crane;
  private tower!: Tower;
  private hud!: Hud;

  private state: GameState = "ready";
  private score = 0;
  private active?: ActiveDrop;
  private readonly droppedBlocks: DroppedBlock[] = [];

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    this.engine = engine;
    this.canvas = canvas;
  }

  async create(): Promise<Scene> {
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.1, 0.1, 0.18, 1);

    await this.enablePhysics();
    this.createCamera();
    this.createLighting();
    this.createGround();

    this.hud = new Hud();
    this.tower = new Tower();
    this.crane = new Crane(this.scene, this.tower);
    this.spawnNext();

    this.registerInput();
    this.registerUpdateLoop();

    return this.scene;
  }

  private async enablePhysics(): Promise<void> {
    const havok = await HavokPhysics();
    const plugin = new HavokPlugin(true, havok);
    this.scene.enablePhysics(new Vector3(0, Config.physics.gravity, 0), plugin);
  }

  private createCamera(): void {
    this.camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Config.camera.startBeta,
      Config.camera.startRadius,
      new Vector3(0, 4, 0),
      this.scene,
    );
    this.camera.lowerRadiusLimit = Config.camera.minRadius;
    this.camera.upperRadiusLimit = Config.camera.maxRadius;
    this.camera.wheelDeltaPercentage = 0.01;
    this.camera.attachControl(this.canvas, true);
  }

  private createLighting(): void {
    const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.7;

    const dir = new DirectionalLight("dir", new Vector3(-1, -2, -1), this.scene);
    dir.intensity = 0.6;
    dir.position = new Vector3(20, 40, 20);
  }

  private createGround(): void {
    const ground = CreateGround("ground", { width: 60, height: 60 }, this.scene);
    const mat = new StandardMaterial("groundMat", this.scene);
    mat.diffuseColor = new Color3(0.18, 0.2, 0.28);
    mat.specularColor = Color3.Black();
    ground.material = mat;

    // Static collider (mass 0) so the first block has something to land on.
    new PhysicsAggregate(ground, PhysicsShapeType.MESH, { mass: 0 }, this.scene);
  }

  private registerInput(): void {
    this.scene.onPointerDown = () => this.handleAction();

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        this.handleAction();
      }
    });
  }

  /** Single "action" input: drop a block, or restart after game over. */
  private handleAction(): void {
    if (this.state === "gameover") {
      this.restart();
      return;
    }

    if (this.state === "ready" && this.crane.hasBlock) {
      this.dropBlock();
    }
  }

  private dropBlock(): void {
    const dropped = this.crane.dropBlock();
    if (!dropped) {
      return;
    }

    this.droppedBlocks.push(dropped);
    this.active = {
      ...dropped,
      framesStill: 0,
      elapsed: 0,
      targetRestY: this.tower.nextRestY,
    };
    this.state = "dropping";
  }

  private registerUpdateLoop(): void {
    this.scene.onBeforeRenderObservable.add(() => {
      const dt = this.engine.getDeltaTime() / 1000;
      this.crane.update(dt);
      this.updateCamera();

      if (this.state === "dropping" && this.active) {
        this.updateActiveDrop(dt);
      }
    });
  }

  private updateActiveDrop(dt: number): void {
    const drop = this.active!;
    drop.elapsed += dt;

    const body = drop.aggregate.body;
    const linSpeed = body.getLinearVelocity().length();
    const angSpeed = body.getAngularVelocity().length();

    const isStill =
      linSpeed < Config.rules.settleLinearSpeed && angSpeed < Config.rules.settleAngularSpeed;
    drop.framesStill = isStill ? drop.framesStill + 1 : 0;

    const settled = drop.framesStill >= Config.rules.settleFrames;
    const timedOut = drop.elapsed >= Config.rules.settleTimeout;

    if (settled || timedOut) {
      this.resolveDrop(drop);
    }
  }

  private resolveDrop(drop: ActiveDrop): void {
    this.active = undefined;

    const horizontalOffset = Math.abs(drop.mesh.position.x - this.tower.centerX);
    const fellBelow = drop.mesh.position.y < drop.targetRestY - Config.rules.missFallBelow;
    const missed = horizontalOffset > Config.rules.maxOffsetFromCenter || fellBelow;

    if (missed) {
      this.endGame();
      return;
    }

    this.tower.addBlock(drop.mesh);
    this.score += 1;
    this.hud.setScore(this.score);

    this.spawnNext();
    this.state = "ready";
  }

  private endGame(): void {
    this.state = "gameover";
    this.hud.showGameOver(this.score);
  }

  private restart(): void {
    for (const block of this.droppedBlocks) {
      block.aggregate.dispose();
      block.mesh.dispose();
    }
    this.droppedBlocks.length = 0;

    this.tower.reset();
    this.active = undefined;
    this.score = 0;
    this.hud.setScore(0);
    this.hud.hideGameOver();

    this.spawnNext();
    this.state = "ready";
  }

  /** Load the next block onto the crane and refresh the HUD preview. */
  private spawnNext(): void {
    this.crane.spawnNextBlock();
    this.hud.setNextColor(this.crane.nextColor.toHexString());
  }

  private updateCamera(): void {
    // Smoothly raise the camera target so the tower top stays in frame.
    const desiredY = this.tower.surfaceY + 4;
    this.camera.target.y += (desiredY - this.camera.target.y) * Config.camera.followLerp;
  }
}
