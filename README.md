# LungmenStackyStack

A Tower Bloxx-like block-stacking game, built in two parallel versions that
share the same gameplay model (blocks, a swinging crane, a growing tower).

## Versions

| Folder | Engine | Look | Dev port |
| --- | --- | --- | --- |
| [`3D-BABYLON/`](3D-BABYLON/) | Babylon.js + Havok physics | True 3D | `5173` |
| [`2D-PHASER/`](2D-PHASER/) | Phaser 3 | Top-down 2.5D (dimetric) | `5174` |

Both share the same conceptual structure — `config`, `Crane`, `Tower`,
`Block`, `GameScene`, and a DOM `Hud` — so changes to gameplay rules stay
easy to mirror across the two.

## Running

Each version is a self-contained Vite + TypeScript project. From inside the
chosen folder:

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production bundle
```

## 2.5D approach (Phaser version)

The Phaser build is genuinely 2D, but fakes volume to get a top-down 2.5D
feel:

- Gameplay is tracked in **world units** (swing axis + tower height), the same
  mental model as the 3D build.
- `src/iso.ts` projects world coordinates to screen space and draws each block
  as a **dimetric cube** with a lit top face and two shaded side faces.
- The camera scrolls up as the tower grows to keep the top in frame.

The current Phaser code is a runnable **skeleton**: swing, drop, stack, miss
detection, scoring, and restart all work using simple kinematic motion. Swap
in Phaser's Matter.js physics later if you want a wobbling, topple-able tower.