import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSceneData } from "../store/sceneStore";
import type { SceneObject } from "../store/sceneStore";
import * as THREE from "three";
import { observer } from "mobx-react-lite";
import {
  registerObject,
  isObjectInstanceSame,
  registerGeometry,
  registerMaterial,
} from "../utils/objectTracker";

// Component for a single object in the scene
const Object3D: React.FC<{ object: SceneObject; parentRenderId?: string }> = ({
  object,
  parentRenderId,
}) => {
  // Create a unique render ID that changes when parent changes or object structure changes
  const renderId = useMemo(() => {
    return `${parentRenderId || ""}${object.id}${object.geometryType}${
      object.materialType
    }`;
  }, [object.id, object.geometryType, object.materialType, parentRenderId]);

  // Create refs to track the mesh and group
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.Material>(null);

  // Track if this is a new render or reuse
  const firstRenderRef = useRef(true);

  // Register the object for tracking and check if it's the same instance
  useEffect(() => {
    if (groupRef.current) {
      // Check if this instance is the same as before (if we've tracked it previously)
      const isSameInstance = isObjectInstanceSame(object.id, groupRef.current);

      // Register the current instance for future comparisons
      registerObject(object.id, groupRef.current);

      // Log detailed instance information
      console.log(`Object ${object.name} (${object.id}):`, {
        isSameInstance,
        instanceUUID: groupRef.current.uuid,
        meshUUID: meshRef.current?.uuid,
        type: groupRef.current.type,
        position: groupRef.current.position.toArray(),
      });
    }
  }, [
    object.id,
    object.name,
    object.position.join(","),
    object.children.length,
  ]);

  // Track geometry and material instances
  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry;
      const material = meshRef.current.material as THREE.Material;

      // Register geometry and material for tracking
      registerGeometry(object.id, object.geometryType, geometry);
      registerMaterial(object.id, object.materialType, material);

      // Only log on updates, not first render
      if (!firstRenderRef.current) {
        console.log(`${object.name} (${object.id}) internal objects:`, {
          geometry: {
            uuid: geometry.uuid,
            type: object.geometryType,
            vertexCount: geometry.attributes.position?.count || 0,
          },
          material: {
            uuid: material.uuid,
            type: object.materialType,
            color:
              material.type === "MeshBasicMaterial"
                ? (material as THREE.MeshBasicMaterial).color.getHexString()
                : "n/a",
          },
        });
      }

      // No longer first render
      firstRenderRef.current = false;
    }
  });

  // Animation - slight rotation based on position
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      // Subtle animation, unique to each object based on position
      meshRef.current.rotation.x =
        object.rotation[0] + Math.sin(t * 0.5 + object.position[0]) * 0.05;
      meshRef.current.rotation.y =
        object.rotation[1] + Math.sin(t * 0.3 + object.position[1]) * 0.05;
    }
  });

  // Log when component is rendered to track recreation
  console.log(`Rendering Object3D: ${object.name} (${renderId})`);

  // Select the appropriate geometry based on type
  const geometry = useMemo(() => {
    console.log(`Creating geometry for ${object.name}: ${object.geometryType}`);

    switch (object.geometryType) {
      case "box":
        return <boxGeometry ref={geometryRef} args={[1, 1, 1]} />;
      case "sphere":
        return <sphereGeometry ref={geometryRef} args={[0.5, 32, 32]} />;
      case "cylinder":
        return <cylinderGeometry ref={geometryRef} args={[0.5, 0.5, 1, 32]} />;
      case "cone":
        return <coneGeometry ref={geometryRef} args={[0.5, 1, 32]} />;
      case "torus":
        return <torusGeometry ref={geometryRef} args={[0.5, 0.2, 16, 32]} />;
      default:
        return <boxGeometry ref={geometryRef} args={[1, 1, 1]} />;
    }
  }, [object.geometryType]);

  // Select the appropriate material based on type
  const material = useMemo(() => {
    console.log(`Creating material for ${object.name}: ${object.materialType}`);

    const color = object.color;

    switch (object.materialType) {
      case "normal":
        return <meshNormalMaterial ref={materialRef} />;
      case "phong":
        return <meshPhongMaterial ref={materialRef} color={color} />;
      case "standard":
        return (
          <meshStandardMaterial
            ref={materialRef}
            color={color}
            roughness={0.5}
            metalness={0.5}
          />
        );
      case "basic":
        return <meshBasicMaterial ref={materialRef} color={color} />;
      default:
        return <meshStandardMaterial ref={materialRef} color={color} />;
    }
  }, [object.materialType, object.color]);

  // If object is not visible, don't render it
  if (!object.visible) {
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
    >
      <mesh ref={meshRef}>
        {geometry}
        {material}
      </mesh>

      {/* Recursively render child objects */}
      {object.children.map((child) => (
        <Object3D key={child.id} object={child} parentRenderId={renderId} />
      ))}
    </group>
  );
};

// Main component that renders the scene
const SceneContentComponent = () => {
  const sceneData = useSceneData();

  return (
    <>
      {/* Scene lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />

      {/* Scene grid for reference */}
      <gridHelper args={[10, 10]} />

      {/* Render all root objects */}
      {sceneData.root.map((object) => (
        <Object3D key={object.id} object={object} />
      ))}
    </>
  );
};

// Use observer in a separate step
const SceneContent = observer(SceneContentComponent);

export default SceneContent;
