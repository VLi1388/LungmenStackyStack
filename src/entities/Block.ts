import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

import { Config } from "../config";

/** Generates a pleasant random block color. */
export function randomBlockColor(): Color3 {
  return Color3.FromHSV(Math.random() * 360, 0.55, 0.9);
}

/**
 * Creates a single stackable block mesh.
 * Physics bodies are attached later when a block is dropped.
 */
export function createBlock(scene: Scene, position: Vector3, color: Color3): Mesh {
  const block = CreateBox(
    "block",
    {
      width: Config.block.width,
      height: Config.block.height,
      depth: Config.block.depth,
    },
    scene,
  );
  block.position.copyFrom(position);

  const mat = new StandardMaterial("blockMat", scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.1, 0.1, 0.1);
  block.material = mat;

  return block;
}
