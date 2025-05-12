import React, { useState, useCallback } from "react";
import { measureGeometryPerformance } from "./TestGeometry";
import { GeometryBenchmarkResult } from "./GeometryBenchmarkResult";
import { GeometryBenchmarkResultGraph } from "./GeometryBenchmarkResultGraph";

export interface GeometryTestResult {
  type: string;
  parameters: Record<string, number>;
  vertexCount: number;
  geometryInstanceCreationTime: number;
  meshInstancingTime: number;
}

// Control panel for benchmark tests
const GeometryBenchmark: React.FC = () => {
  const [results, setResults] = useState<GeometryTestResult[]>([]);

  const [testMode, setTestMode] = useState<
    "all" | "basic" | "extreme" | "random"
  >("basic");

  const createRandomBoxTest = useCallback(() => {
    const widthSegments = Math.floor(Math.random() * 40) + 1;
    const heightSegments = Math.floor(Math.random() * 40) + 1;
    const depthSegments = Math.floor(Math.random() * 40) + 1;
    return { widthSegments, heightSegments, depthSegments };
  }, []);

  const createRandomSphereTest = useCallback(() => {
    const radius = Math.floor(Math.random() * 10) + 1;
    const widthSegments = Math.floor(Math.random() * 200) + 1;
    const heightSegments = Math.floor(Math.random() * 200) + 1;
    return { radius, widthSegments, heightSegments };
  }, []);

  const createRandomCylinderTest = useCallback(() => {
    const radius = Math.floor(Math.random() * 10) + 1;
    const heightSegments = Math.floor(Math.random() * 200) + 1;
    const radialSegments = Math.floor(Math.random() * 200) + 1;
    return { radius, heightSegments, radialSegments };
  }, []);

  const createRandomPlaneTest = useCallback(() => {
    const width = Math.floor(Math.random() * 10) + 1;
    const height = Math.floor(Math.random() * 10) + 1;
    const widthSegments = Math.floor(Math.random() * 200) + 1;
    const heightSegments = Math.floor(Math.random() * 200) + 1;
    return { width, height, widthSegments, heightSegments };
  }, []);

  const createRandomTorusTest = useCallback(() => {
    const radius = Math.floor(Math.random() * 10) + 1;
    const tube = Math.floor(Math.random() * 10) + 1;
    const radialSegments = Math.floor(Math.random() * 200) + 1;
    const tubularSegments = Math.floor(Math.random() * 200) + 1;
    return { radius, tube, radialSegments, tubularSegments };
  }, []);

  const createRandomTest = useCallback(() => {
    const boxTests = Array.from({ length: 100 }, createRandomBoxTest);
    const sphereTests = Array.from({ length: 100 }, createRandomSphereTest);
    const cylinderTests = Array.from({ length: 100 }, createRandomCylinderTest);
    const planeTests = Array.from({ length: 100 }, createRandomPlaneTest);
    const torusTests = Array.from({ length: 100 }, createRandomTorusTest);

    const test = {
      box: boxTests,
      sphere: sphereTests,
      cylinder: cylinderTests,
      plane: planeTests,
      torus: torusTests,
    };
    return test;
  }, [
    createRandomBoxTest,
    createRandomSphereTest,
    createRandomCylinderTest,
    createRandomPlaneTest,
    createRandomTorusTest,
  ]);

  // Define the presets for various geometry tests, separated by complexity
  const getTestPresets = useCallback(() => {
    // Basic tests (fewer and less complex geometries)
    const basicTests = {
      box: [{ widthSegments: 1, heightSegments: 1, depthSegments: 1 }],
      sphere: [{ radius: 1, widthSegments: 8, heightSegments: 6 }],
      cylinder: [{ radialSegments: 8, heightSegments: 1 }],
      plane: [{ width: 10, height: 10, widthSegments: 1, heightSegments: 1 }],
      torus: [{ radius: 1, tube: 0.4, radialSegments: 8, tubularSegments: 24 }],
    };

    // All tests, including more complex ones
    const allTests = {
      box: [
        { widthSegments: 1, heightSegments: 1, depthSegments: 1 },
        { widthSegments: 5, heightSegments: 5, depthSegments: 5 },
      ],
      sphere: [
        { radius: 1, widthSegments: 8, heightSegments: 6 },
        { radius: 1, widthSegments: 16, heightSegments: 12 },
      ],
      cylinder: [
        { radialSegments: 8, heightSegments: 1 },
        { radialSegments: 16, heightSegments: 1 },
      ],
      plane: [
        { width: 10, height: 10, widthSegments: 1, heightSegments: 1 },
        { width: 10, height: 10, widthSegments: 10, heightSegments: 10 },
      ],
      torus: [
        { radius: 1, tube: 0.4, radialSegments: 8, tubularSegments: 24 },
        { radius: 1, tube: 0.4, radialSegments: 12, tubularSegments: 48 },
      ],
    };

    // Extreme tests (high-resolution geometries)
    const extremeTests = {
      box: [
        { widthSegments: 1, heightSegments: 1, depthSegments: 1 },
        { widthSegments: 5, heightSegments: 5, depthSegments: 5 },
        { widthSegments: 10, heightSegments: 10, depthSegments: 10 },
        { widthSegments: 20, heightSegments: 20, depthSegments: 20 },
        { widthSegments: 40, heightSegments: 40, depthSegments: 40 },
      ],
      sphere: [
        { radius: 1, widthSegments: 16, heightSegments: 1 },
        { radius: 1, widthSegments: 32, heightSegments: 24 },
        { radius: 1, widthSegments: 64, heightSegments: 48 },
        { radius: 1, widthSegments: 128, heightSegments: 96 },
      ],
      cylinder: [
        { radialSegments: 16, heightSegments: 4 },
        { radialSegments: 32, heightSegments: 8 },
        { radialSegments: 64, heightSegments: 16 },
        { radialSegments: 128, heightSegments: 32 },
      ],
      plane: [
        { width: 10, height: 10, widthSegments: 1, heightSegments: 1 },
        { width: 10, height: 10, widthSegments: 50, heightSegments: 50 },
        { width: 10, height: 10, widthSegments: 100, heightSegments: 100 },
        { width: 10, height: 10, widthSegments: 200, heightSegments: 200 },
      ],
      torus: [
        { radius: 1, tube: 0.4, radialSegments: 16, tubularSegments: 96 },
        { radius: 1, tube: 0.4, radialSegments: 32, tubularSegments: 192 },
        { radius: 1, tube: 0.4, radialSegments: 64, tubularSegments: 384 },
        { radius: 1, tube: 0.4, radialSegments: 128, tubularSegments: 768 },
      ],
    };

    const randomTests = createRandomTest();

    return { basicTests, allTests, extremeTests, randomTests };
  }, []);

  // Function to generate test configurations
  const generateTests = useCallback(() => {
    const configs: Array<{ type: string; params: Record<string, number> }> = [];
    const { basicTests, allTests, extremeTests, randomTests } =
      getTestPresets();

    let selectedPresets;
    if (testMode === "basic") {
      selectedPresets = basicTests;
    } else if (testMode === "all") {
      selectedPresets = allTests;
    } else if (testMode === "random") {
      selectedPresets = randomTests;
    } else {
      // extreme
      selectedPresets = extremeTests;
    }

    // Add tests for each geometry type
    Object.entries(selectedPresets).forEach(([type, presets]) => {
      presets.forEach((preset) => {
        configs.push({ type, params: { ...preset } });
      });
    });

    return configs;
  }, [testMode, getTestPresets]);

  const forceGarbageCollection = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).gc) {
      try {
        (window as any).gc();
      } catch (_) {
        console.log("Could not force garbage collection");
      }
    }
  }, []);
  // Start the benchmark tests
  const startTests = useCallback(() => {
    setResults([]);
    const configs = generateTests();
    configs.forEach((config) => {
      const result = measureGeometryPerformance(config.type, config.params);
      setResults((prev) => [...prev, result]);

      // Force a garbage collection if possible
      forceGarbageCollection();
    });
  }, [generateTests, forceGarbageCollection]);

  return (
    <div className="geometry-benchmark">
      <div className="benchmark-controls">
        <h2>Geometry Creation Benchmark</h2>
        <p>
          This test measures the overhead of creating various Three.js
          geometries with different complexity levels. It tracks instance
          creation time, memory usage, and GPU upload time.
        </p>

        <div className="benchmark-options">
          <div className="test-mode-selector">
            <label>Test Mode:</label>
            <select
              value={testMode}
              onChange={(e) =>
                setTestMode(e.target.value as "all" | "basic" | "extreme")
              }
            >
              <option value="basic">Basic Tests (Fast)</option>
              <option value="all">Standard Tests</option>
              <option value="extreme">Extreme Tests (High Resolution)</option>
              <option value="random">Random Tests</option>
            </select>
          </div>

          <button className="benchmark-button" onClick={startTests}></button>
        </div>
      </div>
      <GeometryBenchmarkResultGraph results={results} />
      <GeometryBenchmarkResult results={results} />
    </div>
  );
};

export default GeometryBenchmark;
