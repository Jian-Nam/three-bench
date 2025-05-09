import React, { useState } from "react";
import { useSceneData, useSceneStore } from "../store/sceneStore";
import type { SceneObject } from "../store/sceneStore";
import { observer } from "mobx-react-lite";

interface ControlsProps {
  onRandomize: () => void;
  onReset: () => void;
  showStats: boolean;
  onToggleStats: () => void;
}

// Controls panel for the 3D scene
const ControlsComponent = (props: ControlsProps) => {
  const { onRandomize, onReset, showStats, onToggleStats } = props;

  const sceneData = useSceneData();
  const store = useSceneStore();
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [showSceneData, setShowSceneData] = useState(false);

  // Track performance metrics
  const [performanceData, setPerformanceData] = useState<{
    objectCount: number;
    sceneUpdateTime: number;
    lastUpdateTimestamp: number;
  }>({
    objectCount: 0,
    sceneUpdateTime: 0,
    lastUpdateTimestamp: 0,
  });

  // Function to count total objects in the scene
  const countObjects = (objects: SceneObject[]): number => {
    return objects.reduce((count, obj) => {
      return count + 1 + countObjects(obj.children);
    }, 0);
  };

  // Function to render object tree
  const renderObjectTree = (objects: SceneObject[], depth = 0) => {
    return objects.map((obj) => (
      <div key={obj.id} style={{ marginLeft: `${depth * 20}px` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "4px 0",
            backgroundColor:
              selectedObjectId === obj.id ? "#2d3748" : "transparent",
            cursor: "pointer",
          }}
          onClick={() => setSelectedObjectId(obj.id)}
        >
          <span
            style={{
              marginRight: "8px",
              opacity: obj.visible ? 1 : 0.5,
              textDecoration: obj.visible ? "none" : "line-through",
              fontSize: "0.8rem",
            }}
          >
            {obj.name} ({obj.geometryType})
          </span>

          <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
            <button
              className="tree-button"
              onClick={(e) => {
                e.stopPropagation();
                store.toggleVisibility(obj.id);
              }}
            >
              {obj.visible ? "Hd" : "Sh"}
            </button>

            <button
              className="tree-button"
              onClick={(e) => {
                e.stopPropagation();
                store.removeObject(obj.id);
              }}
            >
              Rm
            </button>

            <button
              className="tree-button"
              disabled={!selectedObjectId || selectedObjectId === obj.id}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedObjectId) {
                  store.reparentObject(selectedObjectId, obj.id);
                  setSelectedObjectId(null);
                }
              }}
            >
              Mv
            </button>
          </div>
        </div>

        {obj.children.length > 0 && renderObjectTree(obj.children, depth + 1)}
      </div>
    ));
  };

  // Update performance metrics when scene changes
  React.useEffect(() => {
    const totalObjects = countObjects(sceneData.root);
    const updateTime = Date.now() - sceneData.lastUpdateTimestamp;

    setPerformanceData({
      objectCount: totalObjects,
      sceneUpdateTime: updateTime,
      lastUpdateTimestamp: sceneData.lastUpdateTimestamp,
    });
  }, [sceneData]);

  return (
    <div className="controls">
      <div className="control-group">
        <h2>Scene Management</h2>
        <button className="control-button" onClick={onReset}>
          Reset Scene
        </button>
        <button className="control-button" onClick={onRandomize}>
          Randomize Scene
        </button>
        <button
          className="control-button"
          onClick={() => setShowSceneData(!showSceneData)}
        >
          {showSceneData ? "Hide" : "Show"} Scene Data
        </button>
      </div>

      <div className="control-group">
        <h2>Object Tree</h2>
        {renderObjectTree(sceneData.root)}

        {selectedObjectId && (
          <div style={{ marginTop: "8px" }}>
            <button
              className="control-button"
              onClick={() => {
                if (selectedObjectId) {
                  store.reparentObject(selectedObjectId, null);
                  setSelectedObjectId(null);
                }
              }}
            >
              Move to Root
            </button>
            <button
              className="control-button"
              onClick={() => setSelectedObjectId(null)}
            >
              Cancel Selection
            </button>
          </div>
        )}

        <button
          className="control-button"
          onClick={() =>
            store.addObject(selectedObjectId, {
              name: `New_${Math.floor(Math.random() * 1000)}`,
              geometryType: "box",
              materialType: "normal",
              color: "#" + Math.floor(Math.random() * 16777215).toString(16),
            })
          }
        >
          Add Object {selectedObjectId ? "as Child" : "to Root"}
        </button>
      </div>

      <div className="control-group">
        <h2>Performance</h2>
        <div>
          Objects: <strong>{performanceData.objectCount}</strong>
        </div>
        <div>
          Last update: <strong>{performanceData.sceneUpdateTime}ms</strong>
        </div>
      </div>

      <div className="stats-toggle">
        <input
          type="checkbox"
          id="stats"
          checked={showStats}
          onChange={onToggleStats}
        />
        <label htmlFor="stats">Show Stats</label>
      </div>

      {showSceneData && (
        <div className="control-group">
          <h2>Raw Scene Data</h2>
          <pre>{JSON.stringify(sceneData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// Use observer in a separate variable
const Controls = observer(ControlsComponent);

export default Controls;
