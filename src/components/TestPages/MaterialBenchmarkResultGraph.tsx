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
import type { MaterialTestResult } from "./MaterialBenchmark";

interface MaterialBenchmarkResultProps {
  results: MaterialTestResult[];
}
interface MaterialTestData {
  x: number;
  y: number;
  name: string;
}

export const MaterialBenchmarkResultGraph = ({
  results,
}: MaterialBenchmarkResultProps) => {
  const materialColors = {
    textureInstancing: "#0088fe",
    materialInstancing: "#808080",
  };

  // 지오메트리 유형별 데이터 분류
  const getDataByMaterialType = () => {
    const dataByType: Record<string, MaterialTestData[]> = {};
    dataByType["materialInstancing"] = [];
    dataByType["textureInstancing"] = [];

    results.forEach((result) => {
      dataByType["textureInstancing"].push({
        x: result.textureSize,
        y: result.textureCreationTime,
        name: `${result.type} (${Object.entries(result.parameters)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")})`,
      });

      dataByType["materialInstancing"].push({
        x: result.textureSize,
        y: result.materialCreationTime,
        name: `${result.type} (${Object.entries(result.parameters)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")})`,
      });
    });

    return dataByType;
  };

  return (
    <div style={{ width: "100%", height: 400, marginBottom: 30 }}>
      <h4>Size vs Creation Time</h4>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="x"
            name="Size"
            label={{
              value: "Size",
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
          {Object.entries(getDataByMaterialType()).map(([type, data]) => (
            <Scatter
              key={type}
              name={type}
              data={data}
              fill={materialColors[type as keyof typeof materialColors]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
