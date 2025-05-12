import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useSceneData } from "../../store/sceneStore";
import {
  getAllPerformanceMetrics,
  getAggregatedMetrics,
  clearPerformanceMetrics,
} from "../../utils/tracking/performanceTracker";

/**
 * Component to display Three.js performance metrics
 */
const PerformanceMonitor: React.FC = observer(() => {
  const [showDetails, setShowDetails] = useState(false);
  const [metrics, setMetrics] =
    useState<ReturnType<typeof getAggregatedMetrics>>(null);
  const [detailedMetrics, setDetailedMetrics] = useState<
    ReturnType<typeof getAllPerformanceMetrics>
  >([]);
  const sceneData = useSceneData();

  // Update metrics when scene changes
  useEffect(() => {
    const aggregated = getAggregatedMetrics();
    setMetrics(aggregated);

    if (showDetails) {
      setDetailedMetrics(getAllPerformanceMetrics());
    }
  }, [sceneData.lastUpdateTimestamp, showDetails]);

  if (!metrics) {
    return (
      <div className="performance-monitor">
        <h3>Performance Metrics</h3>
        <p>
          No performance data available yet. Create or modify objects to see
          metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="performance-monitor">
      <h3>Performance Metrics</h3>

      <div className="metrics-summary">
        <div className="metric-item">
          <span className="metric-label">Total Objects:</span>
          <span className="metric-value">{metrics.totalObjects}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Total Vertices:</span>
          <span className="metric-value">{metrics.totalVertices}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Avg Creation Time:</span>
          <span className="metric-value">
            {metrics.avgCreationTime?.toFixed(2)} ms
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Avg Geometry Init Time:</span>
          <span className="metric-value">
            {metrics.avgGeometryTime?.toFixed(2)} ms
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Avg Material Init Time:</span>
          <span className="metric-value">
            {metrics.avgMaterialTime?.toFixed(2)} ms
          </span>
        </div>
        {metrics.avgGpuTime !== null && (
          <div className="metric-item">
            <span className="metric-label">Avg GPU Upload Time:</span>
            <span className="metric-value">
              {metrics.avgGpuTime?.toFixed(2)} ms
            </span>
          </div>
        )}
      </div>

      <div className="metrics-actions">
        <button
          className="control-button"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
        <button
          className="control-button"
          onClick={() => clearPerformanceMetrics()}
        >
          Clear Metrics
        </button>
      </div>

      {showDetails && (
        <div className="detailed-metrics">
          <h4>Detailed Object Metrics</h4>
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Vertices</th>
                <th>Creation Time</th>
                <th>Geometry Time</th>
                <th>Material Time</th>
                {detailedMetrics.some((m) => m.gpuUploadTime !== null) && (
                  <th>GPU Time</th>
                )}
              </tr>
            </thead>
            <tbody>
              {detailedMetrics.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.geometryType}</td>
                  <td>{m.totalVertices}</td>
                  <td>{m.creationTime.toFixed(2)} ms</td>
                  <td>{m.geometryInitTime.toFixed(2)} ms</td>
                  <td>{m.materialInitTime.toFixed(2)} ms</td>
                  {detailedMetrics.some((m) => m.gpuUploadTime !== null) && (
                    <td>
                      {m.gpuUploadTime
                        ? `${m.gpuUploadTime.toFixed(2)} ms`
                        : "N/A"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default PerformanceMonitor;
