import React, { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import MemoTest from "./MemoTest";
import type { SceneObject } from "../store/sceneStore";
import { observer } from "mobx-react-lite";

interface TestPageProps {
  showStats: boolean;
}

// Create test objects for our memoization tests
const createTestObject = (
  id: string,
  position: [number, number, number]
): SceneObject => {
  return {
    id,
    name: `Test Object ${id}`,
    position,
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    geometryType: "box",
    materialType: "standard",
    color: "#ff0000",
    children: [],
    visible: true,
  };
};

/**
 * Test page component for performance experiments
 */
const TestPage = observer((props: TestPageProps) => {
  const { showStats } = props;
  const [testObjects, setTestObjects] = useState<SceneObject[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);

  // Create initial test objects
  useEffect(() => {
    const objects = [
      createTestObject("test1", [-3, 0, 0]),
      createTestObject("test2", [0, 0, 0]),
      createTestObject("test3", [3, 0, 0]),
    ];

    setTestObjects(objects);
  }, []);

  // Function to update all objects (with unique references)
  const updateObjects = () => {
    setTestObjects((prev) => {
      return prev.map((obj) => ({
        ...obj,
        rotation: [obj.rotation[0], obj.rotation[1] + 0.1, obj.rotation[2]],
      }));
    });

    setUpdateCounter((count) => count + 1);
  };

  // Function to update an object's geometry type
  const updateGeometryType = () => {
    const types: Array<"box" | "sphere" | "cylinder" | "cone" | "torus"> = [
      "box",
      "sphere",
      "cylinder",
      "cone",
      "torus",
    ];

    setTestObjects((prev) => {
      return prev.map((obj) => ({
        ...obj,
        geometryType: types[Math.floor(Math.random() * types.length)],
      }));
    });

    setUpdateCounter((count) => count + 1);
  };

  // Function to update an object's material type
  const updateMaterialType = () => {
    const types: Array<"normal" | "phong" | "standard" | "basic"> = [
      "normal",
      "phong",
      "standard",
      "basic",
    ];

    setTestObjects((prev) => {
      return prev.map((obj) => ({
        ...obj,
        materialType: types[Math.floor(Math.random() * types.length)],
      }));
    });

    setUpdateCounter((count) => count + 1);
  };

  // Function to update an object's color
  const updateColor = () => {
    setTestObjects((prev) => {
      return prev.map((obj) => ({
        ...obj,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      }));
    });

    setUpdateCounter((count) => count + 1);
  };

  // Memoize MemoTest components
  const memoTestComponents = useMemo(() => {
    if (testObjects.length === 0) return null;

    return (
      <>
        <MemoTest object={testObjects[0]} memoizationLevel="none" />
        <MemoTest object={testObjects[1]} memoizationLevel="partial" />
        <MemoTest object={testObjects[2]} memoizationLevel="full" />
      </>
    );
  }, [testObjects]);

  return (
    <div className="test-page">
      <div className="test-controls">
        <h2>R3F Performance Tests</h2>

        <div className="test-buttons">
          <button className="control-button" onClick={updateObjects}>
            Update Rotation
          </button>
          <button className="control-button" onClick={updateGeometryType}>
            Change Geometry
          </button>
          <button className="control-button" onClick={updateMaterialType}>
            Change Material
          </button>
          <button className="control-button" onClick={updateColor}>
            Change Color
          </button>
        </div>

        <div className="test-info">
          <p>
            <strong>Update counter: {updateCounter}</strong>
          </p>
          <p>
            This test showcases how different memoization strategies affect R3F
            performance. Open the console to see which objects are recreated on
            each update.
          </p>
          <ul>
            <li>
              <strong>Left:</strong> No memoization - recreates geometry and
              material on every render
            </li>
            <li>
              <strong>Middle:</strong> Partial memoization - memoizes geometry
              but recreates material on each render
            </li>
            <li>
              <strong>Right:</strong> Full memoization - memoizes both geometry
              and material
            </li>
          </ul>
        </div>
      </div>

      <div className="test-canvas">
        <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
          {/* Scene lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          {/* Test objects with different memoization levels */}
          {memoTestComponents}

          {/* Grid for reference */}
          <gridHelper args={[10, 10]} />

          {/* Controls */}
          <OrbitControls />

          {/* Stats */}
          {showStats && <Stats />}
        </Canvas>
      </div>
    </div>
  );
});

export default TestPage;
