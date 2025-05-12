import * as THREE from "three";

// Performance metrics for Three.js objects
interface ObjectPerformanceMetrics {
  id: string;
  name: string;
  objectType: string;
  geometryType: string;
  materialType: string;
  creationTime: number;
  geometryInitTime: number;
  materialInitTime: number;
  gpuUploadTime: number | null;
  totalSetupTime: number;
  totalVertices: number;
  attributeCount: number;
  timestamp: number;
}

// Storage for all collected metrics
const performanceMetrics: ObjectPerformanceMetrics[] = [];
const recentMetrics: Map<string, ObjectPerformanceMetrics> = new Map();

// WebGL Timer Query extension support detector
let glTimerQuerySupported = false;
let glTimerQuery: unknown = null;

/**
 * Initialize WebGL Timer Query extension if available
 * @param gl The WebGL context
 */
export const initGLTimerQuery = (gl: WebGLRenderingContext) => {
  const ext = gl.getExtension("EXT_disjoint_timer_query");
  if (ext) {
    glTimerQuerySupported = true;
    glTimerQuery = ext;
    console.log("WebGL Timer Query extension is supported");
  } else {
    console.log("WebGL Timer Query extension is not supported");
  }
};

/**
 * Measure performance of Three.js object creation
 *
 * @param id Object unique ID
 * @param name Object name
 * @param object Three.js object
 * @param geometryType Type of geometry
 * @param materialType Type of material
 */
export const measureObjectCreation = (
  id: string,
  name: string,
  object: THREE.Object3D,
  geometryType: string,
  materialType: string
): void => {
  if (object instanceof THREE.Mesh) {
    // Start timing
    const startTime = performance.now();

    // Create geometry measurement
    const geometryStartTime = performance.now();
    const geometry = object.geometry;
    const geometryEndTime = performance.now();
    const geometryInitTime = geometryEndTime - geometryStartTime;

    // Create material measurement
    const materialStartTime = performance.now();
    // Access material to measure time (we store the reference but don't use it directly)
    const material = object.material as THREE.Material;
    const materialEndTime = performance.now();
    const materialInitTime = materialEndTime - materialStartTime;

    // Calculate total time
    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Count vertices and attributes
    let vertexCount = 0;
    let attributeCount = 0;

    if (geometry instanceof THREE.BufferGeometry) {
      vertexCount = geometry.attributes.position?.count || 0;
      attributeCount = Object.keys(geometry.attributes).length;
    }

    // Create metrics object
    const metrics: ObjectPerformanceMetrics = {
      id,
      name,
      objectType: object.type,
      geometryType,
      materialType,
      creationTime: totalTime,
      geometryInitTime,
      materialInitTime,
      gpuUploadTime: null, // Will be populated later if WebGL Timer Query is supported
      totalSetupTime: totalTime,
      totalVertices: vertexCount,
      attributeCount,
      timestamp: Date.now(),
    };

    // Store metrics
    performanceMetrics.push(metrics);
    recentMetrics.set(id, metrics);

    // Log performance info
    console.log(`Performance metrics for ${name} (${id}):`, metrics);
  }
};

// Type for the WebGL Timer Query extension
interface TimerQueryExt {
  createQueryEXT: () => any;
  beginQueryEXT: (target: number, query: any) => void;
  endQueryEXT: (target: number) => void;
  getQueryObjectEXT: (query: any, pname: number) => any;
  TIME_ELAPSED_EXT: number;
  QUERY_RESULT_AVAILABLE_EXT: number;
  QUERY_RESULT_EXT: number;
}

/**
 * Optional: Try to measure GPU upload time using WebGL Timer Query if available
 * This should be called during rendering when the object is uploaded to GPU
 *
 * @param id Object ID
 * @param renderer Three.js renderer
 * @param geometry Geometry that was uploaded
 */
export const measureGPUUploadTime = (
  id: string,
  renderer: THREE.WebGLRenderer,
  geometry: THREE.BufferGeometry
): void => {
  if (!glTimerQuerySupported || !glTimerQuery) {
    return;
  }

  // Cast to our interface type
  const glQuery = glTimerQuery as TimerQueryExt;

  // Create timer query
  const query = glQuery.createQueryEXT();
  glQuery.beginQueryEXT(glQuery.TIME_ELAPSED_EXT, query);

  // Force buffer update
  renderer.renderBufferDirect(
    new THREE.Camera(),
    new THREE.Scene(),
    geometry,
    new THREE.MeshBasicMaterial(),
    new THREE.Mesh(),
    null
  );

  glQuery.endQueryEXT(glQuery.TIME_ELAPSED_EXT);

  // Poll for query result (this should be done in an animation frame)
  const checkQueryResult = () => {
    const available = glQuery.getQueryObjectEXT(
      query,
      glQuery.QUERY_RESULT_AVAILABLE_EXT
    );

    if (available) {
      const timeElapsed = glQuery.getQueryObjectEXT(
        query,
        glQuery.QUERY_RESULT_EXT
      );

      // Convert to milliseconds and update the metrics
      const timeMs = timeElapsed / 1000000;

      const metrics = recentMetrics.get(id);
      if (metrics) {
        metrics.gpuUploadTime = timeMs;
        metrics.totalSetupTime += timeMs;

        console.log(
          `GPU upload time for ${metrics.name} (${id}): ${timeMs.toFixed(2)}ms`
        );
      }
    } else {
      // Try again next frame if not ready
      requestAnimationFrame(checkQueryResult);
    }
  };

  requestAnimationFrame(checkQueryResult);
};

/**
 * Get all performance metrics
 */
export const getAllPerformanceMetrics = (): ObjectPerformanceMetrics[] => {
  return [...performanceMetrics];
};

/**
 * Get specific object performance metrics
 */
export const getObjectPerformanceMetrics = (
  id: string
): ObjectPerformanceMetrics | undefined => {
  return recentMetrics.get(id);
};

/**
 * Clear all performance metrics
 */
export const clearPerformanceMetrics = (): void => {
  performanceMetrics.length = 0;
  recentMetrics.clear();
};

/**
 * Get aggregated performance metrics
 */
export const getAggregatedMetrics = () => {
  if (performanceMetrics.length === 0) {
    return null;
  }

  const totalObjects = performanceMetrics.length;
  const totalVertices = performanceMetrics.reduce(
    (sum, m) => sum + m.totalVertices,
    0
  );
  const avgCreationTime =
    performanceMetrics.reduce((sum, m) => sum + m.creationTime, 0) /
    totalObjects;
  const avgGeometryTime =
    performanceMetrics.reduce((sum, m) => sum + m.geometryInitTime, 0) /
    totalObjects;
  const avgMaterialTime =
    performanceMetrics.reduce((sum, m) => sum + m.materialInitTime, 0) /
    totalObjects;

  // Only average GPU times for objects that have them
  const gpuTimedObjects = performanceMetrics.filter(
    (m) => m.gpuUploadTime !== null
  );
  const avgGpuTime = gpuTimedObjects.length
    ? gpuTimedObjects.reduce((sum, m) => sum + (m.gpuUploadTime || 0), 0) /
      gpuTimedObjects.length
    : null;

  return {
    totalObjects,
    totalVertices,
    avgCreationTime,
    avgGeometryTime,
    avgMaterialTime,
    avgGpuTime,
    maxCreationTime: Math.max(...performanceMetrics.map((m) => m.creationTime)),
    maxGeometryTime: Math.max(
      ...performanceMetrics.map((m) => m.geometryInitTime)
    ),
    maxMaterialTime: Math.max(
      ...performanceMetrics.map((m) => m.materialInitTime)
    ),
    maxGpuTime: gpuTimedObjects.length
      ? Math.max(...gpuTimedObjects.map((m) => m.gpuUploadTime || 0))
      : null,
  };
};
