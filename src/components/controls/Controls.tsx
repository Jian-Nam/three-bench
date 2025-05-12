import React, { useState } from "react";
import { useSceneData, useSceneStore } from "../../store/sceneStore";
import type { SceneObject } from "../../store/sceneStore";
import { observer } from "mobx-react-lite";

interface ControlsProps {
  onRandomize?: () => void;
  onReset?: () => void;
  showStats?: boolean;
  onToggleStats?: () => void;
}

// Controls panel for the 3D scene
const ControlsComponent = (props: ControlsProps) => {
  const store = useSceneStore();

  // 기본값 제공 또는 store에서 직접 메서드 사용
  const onRandomize = props.onRandomize || (() => store.randomizeScene());
  const onReset = props.onReset || (() => store.resetScene());
  const showStats = props.showStats || false;
  const onToggleStats = props.onToggleStats || (() => {});

  const sceneData = useSceneData();
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
      <div key={obj.id} className="object-tree-item">
        <div
          className={`object-tree-content ${
            selectedObjectId === obj.id ? "selected" : ""
          }`}
          onClick={() => setSelectedObjectId(obj.id)}
        >
          <span className={`object-name ${!obj.visible ? "hidden-item" : ""}`}>
            {obj.name}
          </span>
          <span className="object-type">{obj.geometryType}</span>

          <div className="object-actions">
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

        {obj.children.length > 0 && (
          <div className="tree-indent">
            {renderObjectTree(obj.children, depth + 1)}
          </div>
        )}
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
        <div className="object-tree">{renderObjectTree(sceneData.root)}</div>

        {selectedObjectId && (
          <div className="selected-object-actions">
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

      {props.onToggleStats && (
        <div className="stats-toggle">
          <input
            type="checkbox"
            id="stats"
            checked={showStats}
            onChange={onToggleStats}
          />
          <label htmlFor="stats">Show Stats</label>
        </div>
      )}

      {showSceneData && (
        <div className="control-group">
          <h2>Raw Scene Data</h2>
          <pre>{JSON.stringify(sceneData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

const Controls = observer(ControlsComponent);
export default Controls;
