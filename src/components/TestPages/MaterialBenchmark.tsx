import React, { useState, useCallback } from "react";
import { measureMaterialPerformance } from "./measureMaterialPerformace";
import { MaterialBenchmarkResultMatrix } from "./MaterialBenchmarkResultMatrix";
import { MaterialBenchmarkResultGraph } from "./MaterialBenchmarkResultGraph";

export interface MaterialTestResult {
  type: string;
  parameters: { width: number; height: number };
  textureSize: number;
  textureCreationTime: number;
  materialCreationTime: number;
}

// Control panel for benchmark tests
const MaterialBenchmark: React.FC = () => {
  const [results, setResults] = useState<MaterialTestResult[]>([]);
  const [progress, setProgress] = useState<number>(0);

  // Define test configurations for various material types
  const generateTests = useCallback(() => {
    const configs: Array<{
      type: string;
      params: { width: number; height: number };
    }> = [];

    // 최소한의 텍스처 테스트만 추가
    // const baseTests = [
    //   { width: 64, height: 64 },
    //   { width: 256, height: 256 },
    //   { width: 1024, height: 1024 },
    //   { width: 4096, height: 4096 },
    // ];

    const randomTests = Array.from({ length: 100 }, () => ({
      width: Math.floor(Math.random() * 4000) + 1,
      height: Math.floor(Math.random() * 4000) + 1,
    }));

    // Test textures with standard material only to simplify
    // baseTests.forEach((baseTest) => {
    //   configs.push({ type: "base", params: baseTest });
    // });

    randomTests.forEach((randomTest) => {
      configs.push({ type: "random", params: randomTest });
    });

    return configs;
  }, []);

  // Start the benchmark tests
  const startTests = useCallback(() => {
    setResults([]);
    const configs = generateTests();
    configs.forEach((config, index) => {
      const result = measureMaterialPerformance(config);
      setResults((prev) => [...prev, result]);
      setProgress(Math.floor((index / configs.length) * 100));
    });
  }, [generateTests]);

  return (
    <div className="material-benchmark">
      <div className="benchmark-controls">
        <p>
          This test measures the overhead of creating various Three.js materials
          with different complexity levels. It tracks instance creation time,
          memory usage, and GPU upload time.
        </p>

        <button className="benchmark-button" onClick={startTests}>
          Start Bench
        </button>
      </div>
      <div>{progress}%</div>
      <MaterialBenchmarkResultGraph results={results} />
      <MaterialBenchmarkResultMatrix results={results} />
    </div>
  );
};

export default MaterialBenchmark;
