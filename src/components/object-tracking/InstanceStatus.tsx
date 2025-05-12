import React from "react";

interface InstanceStatusProps {
  label: string;
  changed: boolean;
}

/**
 * Component to display the status of an instance (recreated or not)
 */
const InstanceStatus: React.FC<InstanceStatusProps> = ({ label, changed }) => {
  return (
    <div className={`identity-status ${changed ? "identity-changed" : ""}`}>
      <span>{label}:</span>
      <span>{changed ? "Recreated" : "Same Instance"}</span>
    </div>
  );
};

export default InstanceStatus;
