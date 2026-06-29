/**
 * Thin wrapper around the DOM HUD: the live score and a game-over overlay.
 * Keeping DOM access in one place keeps the scene focused on gameplay.
 */
export class Hud {
  private readonly scoreEl: HTMLElement;
  private readonly nextSwatchEl: HTMLElement;
  private overlayEl?: HTMLElement;

  constructor() {
    const scoreEl = document.getElementById("score");
    if (!scoreEl) {
      throw new Error("HUD element #score was not found.");
    }
    this.scoreEl = scoreEl;

    const nextSwatchEl = document.getElementById("nextSwatch");
    if (!nextSwatchEl) {
      throw new Error("HUD element #nextSwatch was not found.");
    }
    this.nextSwatchEl = nextSwatchEl;
  }

  setScore(score: number): void {
    this.scoreEl.textContent = String(score);
  }

  /** Update the upcoming-block preview swatch. Accepts a CSS color string. */
  setNextColor(cssColor: string): void {
    this.nextSwatchEl.style.background = cssColor;
  }

  showGameOver(score: number): void {
    if (this.overlayEl) {
      return;
    }

    const overlay = document.createElement("div");
    overlay.style.cssText = [
      "position:fixed",
      "inset:0",
      "display:flex",
      "flex-direction:column",
      "align-items:center",
      "justify-content:center",
      "gap:12px",
      "background:rgba(10,10,20,0.7)",
      "color:#fff",
      "font-family:system-ui,sans-serif",
      "text-align:center",
      "z-index:10",
      "user-select:none",
    ].join(";");
    overlay.innerHTML = `
      <div style="font-size:48px;font-weight:800;">Game Over</div>
      <div style="font-size:24px;">Height: ${score}</div>
      <div style="font-size:16px;opacity:0.8;">Click or press Space to play again</div>
    `;

    document.body.appendChild(overlay);
    this.overlayEl = overlay;
  }

  hideGameOver(): void {
    this.overlayEl?.remove();
    this.overlayEl = undefined;
  }
}
