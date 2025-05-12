import React, { useState, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { Stats } from "@react-three/drei";

interface MaterialTestResult {
  name: string;
  type: string;
  parameters: Record<string, unknown>; // any 대신 unknown 사용
  textureCount: number;
  textureResolution: number;
  instanceCreationTime: number;
  memoryUsage: number;
  gpuUploadTime: number | null;
  uniformCount: number;
}

// Component that renders a single test material
const TestMaterial: React.FC<{
  type: string;
  params: Record<string, unknown>; // any 대신 unknown 사용
  textureSize?: number;
  textureCount?: number;
  onResultsCollected: (result: MaterialTestResult) => void;
  visible: boolean;
}> = ({
  type,
  params,
  textureSize = 512,
  textureCount = 0,
  onResultsCollected,
  visible,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  const measured = useRef(false);

  // Create textures with specified size for testing
  const createTestTextures = useCallback(
    (count: number, size: number): THREE.Texture[] => {
      const textures: THREE.Texture[] = [];

      for (let i = 0; i < count; i++) {
        // Create a canvas to generate texture
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Fill with a gradient
          const gradient = ctx.createLinearGradient(0, 0, size, size);
          gradient.addColorStop(0, `hsl(${i * 30}, 100%, 50%)`);
          gradient.addColorStop(1, `hsl(${i * 30 + 60}, 100%, 50%)`);

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, size, size);

          // Add some random elements for complexity
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          for (let j = 0; j < 10; j++) {
            ctx.beginPath();
            ctx.arc(
              Math.random() * size,
              Math.random() * size,
              Math.random() * (size / 8) + 5,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        textures.push(texture);
      }

      return textures;
    },
    []
  );

  // Measure performance when the component is mounted
  useEffect(() => {
    if (!meshRef.current || !visible || measured.current) return;

    const renderer = gl as THREE.WebGLRenderer;

    // Define the material instance creation and performance measurement function
    const measureMaterialPerformance = () => {
      // Create textures if needed
      const generatedTextures =
        textureCount > 0 ? createTestTextures(textureCount, textureSize) : [];

      // Add textures to params if created
      const finalParams: Record<string, any> = { ...params }; // 타입 안전성을 위해 any 타입 사용
      if (generatedTextures.length > 0) {
        switch (type) {
          case "standard":
            if (generatedTextures.length > 0)
              finalParams.map = generatedTextures[0];
            if (generatedTextures.length > 1)
              finalParams.normalMap = generatedTextures[1];
            if (generatedTextures.length > 2)
              finalParams.roughnessMap = generatedTextures[2];
            if (generatedTextures.length > 3)
              finalParams.metalnessMap = generatedTextures[3];
            if (generatedTextures.length > 4)
              finalParams.emissiveMap = generatedTextures[4];
            break;

          case "physical":
            if (generatedTextures.length > 0)
              finalParams.map = generatedTextures[0];
            if (generatedTextures.length > 1)
              finalParams.normalMap = generatedTextures[1];
            if (generatedTextures.length > 2)
              finalParams.roughnessMap = generatedTextures[2];
            if (generatedTextures.length > 3)
              finalParams.metalnessMap = generatedTextures[3];
            if (generatedTextures.length > 4)
              finalParams.clearcoatMap = generatedTextures[4];
            break;

          case "phong":
            if (generatedTextures.length > 0)
              finalParams.map = generatedTextures[0];
            if (generatedTextures.length > 1)
              finalParams.normalMap = generatedTextures[1];
            if (generatedTextures.length > 2)
              finalParams.specularMap = generatedTextures[2];
            if (generatedTextures.length > 3)
              finalParams.emissiveMap = generatedTextures[3];
            break;

          case "basic":
          default:
            if (generatedTextures.length > 0)
              finalParams.map = generatedTextures[0];
        }
      }

      // START TIMING
      const startTime = performance.now();

      // Create the material based on the type
      let material: THREE.Material;

      switch (type) {
        case "basic":
          material = new THREE.MeshBasicMaterial(finalParams);
          break;

        case "standard":
          material = new THREE.MeshStandardMaterial(finalParams);
          break;

        case "physical":
          material = new THREE.MeshPhysicalMaterial(finalParams);
          break;

        case "phong":
          material = new THREE.MeshPhongMaterial(finalParams);
          break;

        case "toon":
          material = new THREE.MeshToonMaterial(finalParams);
          break;

        case "normal":
          material = new THREE.MeshNormalMaterial(finalParams);
          break;

        case "depth":
          material = new THREE.MeshDepthMaterial(finalParams);
          break;

        case "lambert":
          material = new THREE.MeshLambertMaterial(finalParams);
          break;

        case "shadermaterial":
          const shaderUniforms =
            (finalParams.uniforms as Record<string, { value: any }>) || {};
          material = new THREE.ShaderMaterial({
            uniforms: {
              time: { value: 1.0 },
              resolution: { value: new THREE.Vector2(1024, 1024) },
              ...shaderUniforms,
            },
            vertexShader:
              (finalParams.vertexShader as string) ||
              `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader:
              (finalParams.fragmentShader as string) ||
              `
              uniform float time;
              uniform vec2 resolution;
              varying vec2 vUv;
              void main() {
                vec2 st = vUv;
                gl_FragColor = vec4(st.x, st.y, sin(time) * 0.5 + 0.5, 1.0);
              }
            `,
          });
          break;

        default:
          material = new THREE.MeshBasicMaterial(finalParams);
      }

      // END INSTANCE CREATION TIMING
      const endInstanceTime = performance.now();
      const instanceCreationTime = endInstanceTime - startTime;

      // Count uniform variables (as an approximation of complexity)
      let uniformCount = 0;
      if (material instanceof THREE.ShaderMaterial) {
        uniformCount = Object.keys(material.uniforms || {}).length;
      }

      // Estimate memory usage (difficult to be precise)
      // For textures: width * height * 4 (RGBA) * textureCount
      const textureMemory = textureSize * textureSize * 4 * textureCount;
      // For material: base size + uniform count * 16 (estimate bytes per uniform, on average)
      const materialBaseSize = type === "shadermaterial" ? 2048 : 512; // Shader materials are larger
      const materialMemory = materialBaseSize + uniformCount * 16;
      const totalMemory = textureMemory + materialMemory;

      // Measure GPU upload time
      let gpuUploadTime: number | null = null;
      try {
        const startGPUTime = performance.now();

        // Force a render to ensure GPU upload
        const tempGeometry = new THREE.SphereGeometry(1, 32, 32);
        const tempMesh = new THREE.Mesh(tempGeometry, material);
        const scene = new THREE.Scene();
        scene.add(tempMesh);

        renderer.setSize(1, 1); // Minimal size
        renderer.render(scene, new THREE.PerspectiveCamera());

        // Cleanup
        scene.remove(tempMesh);
        tempGeometry.dispose();
        if (material !== meshRef.current?.material) {
          material.dispose();
        }

        const endGPUTime = performance.now();
        gpuUploadTime = endGPUTime - startGPUTime;
      } catch (error) {
        console.error("Error measuring GPU upload time:", error);
      }

      // Send results back to parent component
      onResultsCollected({
        name: `${type} ${
          textureCount > 0
            ? `(${textureCount} textures @ ${textureSize}px)`
            : ""
        }`,
        type,
        parameters: { ...params, textureSize, textureCount },
        textureCount,
        textureResolution: textureSize,
        instanceCreationTime,
        memoryUsage: totalMemory,
        gpuUploadTime,
        uniformCount,
      });

      // If we have a mesh, apply the material
      if (meshRef.current && !measured.current) {
        if (meshRef.current.material && meshRef.current.material !== material) {
          (meshRef.current.material as THREE.Material).dispose();
        }
        meshRef.current.material = material;
      }

      measured.current = true;

      // Clean up textures if we generated them
      // generatedTextures.forEach(texture => texture.dispose());
    };

    // Execute the measurement
    setTimeout(measureMaterialPerformance, 0);
  }, [
    type,
    params,
    textureSize,
    textureCount,
    gl,
    onResultsCollected,
    visible,
    createTestTextures,
  ]);

  if (!visible) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#4299e1" />
    </mesh>
  );
};

// Main benchmark scene
const BenchmarkScene: React.FC<{
  testConfig: {
    type: string;
    params: Record<string, unknown>; // any 대신 unknown 사용
    textureSize?: number;
    textureCount?: number;
  };
  onResultsCollected: (result: MaterialTestResult) => void;
}> = ({ testConfig, onResultsCollected }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <TestMaterial
        type={testConfig.type}
        params={testConfig.params}
        textureSize={testConfig.textureSize}
        textureCount={testConfig.textureCount}
        onResultsCollected={onResultsCollected}
        visible={true}
      />
    </>
  );
};

// Control panel for benchmark tests
const MaterialBenchmark: React.FC = () => {
  const [results, setResults] = useState<MaterialTestResult[]>([]);
  const [testConfigs, setTestConfigs] = useState<
    Array<{
      type: string;
      params: Record<string, unknown>; // any 대신 unknown 사용
      textureSize?: number;
      textureCount?: number;
    }>
  >([]);
  const [currentTestIndex, setCurrentTestIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Define test configurations for various material types
  const generateTests = useCallback(() => {
    const configs: Array<{
      type: string;
      params: Record<string, unknown>; // any 대신 unknown 사용
      textureSize?: number;
      textureCount?: number;
    }> = [];

    // Basic materials without textures
    const basicMaterials = [
      { type: "basic", params: { color: 0xff0000 } },
      { type: "normal", params: {} },
      { type: "phong", params: { color: 0x00ff00, shininess: 100 } },
      {
        type: "standard",
        params: { color: 0x0000ff, roughness: 0.5, metalness: 0.5 },
      },
      {
        type: "physical",
        params: {
          color: 0xffff00,
          roughness: 0.5,
          metalness: 0.5,
          clearcoat: 1.0,
        },
      },
    ];

    // Add all basic materials
    configs.push(...basicMaterials);

    // 최소한의 텍스처 테스트만 추가
    const textureTests = [
      { size: 64, count: 1 },
      { size: 256, count: 1 },
    ];

    // Test textures with standard material only to simplify
    textureTests.forEach((texTest) => {
      configs.push({
        type: "standard",
        params: { color: 0xffffff, roughness: 0.5, metalness: 0.5 },
        textureSize: texTest.size,
        textureCount: texTest.count,
      });
    });

    // 기본 쉐이더 머티리얼만 추가
    const basicShader = {
      type: "shadermaterial",
      params: {
        uniforms: {
          color: { value: new THREE.Color(0xff0000) },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform vec3 color;
          void main() {
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      },
    };

    configs.push(basicShader);

    return configs;
  }, []);

  // Start the benchmark tests
  const startTests = useCallback(() => {
    setResults([]);
    const configs = generateTests();
    setTestConfigs(configs);
    setCurrentTestIndex(0);
    setIsRunning(true);
    setProgress({ current: 0, total: configs.length });
  }, [generateTests]);

  // Collect results from each test
  const handleResultsCollected = useCallback(
    (result: MaterialTestResult) => {
      setResults((prev) => [...prev, result]);

      // Move to the next test after a longer delay
      setTimeout(() => {
        setCurrentTestIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= testConfigs.length) {
            setIsRunning(false);
            return -1;
          }
          setProgress({ current: nextIndex, total: testConfigs.length });
          return nextIndex;
        });
      }, 1200); // 지연 시간을 1.2초로 더 늘림
    },
    [testConfigs.length]
  );

  // Format bytes to human-readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="material-benchmark">
      <div className="benchmark-controls">
        <h2>Material Creation Benchmark</h2>
        <p>
          This test measures the overhead of creating various Three.js materials
          with different complexity levels. It tracks instance creation time,
          memory usage, and GPU upload time.
        </p>

        <button
          className="benchmark-button"
          onClick={startTests}
          disabled={isRunning}
        >
          {isRunning ? "Running Tests..." : "Start Benchmark"}
        </button>

        {isRunning && (
          <div className="progress-bar-container">
            <div className="progress-info">
              Testing: {progress.current} / {progress.total} materials
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="benchmark-canvas-container">
        <Canvas>
          <Stats />
          {currentTestIndex >= 0 && currentTestIndex < testConfigs.length && (
            <BenchmarkScene
              testConfig={testConfigs[currentTestIndex]}
              onResultsCollected={handleResultsCollected}
            />
          )}
        </Canvas>
      </div>

      <div className="benchmark-results">
        <h3>Results</h3>
        {results.length === 0 ? (
          <p>No results yet. Run the benchmark to see performance metrics.</p>
        ) : (
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Textures</th>
                  <th>Creation Time</th>
                  <th>Memory Usage</th>
                  <th>GPU Upload</th>
                  <th>Uniforms</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index}>
                    <td>{result.name}</td>
                    <td>
                      {result.textureCount > 0
                        ? `${result.textureCount} (${result.textureResolution}×${result.textureResolution})`
                        : "None"}
                    </td>
                    <td>{result.instanceCreationTime.toFixed(2)} ms</td>
                    <td>{formatBytes(result.memoryUsage)}</td>
                    <td>
                      {result.gpuUploadTime
                        ? `${result.gpuUploadTime.toFixed(2)} ms`
                        : "N/A"}
                    </td>
                    <td>{result.uniformCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {results.length > 0 && (
          <div className="results-summary">
            <h4>Performance Overview</h4>
            <ul>
              <li>
                <strong>Total Materials Tested:</strong> {results.length}
              </li>
              <li>
                <strong>Average Creation Time:</strong>{" "}
                {(
                  results.reduce((sum, r) => sum + r.instanceCreationTime, 0) /
                  results.length
                ).toFixed(2)}{" "}
                ms
              </li>
              <li>
                <strong>Max Creation Time:</strong>{" "}
                {Math.max(
                  ...results.map((r) => r.instanceCreationTime)
                ).toFixed(2)}{" "}
                ms (for{" "}
                {
                  results.reduce(
                    (max, r) =>
                      r.instanceCreationTime > max.instanceCreationTime
                        ? r
                        : max,
                    results[0]
                  ).name
                }
                )
              </li>
              <li>
                <strong>Total Memory Usage:</strong>{" "}
                {formatBytes(
                  results.reduce((sum, r) => sum + r.memoryUsage, 0)
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialBenchmark;
