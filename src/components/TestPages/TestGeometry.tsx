// import { useThree } from "@react-three/fiber";
// import { useEffect, useRef } from "react";
import type { GeometryTestResult } from "./GeometryBenchmark";
import * as THREE from "three";

export const measureGeometryPerformance = (
  type: string,
  params: Record<string, number>
): GeometryTestResult => {
  // DECLARATION
  let geometryInstancingStartTime;
  let geometryInstancingEndTime;

  // Create the geometry based on the type
  let geometry: THREE.BufferGeometry;

  switch (type) {
    case "box":
      geometryInstancingStartTime = performance.now();
      geometry = new THREE.BoxGeometry(
        params.width || 1,
        params.height || 1,
        params.depth || 1,
        params.widthSegments,
        params.heightSegments,
        params.depthSegments
      );
      geometryInstancingEndTime = performance.now();
      break;

    case "sphere":
      geometryInstancingStartTime = performance.now();
      geometry = new THREE.SphereGeometry(
        params.radius || 1,
        params.widthSegments,
        params.heightSegments
      );
      geometryInstancingEndTime = performance.now();
      break;

    case "cylinder":
      geometryInstancingStartTime = performance.now();
      geometry = new THREE.CylinderGeometry(
        params.radiusTop || 1,
        params.radiusBottom || 1,
        params.height || 1,
        params.radialSegments,
        params.heightSegments
      );
      geometryInstancingEndTime = performance.now();
      break;

    case "plane":
      geometryInstancingStartTime = performance.now();
      geometry = new THREE.PlaneGeometry(
        params.width || 1,
        params.height || 1,
        params.widthSegments,
        params.heightSegments
      );
      geometryInstancingEndTime = performance.now();
      break;

    case "torus":
      geometryInstancingStartTime = performance.now();
      geometry = new THREE.TorusGeometry(
        params.radius || 1,
        params.tube || 0.4,
        params.radialSegments,
        params.tubularSegments
      );
      geometryInstancingEndTime = performance.now();
      break;

    default:
      geometryInstancingStartTime = performance.now();
      geometry = new THREE.BoxGeometry(1, 1, 1);
      geometryInstancingEndTime = performance.now();
  }

  const vertexCount = geometry.attributes.position.count;

  // MESH INSTANCING
  const material = new THREE.MeshBasicMaterial({ color: "red" });

  const meshInstancingStartTime = performance.now();
  const mesh = new THREE.Mesh(geometry, material);
  const meshInstancingEndTime = performance.now();

  const meshInstancingTime = meshInstancingEndTime - meshInstancingStartTime;

  // END INSTANCE CREATION TIMING
  const geometryInstanceCreationTime =
    geometryInstancingEndTime - geometryInstancingStartTime;

  // CLEANUP
  mesh.geometry.dispose();
  mesh.material.dispose();

  return {
    type: type,
    parameters: params,
    vertexCount: vertexCount,
    geometryInstanceCreationTime: geometryInstanceCreationTime,
    meshInstancingTime: meshInstancingTime,
  };
};
