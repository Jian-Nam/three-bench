import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import "./App.css";
import SceneContent from "./components/SceneContent.tsx";
import TestPage from "./components/TestPage.tsx";
import { useSceneStore } from "./store/sceneStore.ts";
import Controls from "./components/Controls.tsx";
import ObjectIdentityTracker from "./components/ObjectIdentityTracker.tsx";
import { observer } from "mobx-react-lite";
import { clearTrackedObjects } from "./utils/objectTracker.ts";

const AppComponent = () => {
  const store = useSceneStore();
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState<"hierarchy" | "test">("hierarchy");

  useEffect(() => {
    // Initialize the scene
    store.resetScene();
  }, [store]);

  return (
    <div className="app-container">
      <div className="tabs">
        <button
          className={activeTab === "hierarchy" ? "active" : ""}
          onClick={() => setActiveTab("hierarchy")}
        >
          Hierarchy Test
        </button>
        <button
          className={activeTab === "test" ? "active" : ""}
          onClick={() => setActiveTab("test")}
        >
          Performance Test
        </button>
      </div>

      {activeTab === "hierarchy" ? (
        // Hierarchy Test Page
        <>
          <div className="controls-panel">
            <h1>R3F Hierarchy Test</h1>
            <Controls
              onRandomize={() => store.randomizeScene()}
              onReset={() => store.resetScene()}
              showStats={showStats}
              onToggleStats={() => setShowStats(!showStats)}
            />
          </div>
          <div className="canvas-container">
            <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
              <SceneContent />
              <OrbitControls />
              {showStats && <Stats />}
            </Canvas>
          </div>

          <div className="tracker-panel">
            <h1>Object Tracking</h1>
            <div className="tracker-actions">
              <button
                className="control-button"
                onClick={() => clearTrackedObjects()}
              >
                Reset Object Tracking
              </button>
            </div>
            <ObjectIdentityTracker />
          </div>
        </>
      ) : (
        // Performance Test Page
        <TestPage showStats={showStats} />
      )}
    </div>
  );
};

// Use observer in a separate step
const App = observer(AppComponent);

export default App;
