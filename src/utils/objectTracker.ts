import * as THREE from "three";

// Map to store references to Three.js objects by ID
const objectInstances = new Map<string, THREE.Object3D>();
const previousObjectInstances = new Map<string, THREE.Object3D>();

// Maps to track geometry and material instances
const geometryInstances = new Map<string, THREE.BufferGeometry>();
const materialInstances = new Map<string, THREE.Material>();
const previousGeometryInstances = new Map<string, THREE.BufferGeometry>();
const previousMaterialInstances = new Map<string, THREE.Material>();

// Maps to track buffer attribute instances (the attributes object itself, not individual attributes)
const attributesInstances = new Map<
  string,
  Record<string, THREE.BufferAttribute | THREE.InterleavedBufferAttribute>
>();
const previousAttributesInstances = new Map<
  string,
  Record<string, THREE.BufferAttribute | THREE.InterleavedBufferAttribute>
>();

// Object tracking by UUID
const objectUUIDs = new Map<string, string>();
const previousObjectUUIDs = new Map<string, string>();
const geometryUUIDs = new Map<string, string>();
const previousGeometryUUIDs = new Map<string, string>();
const materialUUIDs = new Map<string, string>();
const previousMaterialUUIDs = new Map<string, string>();

// Changed flags
const geometryChangedIds = new Set<string>();
const materialChangedIds = new Set<string>();
const objectChangedIds = new Set<string>();
const attributesChangedIds = new Set<string>();

// Track initialization state
let initialized = false;

/**
 * Register a Three.js object instance with a specific ID
 */
export const registerObject = (id: string, instance: THREE.Object3D) => {
  const currentUUID = instance.uuid;
  const prevUUID = objectUUIDs.get(id);
  const prevInstance = objectInstances.get(id);

  if (prevInstance && prevInstance !== instance) {
    // Object reference changed - store previous data
    objectChangedIds.add(id);
    previousObjectInstances.set(id, prevInstance);
  }

  if (prevUUID && prevUUID !== currentUUID) {
    // UUID changed - store previous UUID
    objectChangedIds.add(id);
    previousObjectUUIDs.set(id, prevUUID);
  }

  // Always update the current values
  objectInstances.set(id, instance);
  objectUUIDs.set(id, currentUUID);

  // Mark as initialized after first object registration
  if (!initialized) {
    initialized = true;
  }
};

/**
 * Check if the current instance matches the previously registered instance
 * Returns false if the object was never registered
 */
export const isObjectInstanceSame = (
  id: string,
  currentInstance: THREE.Object3D
): boolean => {
  const previousInstance = objectInstances.get(id);
  if (!previousInstance) {
    return false;
  }
  return previousInstance === currentInstance;
};

/**
 * Get object UUID info
 */
export const getObjectUUIDInfo = (
  id: string
): { current: string; previous: string | null; changed: boolean } => {
  return {
    current: objectUUIDs.get(id) || "",
    previous: previousObjectUUIDs.get(id) || null,
    changed: objectChangedIds.has(id),
  };
};

/**
 * Register a geometry instance
 */
export const registerGeometry = (
  id: string,
  type: string,
  instance: THREE.BufferGeometry
) => {
  const key = `${id}-${type}`;
  const currentUUID = instance.uuid;
  const prevUUID = geometryUUIDs.get(key);
  const prevInstance = geometryInstances.get(key);

  if (prevInstance && prevInstance !== instance) {
    // Instance reference changed
    geometryChangedIds.add(id);
    previousGeometryInstances.set(key, prevInstance);
  }

  if (prevUUID && prevUUID !== currentUUID) {
    // UUID changed
    geometryChangedIds.add(id);
    previousGeometryUUIDs.set(key, prevUUID);
  }

  // Always update current values
  geometryInstances.set(key, instance);
  geometryUUIDs.set(key, currentUUID);

  // Track the entire attributes object (not individual attributes)
  if (instance.attributes) {
    registerAttributesObject(id, type, instance.attributes);
  }
};

/**
 * Register the attributes object from a geometry
 */
export const registerAttributesObject = (
  id: string,
  geometryType: string,
  attributes: Record<
    string,
    THREE.BufferAttribute | THREE.InterleavedBufferAttribute
  >
) => {
  const key = `${id}-${geometryType}`;
  const prevAttributes = attributesInstances.get(key);

  if (prevAttributes && prevAttributes !== attributes) {
    // The attributes object itself has changed reference
    attributesChangedIds.add(id);
    previousAttributesInstances.set(key, prevAttributes);
  }

  attributesInstances.set(key, attributes);
};

/**
 * Register a material instance
 */
export const registerMaterial = (
  id: string,
  type: string,
  instance: THREE.Material
) => {
  const key = `${id}-${type}`;
  const currentUUID = instance.uuid;
  const prevUUID = materialUUIDs.get(key);
  const prevInstance = materialInstances.get(key);

  if (prevInstance && prevInstance !== instance) {
    // Instance reference changed
    materialChangedIds.add(id);
    previousMaterialInstances.set(key, prevInstance);
  }

  if (prevUUID && prevUUID !== currentUUID) {
    // UUID changed
    materialChangedIds.add(id);
    previousMaterialUUIDs.set(key, prevUUID);
  }

  // Always update current values
  materialInstances.set(key, instance);
  materialUUIDs.set(key, currentUUID);
};

/**
 * Get geometry UUID info
 */
export const getGeometryUUIDInfo = (
  id: string,
  type: string
): { current: string; previous: string | null; changed: boolean } => {
  const key = `${id}-${type}`;
  return {
    current: geometryUUIDs.get(key) || "",
    previous: previousGeometryUUIDs.get(key) || null,
    changed: geometryChangedIds.has(id),
  };
};

/**
 * Get material UUID info
 */
export const getMaterialUUIDInfo = (
  id: string,
  type: string
): { current: string; previous: string | null; changed: boolean } => {
  const key = `${id}-${type}`;
  return {
    current: materialUUIDs.get(key) || "",
    previous: previousMaterialUUIDs.get(key) || null,
    changed: materialChangedIds.has(id),
  };
};

/**
 * Check if geometry for this object has been recreated
 */
export const hasGeometryChanged = (id: string): boolean => {
  // If not yet initialized, return false to not show change
  if (!initialized) return false;
  return geometryChangedIds.has(id);
};

/**
 * Check if material for this object has been recreated
 */
export const hasMaterialChanged = (id: string): boolean => {
  // If not yet initialized, return false to not show change
  if (!initialized) return false;
  return materialChangedIds.has(id);
};

/**
 * Check if the attributes object for this geometry has been recreated
 */
export const hasAttributesChanged = (id: string): boolean => {
  // If not yet initialized, return false to not show change
  if (!initialized) return false;
  return attributesChangedIds.has(id);
};

/**
 * Get all tracked object IDs
 */
export const getTrackedObjectIds = (): string[] => {
  return Array.from(objectInstances.keys());
};

/**
 * Clear change tracking but keep current instances
 */
export const clearTrackedObjects = () => {
  // Keep current object instances
  const currentObjects = new Map(objectInstances);
  const currentGeometries = new Map(geometryInstances);
  const currentMaterials = new Map(materialInstances);
  const currentAttributes = new Map(attributesInstances);

  const currentObjectUUIDs = new Map(objectUUIDs);
  const currentGeometryUUIDs = new Map(geometryUUIDs);
  const currentMaterialUUIDs = new Map(materialUUIDs);

  // Clear all Maps
  objectInstances.clear();
  previousObjectInstances.clear();
  geometryInstances.clear();
  previousGeometryInstances.clear();
  materialInstances.clear();
  previousMaterialInstances.clear();
  attributesInstances.clear();
  previousAttributesInstances.clear();

  objectUUIDs.clear();
  previousObjectUUIDs.clear();
  geometryUUIDs.clear();
  previousGeometryUUIDs.clear();
  materialUUIDs.clear();
  previousMaterialUUIDs.clear();

  // Clear all Sets
  objectChangedIds.clear();
  geometryChangedIds.clear();
  materialChangedIds.clear();
  attributesChangedIds.clear();

  // Restore current instances only
  currentObjects.forEach((obj, id) => {
    objectInstances.set(id, obj);
  });

  currentGeometries.forEach((geo, key) => {
    geometryInstances.set(key, geo);
  });

  currentMaterials.forEach((mat, key) => {
    materialInstances.set(key, mat);
  });

  currentAttributes.forEach((attrs, key) => {
    attributesInstances.set(key, attrs);
  });

  // Restore current UUIDs
  currentObjectUUIDs.forEach((uuid, id) => {
    objectUUIDs.set(id, uuid);
  });

  currentGeometryUUIDs.forEach((uuid, key) => {
    geometryUUIDs.set(key, uuid);
  });

  currentMaterialUUIDs.forEach((uuid, key) => {
    materialUUIDs.set(key, uuid);
  });

  // Reset initialization state to true since we kept the objects
  initialized = true;
};

/**
 * Get object instance for a specific ID
 */
export const getObjectInstance = (id: string): THREE.Object3D | undefined => {
  return objectInstances.get(id);
};

/**
 * Get initialization state
 */
export const isInitialized = (): boolean => {
  return initialized;
};
