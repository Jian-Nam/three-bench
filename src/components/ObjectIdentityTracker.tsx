import React, { useState, useEffect } from "react";
import {
  getTrackedObjectIds,
  hasGeometryChanged,
  hasMaterialChanged,
  getObjectUUIDInfo,
  getGeometryUUIDInfo,
  getMaterialUUIDInfo,
  isInitialized,
  hasAttributesChanged,
} from "../utils/objectTracker";
import { useSceneData } from "../store/sceneStore";
import { observer } from "mobx-react-lite";
import type { SceneObject } from "../store/sceneStore";

const UUIDDisplay: React.FC<{
  label: string;
  current: string;
  previous: string | null;
  changed: boolean;
}> = ({ label, current, previous, changed }) => {
  // Truncate UUIDs for readability
  const truncate = (str: string, length = 10) => {
    if (!str) return "";
    return str.length > length ? `${str.substring(0, length)}...` : str;
  };

  return (
    <div className={`uuid-info ${changed ? "uuid-changed" : ""}`}>
      <span className="uuid-label">{label}:</span>
      <span className="uuid-current">{truncate(current)}</span>
      {previous && changed && (
        <span className="uuid-previous">
          was: <span className="uuid-value">{truncate(previous)}</span>
        </span>
      )}
    </div>
  );
};

// Simple status display component for when we only care about changed or not
const InstanceStatus: React.FC<{
  label: string;
  changed: boolean;
}> = ({ label, changed }) => {
  return (
    <div className={`identity-status ${changed ? "identity-changed" : ""}`}>
      <span>{label}:</span>
      <span>{changed ? "Recreated" : "Same Instance"}</span>
    </div>
  );
};

/**
 * Component that displays information about Three.js object identity
 * Shows which objects have maintained their identity after hierarchy changes
 */
const ObjectIdentityTracker = observer(() => {
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

          const objectData = findObjectInScene(sceneData.root, id);
          const geometryChanged = hasGeometryChanged(id);
          const materialChanged = hasMaterialChanged(id);
          const attributesChanged = hasAttributesChanged(id);

          if (!objectData) {
            return null; // Object was removed
          }

          // Get UUID info
          const objectUUIDInfo = getObjectUUIDInfo(id);
          const geometryUUIDInfo = getGeometryUUIDInfo(
            id,
            objectData.geometryType
          );
          const materialUUIDInfo = getMaterialUUIDInfo(
            id,
            objectData.materialType
          );

          return (
            <div
              key={id}
              className={`identity-item ${
                objectUUIDInfo.changed ? "identity-changed" : ""
              }`}
            >
              <div className="identity-header">
                <span className="identity-name">{objectData.name}</span>
                <span className="identity-id">({id.substring(0, 8)}...)</span>
              </div>

              <div className="identity-details">
                <div
                  className={`identity-group ${
                    objectUUIDInfo.changed ? "identity-changed" : ""
                  }`}
                >
                  <div className="identity-group-header">Object</div>
                  <UUIDDisplay
                    label="UUID"
                    current={objectUUIDInfo.current}
                    previous={objectUUIDInfo.previous}
                    changed={objectUUIDInfo.changed}
                  />
                </div>

                <div
                  className={`identity-group ${
                    geometryChanged ? "identity-changed" : ""
                  }`}
                >
                  <div className="identity-group-header">
                    Geometry{" "}
                    <span className="identity-type">
                      ({objectData.geometryType})
                    </span>
                  </div>
                  <UUIDDisplay
                    label="UUID"
                    current={geometryUUIDInfo.current}
                    previous={geometryUUIDInfo.previous}
                    changed={geometryChanged}
                  />

                  {/* Geometry.attributes Tracking */}
                  <div className="identity-attributes">
                    <div className="identity-attributes-header">
                      attributes object:
                    </div>
                    <InstanceStatus
                      label="geometry.attributes"
                      changed={attributesChanged}
                    />
                  </div>
                </div>

                <div
                  className={`identity-group ${
                    materialChanged ? "identity-changed" : ""
                  }`}
                >
                  <div className="identity-group-header">
                    Material{" "}
                    <span className="identity-type">
                      ({objectData.materialType})
                    </span>
                  </div>
                  <UUIDDisplay
                    label="UUID"
                    current={materialUUIDInfo.current}
                    previous={materialUUIDInfo.previous}
                    changed={materialChanged}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ObjectIdentityTracker;
