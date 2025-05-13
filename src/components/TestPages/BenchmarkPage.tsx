import React from "react";
import { useLocation } from "react-router-dom";
import GeometryBenchmark from "./GeometryBenchmark";
import MaterialBenchmark from "./MaterialBenchmark";
import { Link } from "react-router-dom";

/**
 * Benchmark page with tabs for different Three.js performance tests
 */
const BenchmarkPage: React.FC = () => {
  const location = useLocation();

  // Check URL path to determine which tab is active
  const currentTab = location.pathname.includes("/benchmark/material")
    ? "material"
    : "geometry";

  // Render the appropriate benchmark component based on the path
  const renderBenchmarkContent = () => {
    if (currentTab === "material") {
      return <MaterialBenchmark />;
    }
    return <GeometryBenchmark />;
  };

  return (
    <div className="content-container">
      <div className="benchmark-page">
        <div className="benchmark-header">
          <h1>Three.js Performance Benchmarks</h1>
          <p>
            Test the performance of various Three.js operations including
            geometry and material creation, rendering, and memory usage.
          </p>
        </div>

        <div className="benchmark-tabs">
          <Link
            to="/benchmark/geometry"
            className={`tab-button ${
              currentTab === "geometry" ? "active" : ""
            }`}
          >
            Geometry Tests
          </Link>
          <Link
            to="/benchmark/material"
            className={`tab-button ${
              currentTab === "material" ? "active" : ""
            }`}
          >
            Material Tests
          </Link>
        </div>

        <div className="benchmark-content">{renderBenchmarkContent()}</div>
      </div>
    </div>
  );
};

export default BenchmarkPage;
