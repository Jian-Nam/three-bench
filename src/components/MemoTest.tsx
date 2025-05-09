import React, { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { SceneObject } from "../store/sceneStore";

interface MemoTestProps {
  object: SceneObject;
  memoizationLevel: "none" | "partial" | "full";
}

/**
 * Component to test different levels of memoization in R3F
 * This helps us understand the performance implications of different memo strategies
 */
const MemoTestComponent = (props: MemoTestProps) => {
  const { object, memoizationLevel } = props;
  const meshRef = useRef<THREE.Mesh>(null);
  const [counter, setCounter] = useState(0);

  // Simple animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }

    // Update counter every second to force re-renders
    if (Math.floor(state.clock.getElapsedTime()) > counter) {
      setCounter(Math.floor(state.clock.getElapsedTime()));
    }
  });

  // Log creation to see how often components are recreated
  console.log(
    `MemoTest (${memoizationLevel}) rendering: ${object.name} - Counter: ${counter}`
  );

  // Memoize geometry - used by partial and full memoization
  const geometry = useMemo(() => {
    if (memoizationLevel === "none") {
      return getGeometry(object.geometryType);
    }
    console.log(`Creating geometry for ${object.name}`);
    return getGeometry(object.geometryType);
  }, [memoizationLevel, object.geometryType, object.name]);

  // Memoize material - used only by full memoization
  const material = useMemo(() => {
    if (memoizationLevel === "none" || memoizationLevel === "partial") {
      return getMaterial(object.materialType, object.color);
    }
    console.log(`Creating material for ${object.name}`);
    return getMaterial(object.materialType, object.color);
  }, [memoizationLevel, object.materialType, object.color, object.name]);

  return (
    <group position={object.position}>
      <mesh ref={meshRef} geometry={geometry} material={material}>
        <Text position={[0, 1.2, 0]} fontSize={0.2}>
          {`${
            memoizationLevel.charAt(0).toUpperCase() + memoizationLevel.slice(1)
          } Memo (${counter})`}
        </Text>
      </mesh>
    </group>
  );
};

// Helper to create geometry based on type
const getGeometry = (type: string): THREE.BufferGeometry => {
  switch (type) {
    case "box":
      return new THREE.BoxGeometry(1, 1, 1);
    case "sphere":
      return new THREE.SphereGeometry(0.5, 32, 32);
    case "cylinder":
      return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    case "cone":
      return new THREE.ConeGeometry(0.5, 1, 32);
    case "torus":
      return new THREE.TorusGeometry(0.5, 0.2, 16, 32);
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
};

// Helper to create material based on type
const getMaterial = (type: string, color: string): THREE.Material => {
  switch (type) {
    case "normal":
      return new THREE.MeshNormalMaterial();
    case "phong":
      return new THREE.MeshPhongMaterial({ color });
    case "standard":
      return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.5,
        metalness: 0.5,
      });
    case "basic":
      return new THREE.MeshBasicMaterial({ color });
    default:
      return new THREE.MeshStandardMaterial({ color });
  }
};

// Custom comparison function for memoizing
const arePropsEqual = (prevProps: MemoTestProps, nextProps: MemoTestProps) => {
  return (
    prevProps.memoizationLevel === nextProps.memoizationLevel &&
    prevProps.object.id === nextProps.object.id &&
    prevProps.object.geometryType === nextProps.object.geometryType &&
    prevProps.object.materialType === nextProps.object.materialType &&
    prevProps.object.color === nextProps.object.color &&
    prevProps.object.position[0] === nextProps.object.position[0] &&
    prevProps.object.position[1] === nextProps.object.position[1] &&
    prevProps.object.position[2] === nextProps.object.position[2]
  );
};

// Use only React.memo with custom comparison
const MemoTest = React.memo(MemoTestComponent, arePropsEqual);

export default MemoTest;
