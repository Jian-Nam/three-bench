import type { GeometryTestResult } from "./GeometryBenchmark";

interface GeometryBenchmarkResultProps {
  results: GeometryTestResult[];
}

export const GeometryBenchmarkResult = ({
  results,
}: GeometryBenchmarkResultProps) => {
  return (
    <div className="benchmark-results">
      <h3>Results</h3>
      {results.length === 0 ? (
        <p>No results yet. Run the benchmark to see performance metrics.</p>
      ) : (
        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Geometry</th>
                <th>Vertices</th>
                <th>Creation Time</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{result.type}</td>
                  <td>{result.vertexCount}</td>
                  <td>{result.geometryInstanceCreationTime.toFixed(2)} ms</td>
                  <td>{result.meshInstancingTime.toFixed(2)} ms</td>
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
              <strong>Total Geometries Tested:</strong> {results.length}
            </li>
            <li>
              <strong>Average Creation Time:</strong>{" "}
              {(
                results.reduce(
                  (sum, r) => sum + r.geometryInstanceCreationTime,
                  0
                ) / results.length
              ).toFixed(2)}{" "}
              ms
            </li>
            <li>
              <strong>Average Mesh Instancing Time:</strong>{" "}
              {(
                results.reduce((sum, r) => sum + r.meshInstancingTime, 0) /
                results.length
              ).toFixed(2)}{" "}
              ms
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
