import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import "./styles/main.scss";
import SceneContent from "./components/scene/SceneContent.tsx";
import TestPage from "./components/TestPage.tsx";
import BenchmarkPage from "./components/TestPages/BenchmarkPage.tsx";
import { useSceneStore } from "./store/sceneStore.ts";
import Controls from "./components/controls/Controls.tsx";
import {
  ObjectIdentityTracker,
  PerformanceMonitor,
} from "./components/object-tracking";
import { observer } from "mobx-react-lite";
import { clearTrackedObjects } from "./utils/tracking/objectTracker";
import { clearPerformanceMetrics } from "./utils/tracking/performanceTracker";

const AppComponent = () => {
  const store = useSceneStore();
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "hierarchy" | "test" | "benchmark"
  >("hierarchy");

  useEffect(() => {
    store.resetScene();
  }, [store]);

  const resetTracker = () => {
    clearTrackedObjects();
    clearPerformanceMetrics();
    // Dispatch event to notify tracker
    window.dispatchEvent(new Event("tracker-reset"));
  };

  if (activeTab === "test") {
    return (
      <div className="app-container">
        <div className="tabs">
          <button
            className={activeTab === "hierarchy" ? "active" : ""}
            onClick={() => setActiveTab("hierarchy")}
          >
            Hierarchy Example
          </button>
          <button
            className={activeTab === "test" ? "active" : ""}
            onClick={() => setActiveTab("test")}
          >
            Test Page
          </button>
          <button
            className={activeTab === "benchmark" ? "active" : ""}
            onClick={() => setActiveTab("benchmark")}
          >
            Performance Tests
          </button>
        </div>
        <TestPage showStats={showStats} />
      </div>
    );
  }

  if (activeTab === "benchmark") {
    return (
      <div className="app-container">
        <div className="tabs">
          <button
            className={activeTab === "hierarchy" ? "active" : ""}
            onClick={() => setActiveTab("hierarchy")}
          >
            Hierarchy Example
          </button>
          <button
            className={activeTab === "test" ? "active" : ""}
            onClick={() => setActiveTab("test")}
          >
            Test Page
          </button>
          <button
            className={activeTab === "benchmark" ? "active" : ""}
            onClick={() => setActiveTab("benchmark")}
          >
            Performance Tests
          </button>
        </div>
        <BenchmarkPage />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="tabs">
        <button
          className={activeTab === "hierarchy" ? "active" : ""}
          onClick={() => setActiveTab("hierarchy")}
        >
          Hierarchy Example
        </button>
        <button
          className={activeTab === "test" ? "active" : ""}
          onClick={() => setActiveTab("test")}
        >
          Test Page
        </button>
        <button
          className={activeTab === "benchmark" ? "active" : ""}
          onClick={() => setActiveTab("benchmark")}
        >
          Performance Tests
        </button>
      </div>
      <div className="controls-panel">
        <h3>Scene Controls</h3>
        <Controls />
        <div className="stats-toggle">
          <input
            type="checkbox"
            id="stats-toggle"
            checked={showStats}
            onChange={() => setShowStats(!showStats)}
          />
          <label htmlFor="stats-toggle">Show Stats</label>
        </div>
      </div>
      <div className="canvas-container">
        <Canvas shadows>
          {showStats && <Stats />}
          <OrbitControls makeDefault />
          <color attach="background" args={["#111"]} />
          <SceneContent />
        </Canvas>
      </div>
      <div className="tracker-panel">
        <div className="tracker-actions">
          <button onClick={resetTracker}>Reset Object Tracking</button>
        </div>
        <ObjectIdentityTracker />
        <PerformanceMonitor />
      </div>
    </div>
  );
};

const App = observer(AppComponent);
export default App;
