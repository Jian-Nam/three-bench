import * as THREE from "three";

import type { MaterialTestResult } from "./MaterialBenchmark";

export const measureMaterialPerformance = ({
  type,
  params,
}: {
  type: string;
  params: { width: number; height: number };
}): MaterialTestResult => {
  // Create a canvas to generate texture
  const canvas = document.createElement("canvas");
  canvas.width = params.width;
  canvas.height = params.height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Fill with a gradient
    const gradient = ctx.createLinearGradient(
      0,
      0,
      params.width,
      params.height
    );
    gradient.addColorStop(0, "red");
    gradient.addColorStop(1, "green");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, params.width, params.height);
  }
  const dataUrl = canvas.toDataURL();
  const textureLoader = new THREE.TextureLoader();
  // Create texture from canvas
  const textureCreationStartTime = performance.now();
  const texture = textureLoader.load(dataUrl);
  const textureCreationEndTime = performance.now();
  const textureCreationTime = textureCreationEndTime - textureCreationStartTime;

  const materialCreationStartTime = performance.now();
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const materialCreationEndTime = performance.now();
  const materialCreationTime =
    materialCreationEndTime - materialCreationStartTime;

  // CLEANUP
  material.dispose();

  return {
    type: type,
    parameters: { width: params.width, height: params.height },
    textureSize: params.width * params.height,
    textureCreationTime: textureCreationTime,
    materialCreationTime: materialCreationTime,
  };
};
