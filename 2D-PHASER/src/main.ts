import Phaser from "phaser";

import { Config } from "./config";
import { GameScene } from "./scenes/GameScene";

/**
 * Boots the Phaser game: a single full-window canvas mounted into #game,
 * running the GameScene. The DOM HUD (score / next swatch / game-over)
 * lives outside the canvas, in index.html.
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: Config.backgroundColor,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: "100%",
    height: "100%",
  },
  render: {
    antialias: true,
  },
  scene: [GameScene],
};

new Phaser.Game(config);
