LungmenStackyStack/
├── index.html              # Canvas + HUD shell
├── package.json            # Vite + TS + Babylon.js + Havok physics
├── tsconfig.json           # Strict TypeScript config
├── vite.config.ts          # Dev server + Havok WASM handling
├── .gitignore
└── src/
    ├── main.ts             # Entry point — boots the Game
    ├── config.ts           # Tunable gameplay constants
    ├── Game.ts             # Owns engine + render loop
    ├── scenes/
    │   └── GameScene.ts    # Camera, lights, ground, physics, input
    └── entities/
        ├── Block.ts        # Block mesh factory
        ├── Crane.ts        # Swings + drops the next block
        └── Tower.ts        # Tracks stacked blocks / height