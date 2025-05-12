import React from "react";
import UUIDDisplay from "./UUIDDisplay";
import InstanceStatus from "./InstanceStatus";
import type { SceneObject } from "../../store/sceneStore";
import {
  getObjectUUIDInfo,
  getGeometryUUIDInfo,
  getMaterialUUIDInfo,
  hasGeometryChanged,
  hasMaterialChanged,
  hasAttributesChanged,
} from "../../utils/tracking/objectTracker.ts";

interface ObjectIdentityItemProps {
  id: string;
  objectData: SceneObject;
}

/**
 * Component to display identity tracking information for a single object
 */
const ObjectIdentityItem: React.FC<ObjectIdentityItemProps> = ({
  id,
  objectData,
}) => {
  const geometryChanged = hasGeometryChanged(id);
  const materialChanged = hasMaterialChanged(id);
  const attributesChanged = hasAttributesChanged(id);

  // Get UUID info
  const objectUUIDInfo = getObjectUUIDInfo(id);
  const geometryUUIDInfo = getGeometryUUIDInfo(id, objectData.geometryType);
  const materialUUIDInfo = getMaterialUUIDInfo(id, objectData.materialType);

  return (
    <div
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
            <span className="identity-type">({objectData.geometryType})</span>
          </div>
          <UUIDDisplay
            label="UUID"
            current={geometryUUIDInfo.current}
            previous={geometryUUIDInfo.previous}
            changed={geometryChanged}
          />

          {/* Geometry.attributes Tracking */}
          <div className="identity-attributes">
            <div className="identity-attributes-header">attributes object:</div>
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
            <span className="identity-type">({objectData.materialType})</span>
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
};

export default ObjectIdentityItem;
