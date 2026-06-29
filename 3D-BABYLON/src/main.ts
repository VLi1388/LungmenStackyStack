import { Game } from "./Game";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement | null;

if (!canvas) {
  throw new Error("Render canvas element #renderCanvas was not found.");
}

const game = new Game(canvas);

void game.start();
