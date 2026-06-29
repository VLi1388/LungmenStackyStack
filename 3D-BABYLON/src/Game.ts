import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";

import { GameScene } from "./scenes/GameScene";

/**
 * Owns the Babylon engine and render loop.
 * Delegates all gameplay to the active scene.
 */
export class Game {
  private readonly engine: Engine;
  private readonly canvas: HTMLCanvasElement;
  private scene?: Scene;
  private gameScene?: GameScene;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });
  }

  async start(): Promise<void> {
    this.gameScene = new GameScene(this.engine, this.canvas);
    this.scene = await this.gameScene.create();

    this.engine.runRenderLoop(() => {
      this.scene?.render();
    });

    window.addEventListener("resize", this.handleResize);
  }

  dispose(): void {
    window.removeEventListener("resize", this.handleResize);
    this.scene?.dispose();
    this.engine.dispose();
  }

  private readonly handleResize = (): void => {
    this.engine.resize();
  };
}
