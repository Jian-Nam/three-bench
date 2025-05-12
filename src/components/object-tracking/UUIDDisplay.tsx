import React from "react";

interface UUIDDisplayProps {
  label: string;
  current: string;
  previous: string | null;
  changed: boolean;
}

/**
 * Component to display UUID information with previous/current values
 */
const UUIDDisplay: React.FC<UUIDDisplayProps> = ({
  label,
  current,
  previous,
  changed,
}) => {
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

export default UUIDDisplay;
