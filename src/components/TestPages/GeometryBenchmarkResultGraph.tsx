import React from "react";
import type { GeometryTestResult } from "./GeometryBenchmark";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GeometryBenchmarkResultProps {
  results: GeometryTestResult[];
}

export const GeometryBenchmarkResultGraph = ({
  results,
}: GeometryBenchmarkResultProps) => {
  const geometryColors = {
    box: "#8884d8",
    sphere: "#82ca9d",
    cylinder: "#ffc658",
    plane: "#ff8042",
    torus: "#0088fe",
    meshInstancing: "#ffffff",
  };

  // 지오메트리 유형별 데이터 분류
  const getDataByGeometryType = () => {
    const dataByType: Record<string, any[]> = {};
    dataByType["meshInstancing"] = [];

    results.forEach((result) => {
      if (!dataByType[result.type]) {
        dataByType[result.type] = [];
      }

      dataByType[result.type].push({
        x: result.vertexCount,
        y: result.geometryInstanceCreationTime,
        name: `${result.type} (${Object.entries(result.parameters)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")})`,
      });

      dataByType["meshInstancing"].push({
        x: result.vertexCount,
        y: result.meshInstancingTime,
        name: `${result.type} (${Object.entries(result.parameters)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")})`,
      });
    });

    return dataByType;
  };

  return (
    <div style={{ width: "100%", height: 400, marginBottom: 30 }}>
      <h4>Vertices vs Creation Time</h4>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="x"
            name="Vertices"
            label={{
              value: "Vertices",
              position: "insideBottomRight",
              offset: -10,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Creation Time (ms)"
            label={{
              value: "Creation Time (ms)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value: number) => [value.toFixed(2), ""]}
            labelFormatter={(value) => `Vertices: ${value}`}
            content={(props) => {
              const { active, payload } = props;
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div
                    className="custom-tooltip"
                    style={{
                      backgroundColor: "black",
                      padding: "10px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <p>
                      <strong>{data.name}</strong>
                    </p>
                    <p>Vertices: {data.x}</p>
                    <p>Creation Time: {data.y.toFixed(2)} ms</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          {/* 각 지오메트리 유형별로 다른 색상의 Scatter 추가 */}
          {Object.entries(getDataByGeometryType()).map(([type, data]) => (
            <Scatter
              key={type}
              name={type}
              data={data}
              fill={geometryColors[type as keyof typeof geometryColors]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
