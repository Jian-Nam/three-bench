import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useSceneData } from "../../store/sceneStore";
import ObjectIdentityItem from "./ObjectIdentityItem";
import {
  getTrackedObjectIds,
  isInitialized,
} from "../../utils/tracking/objectTracker";
import type { SceneObject } from "../../store/sceneStore";

/**
 * Component that displays information about Three.js object identity
 * Shows which objects have maintained their identity after hierarchy changes
 */
const ObjectIdentityTracker: React.FC = observer(() => {
  const [trackedObjects, setTrackedObjects] = useState<string[]>([]);
  const [resetKey, setResetKey] = useState(0); // Add a key to force re-render
  const [initialized, setInitialized] = useState(isInitialized());
  const sceneData = useSceneData();

  // Listen for reset event from parent
  useEffect(() => {
    const handleReset = () => {
      setResetKey((prev) => prev + 1);
    };

    // Create a custom event listener
    window.addEventListener("tracker-reset", handleReset);
    return () => {
      window.removeEventListener("tracker-reset", handleReset);
    };
  }, []);

  // Update tracked objects whenever scene changes or reset
  useEffect(() => {
    // Wait a bit for the new objects to be registered
    const timeoutId = setTimeout(() => {
      const objectIds = getTrackedObjectIds();
      setTrackedObjects(objectIds);
      setInitialized(isInitialized());
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [sceneData.lastUpdateTimestamp, resetKey]);

  if (trackedObjects.length === 0) {
    return null;
  }

  // Find the object data from the scene
  const findObjectInScene = (
    objects: SceneObject[],
    objId: string
  ): SceneObject | null => {
    for (const obj of objects) {
      if (obj.id === objId) {
        return obj;
      }
      if (obj.children.length > 0) {
        const found: SceneObject | null = findObjectInScene(
          obj.children,
          objId
        );
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <div className="identity-tracker">
      <h3>Object Identity Tracking</h3>
      <div className="identity-info">
        <p>
          This panel shows if Three.js objects maintain the same instance when
          moved in the scene hierarchy.
        </p>
        <p>
          <span className="identity-changed">Red</span> items indicate instances
          that have been recreated.
        </p>
        {!initialized && (
          <p className="identity-notice">
            Tracking initialized. Move objects to see changes.
          </p>
        )}
      </div>
      <div className="identity-list">
        {trackedObjects.map((id) => {
          const objectData = findObjectInScene(sceneData.root, id);

          if (!objectData) {
            return null; // Object was removed
          }

          return (
            <ObjectIdentityItem key={id} id={id} objectData={objectData} />
          );
        })}
      </div>
    </div>
  );
});

export default ObjectIdentityTracker;
