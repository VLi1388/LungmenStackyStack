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
import HavokPhysics from "@babylonjs/havok";

// Side-effect imports required for the features used above.
import "@babylonjs/core/Physics/v2/physicsEngineComponent";
import "@babylonjs/core/Materials/standardMaterial";

import { Config } from "../config";
import { Crane } from "../entities/Crane";
import { Tower } from "../entities/Tower";

/**
 * The main playable scene: sets up camera, lighting, ground,
 * physics, and the core gameplay entities (crane + tower).
 */
export class GameScene {
  private readonly engine: Engine;
  private readonly canvas: HTMLCanvasElement;

  private scene!: Scene;
  private camera!: ArcRotateCamera;
  private crane!: Crane;
  private tower!: Tower;

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

    this.tower = new Tower();
    this.crane = new Crane(this.scene, this.tower);

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

    // TODO: add a static physics body to the ground for the first block to land on.
  }

  private registerInput(): void {
    // Drop the swinging block on click / tap or spacebar.
    this.scene.onPointerDown = () => this.crane.dropBlock();

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        this.crane.dropBlock();
      }
    });
  }

  private registerUpdateLoop(): void {
    this.scene.onBeforeRenderObservable.add(() => {
      const dt = this.engine.getDeltaTime() / 1000;
      this.crane.update(dt);
    });
  }
}
