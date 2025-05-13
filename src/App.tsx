import { useEffect } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./styles/main.scss";
import SceneContent from "./components/scene/SceneContent.tsx";
import BenchmarkPage from "./components/TestPages/BenchmarkPage.tsx";
import { useSceneStore } from "./store/sceneStore.ts";
import Controls from "./components/controls/Controls.tsx";
import { ObjectIdentityTracker } from "./components/object-tracking";
import { observer } from "mobx-react-lite";
import { clearTrackedObjects } from "./utils/tracking/objectTracker";

const AppComponent = () => {
  const store = useSceneStore();
  const location = useLocation();

  useEffect(() => {
    store.resetScene();
  }, [store]);

  const resetTracker = () => {
    clearTrackedObjects();
    // Dispatch event to notify tracker
    window.dispatchEvent(new Event("tracker-reset"));
  };

  // Navigation component for the tabs
  const Navigation = () => (
    <div className="tabs">
      <Link to="/" className={location.pathname === "/" ? "active" : ""}>
        Hierarchy Example
      </Link>
      <Link
        to="/benchmark"
        className={location.pathname.startsWith("/benchmark") ? "active" : ""}
      >
        Performance Tests
      </Link>
    </div>
  );

  return (
    <div className="app-container">
      <Navigation />

      <Routes>
        <Route
          path="/benchmark"
          element={<Navigate to="/benchmark/geometry" replace />}
        />
        <Route path="/benchmark/geometry" element={<BenchmarkPage />} />
        <Route path="/benchmark/material" element={<BenchmarkPage />} />
        <Route
          path="/"
          element={
            <>
              <div className="controls-panel">
                <Controls />
              </div>
              <div className="canvas-container">
                <Canvas shadows>
                  <OrbitControls makeDefault />
                  <color attach="background" args={["#fff"]} />
                  <SceneContent />
                </Canvas>
              </div>
              <div className="tracker-panel">
                <div className="tracker-actions">
                  <button className="control-button" onClick={resetTracker}>
                    Reset Object Tracking
                  </button>
                </div>
                <ObjectIdentityTracker />
              </div>
            </>
          }
        />
      </Routes>
    </div>
  );
};

const App = observer(AppComponent);
export default App;
