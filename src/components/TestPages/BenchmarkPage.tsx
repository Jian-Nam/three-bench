import React, { useState } from "react";
import GeometryBenchmark from "./GeometryBenchmark";
import MaterialBenchmark from "./MaterialBenchmark";

/**
 * Benchmark page with tabs for different Three.js performance tests
 */
const BenchmarkPage: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<"geometry" | "material">(
    "geometry"
  );

  return (
    <div className="benchmark-page">
      <div className="benchmark-header">
        <h1>Three.js Performance Benchmarks</h1>
        <p>
          Test the performance of various Three.js operations including geometry
          and material creation, rendering, and memory usage.
        </p>
      </div>

      <div className="benchmark-tabs">
        <button
          className={`tab-button ${activeTab === "geometry" ? "active" : ""}`}
          onClick={() => setActiveTab("geometry")}
        >
          Geometry Tests
        </button>
        <button
          className={`tab-button ${activeTab === "material" ? "active" : ""}`}
          onClick={() => setActiveTab("material")}
        >
          Material Tests
        </button>
      </div>

      <div className="benchmark-content">
        {activeTab === "geometry" && <GeometryBenchmark />}
        {activeTab === "material" && <MaterialBenchmark />}
      </div>
    </div>
  );
};

export default BenchmarkPage;
