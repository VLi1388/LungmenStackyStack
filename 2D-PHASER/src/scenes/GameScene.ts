import Phaser from "phaser";

import { Config } from "../config";
import { Crane } from "../entities/Crane";
import { Tower } from "../entities/Tower";
import { Block, rgbToCss } from "../entities/Block";
import { Hud } from "../ui/Hud";
import { worldToScreen } from "../iso";

type GameState = "ready" | "dropping" | "gameover";

/**
 * A block that has been released and is falling toward the tower top.
 * The skeleton uses simple kinematic motion; swap in Matter.js later if
 * you want a wobbling, topple-able tower.
 */
interface FallingBlock {
  block: Block;
  velocity: number; // world units / second (downward, +)
  targetRestY: number; // world Y where it should come to rest
}

/**
 * The main playable scene: builds the 2.5D ground, drives the core loop
 * (drop → fall → land → score / game over) and keeps the camera framed on
 * the rising tower. Mirrors the structure of the 3D build's `GameScene`.
 *
 * Everything is drawn in "world space" (centered on x = 0, with the ground
 * top at y = 0). Phaser's main camera scroll does the work of centering the
 * scene and panning up as the tower grows — the 2D analog of the 3D build's
 * rising camera target.
 */
export class GameScene extends Phaser.Scene {
  private crane!: Crane;
  private tower!: Tower;
  private hud!: Hud;

  private state: GameState = "ready";
  private score = 0;
  private falling?: FallingBlock;

  constructor() {
    super("game");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(Config.backgroundColor);
    this.recenterCamera();

    this.drawGround();

    this.hud = new Hud();
    this.tower = new Tower();
    this.crane = new Crane(this, this.tower);
    this.spawnNext();

    this.registerInput();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.recenterCamera, this);
  }

  update(_time: number, deltaMs: number): void {
    const dt = deltaMs / 1000;

    this.crane.update(dt);

    if (this.state === "dropping" && this.falling) {
      this.updateFallingBlock(dt);
    }

    this.updateCamera();
  }

  // --- Scene building ------------------------------------------------------

  /** Center world x = 0 horizontally and place the ground near the bottom. */
  private recenterCamera(): void {
    const { width, height } = this.scale.gameSize;
    this.cameras.main.setScroll(-width / 2, this.baseScrollY(height));
  }

  /** Camera scrollY that puts the ground (world y = 0) near the bottom. */
  private baseScrollY(height: number): number {
    return -height * 0.8;
  }

  /** A simple dimetric ground pad for the first block to land on. */
  private drawGround(): void {
    const g = this.add.graphics();
    const halfW = 5 * Config.render.pxPerUnitX;
    const halfH = halfW / 2;
    g.fillStyle(0x2a2d3d, 1);
    g.beginPath();
    g.moveTo(0, -halfH);
    g.lineTo(halfW, 0);
    g.lineTo(0, halfH);
    g.lineTo(-halfW, 0);
    g.closePath();
    g.fillPath();
    g.setDepth(-100000);
  }

  // --- Input ---------------------------------------------------------------

  private registerInput(): void {
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.handleAction, this);

    this.input.keyboard?.on("keydown-SPACE", (e: KeyboardEvent) => {
      e.preventDefault();
      this.handleAction();
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
    const block = this.crane.dropBlock();
    if (!block) {
      return;
    }
    this.falling = {
      block,
      velocity: 0,
      targetRestY: this.tower.nextRestY,
    };
    this.state = "dropping";
  }

  // --- Core loop -----------------------------------------------------------

  private updateFallingBlock(dt: number): void {
    const fall = this.falling!;

    fall.velocity = Math.min(
      fall.velocity + Config.drop.gravity * dt,
      Config.drop.maxFallSpeed,
    );
    fall.block.worldY -= fall.velocity * dt;

    if (fall.block.worldY <= fall.targetRestY) {
      fall.block.worldY = fall.targetRestY;
      fall.block.syncToScreen();
      this.resolveLanding(fall.block);
      return;
    }

    fall.block.syncToScreen();
  }

  private resolveLanding(block: Block): void {
    const horizontalOffset = Math.abs(block.worldX - this.tower.centerX);
    const missed = horizontalOffset > Config.rules.maxOffsetFromCenter;

    if (missed) {
      // Keep the reference (don't clear `falling`) so `restart` can dispose
      // this orphaned block — it was never added to the tower.
      this.endGame();
      return;
    }

    this.falling = undefined;
    this.tower.addBlock(block);
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
    this.tower.reset();
    this.falling?.block.destroy();
    this.falling = undefined;
    this.score = 0;
    this.hud.setScore(0);
    this.hud.hideGameOver();

    this.spawnNext();
    this.state = "ready";
  }

  /** Load the next block onto the crane and refresh the HUD preview. */
  private spawnNext(): void {
    this.crane.spawnNextBlock();
    this.hud.setNextColor(rgbToCss(this.crane.nextColor));
  }

  // --- Camera --------------------------------------------------------------

  /**
   * Smoothly pan the camera up so the tower top stays in frame once the
   * tower is tall enough, while never dropping below the starting view.
   */
  private updateCamera(): void {
    const { height } = this.scale.gameSize;
    const topScreenY = worldToScreen(0, this.tower.surfaceY).y;
    const followTargetY = topScreenY - height * 0.45;
    const targetScrollY = Math.min(this.baseScrollY(height), followTargetY);

    const cam = this.cameras.main;
    cam.scrollY += (targetScrollY - cam.scrollY) * Config.render.cameraFollowLerp;
  }
}
