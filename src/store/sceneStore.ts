import { makeAutoObservable, action, observable, runInAction } from "mobx";
import { v4 as uuidv4 } from "uuid";

// Define the types for our scene data
export type MaterialType = "normal" | "phong" | "standard" | "basic";
export type GeometryType = "box" | "sphere" | "cylinder" | "cone" | "torus";

export interface SceneObject {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  geometryType: GeometryType;
  materialType: MaterialType;
  color: string;
  children: SceneObject[];
  visible: boolean;
}

export interface SceneData {
  root: SceneObject[];
  lastUpdateTimestamp: number;
}

// Helper function to create a random object
const createRandomObject = (depth = 0): SceneObject => {
  const geometryTypes: GeometryType[] = [
    "box",
    "sphere",
    "cylinder",
    "cone",
    "torus",
  ];
  const materialTypes: MaterialType[] = [
    "normal",
    "phong",
    "standard",
    "basic",
  ];
  const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

  return {
    id: uuidv4(),
    name: `Object_${Math.floor(Math.random() * 1000)}`,
    position: [
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    ],
    rotation: [
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
    ],
    scale: [
      0.5 + Math.random() * 0.5,
      0.5 + Math.random() * 0.5,
      0.5 + Math.random() * 0.5,
    ],
    geometryType:
      geometryTypes[Math.floor(Math.random() * geometryTypes.length)],
    materialType:
      materialTypes[Math.floor(Math.random() * materialTypes.length)],
    color: randomColor,
    children:
      depth < 2 && Math.random() > 0.5
        ? Array(Math.floor(Math.random() * 3))
            .fill(null)
            .map(() => createRandomObject(depth + 1))
        : [],
    visible: true,
  };
};

// Create the MobX store
class SceneStore {
  sceneData: SceneData = {
    root: [],
    lastUpdateTimestamp: Date.now(),
  };

  constructor() {
    makeAutoObservable(this, {
      sceneData: observable,
      resetScene: action,
      randomizeScene: action,
      addObject: action,
      removeObject: action,
      updateObject: action,
      reparentObject: action,
      toggleVisibility: action,
    });
  }

  resetScene = () => {
    this.sceneData = {
      root: [
        {
          id: uuidv4(),
          name: "Root Object",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          geometryType: "box",
          materialType: "normal",
          color: "#ff0000",
          children: [],
          visible: true,
        },
      ],
      lastUpdateTimestamp: Date.now(),
    };
  };

  randomizeScene = () => {
    const numRootObjects = 1 + Math.floor(Math.random() * 3);
    const root = Array(numRootObjects)
      .fill(null)
      .map(() => createRandomObject());

    runInAction(() => {
      this.sceneData = {
        root,
        lastUpdateTimestamp: Date.now(),
      };
    });
  };

  addObject = (parentId: string | null, objectData: Partial<SceneObject>) => {
    const newObject: SceneObject = {
      id: uuidv4(),
      name: objectData.name || `Object_${Math.floor(Math.random() * 1000)}`,
      position: objectData.position || [0, 0, 0],
      rotation: objectData.rotation || [0, 0, 0],
      scale: objectData.scale || [1, 1, 1],
      geometryType: objectData.geometryType || "box",
      materialType: objectData.materialType || "normal",
      color: objectData.color || "#ffffff",
      children: objectData.children || [],
      visible: objectData.visible !== undefined ? objectData.visible : true,
    };

    if (parentId === null) {
      // Add to root
      runInAction(() => {
        this.sceneData.root = [...this.sceneData.root, newObject];
        this.sceneData.lastUpdateTimestamp = Date.now();
      });
    } else {
      // Add to parent
      const addObjectToTree = (objects: SceneObject[]): SceneObject[] => {
        return objects.map((obj) => {
          if (obj.id === parentId) {
            return {
              ...obj,
              children: [...obj.children, newObject],
            };
          }

          if (obj.children.length > 0) {
            return {
              ...obj,
              children: addObjectToTree(obj.children),
            };
          }

          return obj;
        });
      };

      runInAction(() => {
        this.sceneData.root = addObjectToTree(this.sceneData.root);
        this.sceneData.lastUpdateTimestamp = Date.now();
      });
    }
  };

  removeObject = (id: string) => {
    const removeObjectFromTree = (objects: SceneObject[]): SceneObject[] => {
      return objects
        .filter((obj) => obj.id !== id)
        .map((obj) => ({
          ...obj,
          children: removeObjectFromTree(obj.children),
        }));
    };

    runInAction(() => {
      this.sceneData.root = removeObjectFromTree(this.sceneData.root);
      this.sceneData.lastUpdateTimestamp = Date.now();
    });
  };

  updateObject = (id: string, updates: Partial<SceneObject>) => {
    const updateObjectInTree = (objects: SceneObject[]): SceneObject[] => {
      return objects.map((obj) => {
        if (obj.id === id) {
          return {
            ...obj,
            ...updates,
            children: obj.children,
          };
        }

        if (obj.children.length > 0) {
          return {
            ...obj,
            children: updateObjectInTree(obj.children),
          };
        }

        return obj;
      });
    };

    runInAction(() => {
      this.sceneData.root = updateObjectInTree(this.sceneData.root);
      this.sceneData.lastUpdateTimestamp = Date.now();
    });
  };

  reparentObject = (objectId: string, newParentId: string | null) => {
    let objectToMove: SceneObject | null = null;

    // Utility to check if an object is a descendant of another
    const isDescendantOf = (
      possibleAncestorId: string,
      objectId: string
    ): boolean => {
      // Find all objects in the hierarchy with their paths
      const findObjectWithPath = (
        objects: SceneObject[],
        targetId: string,
        currentPath: string[] = []
      ): { found: boolean; path: string[] } => {
        for (let i = 0; i < objects.length; i++) {
          const obj = objects[i];
          const newPath = [...currentPath, obj.id];

          if (obj.id === targetId) {
            return { found: true, path: newPath };
          }

          if (obj.children.length > 0) {
            const result = findObjectWithPath(obj.children, targetId, newPath);
            if (result.found) {
              return result;
            }
          }
        }

        return { found: false, path: [] };
      };

      const result = findObjectWithPath(this.sceneData.root, objectId);
      if (!result.found) return false;

      return result.path.includes(possibleAncestorId);
    };

    // Cannot move an object to its own descendant
    if (newParentId !== null && isDescendantOf(objectId, newParentId)) {
      console.warn("Cannot move an object to its own descendant");
      return;
    }

    // First check if object is in root
    const objectInRoot = this.sceneData.root.find((obj) => obj.id === objectId);
    if (objectInRoot) {
      objectToMove = { ...objectInRoot, children: [...objectInRoot.children] };

      // If trying to parent a root object to another object, we need a different approach
      if (newParentId !== null) {
        runInAction(() => {
          // Filter out the object from root
          const newRoot = this.sceneData.root.filter(
            (obj) => obj.id !== objectId
          );

          // Add it to the target parent
          const addObjectToParent = (objects: SceneObject[]): SceneObject[] => {
            return objects.map((obj) => {
              if (obj.id === newParentId) {
                return {
                  ...obj,
                  children: [...obj.children, objectToMove!],
                };
              }

              if (obj.children.length > 0) {
                return {
                  ...obj,
                  children: addObjectToParent(obj.children),
                };
              }

              return obj;
            });
          };

          this.sceneData.root = addObjectToParent(newRoot);
          this.sceneData.lastUpdateTimestamp = Date.now();
        });

        return;
      }
    }

    // Find and remove object from its current parent
    const removeObjectFromTree = (objects: SceneObject[]): SceneObject[] => {
      return objects.map((obj) => {
        const childIndex = obj.children.findIndex(
          (child) => child.id === objectId
        );

        if (childIndex !== -1) {
          // Found the object in this parent's children
          objectToMove = {
            ...obj.children[childIndex],
            children: [...obj.children[childIndex].children],
          };

          // Create a new array without the object to move
          const newChildren = [...obj.children];
          newChildren.splice(childIndex, 1);

          return {
            ...obj,
            children: newChildren,
          };
        }

        // Continue searching in children
        if (obj.children.length > 0) {
          return {
            ...obj,
            children: removeObjectFromTree(obj.children),
          };
        }

        return obj;
      });
    };

    // Add object to new parent
    const addObjectToTree = (objects: SceneObject[]): SceneObject[] => {
      return objects.map((obj) => {
        if (obj.id === newParentId) {
          return {
            ...obj,
            children: [...obj.children, objectToMove!],
          };
        }

        if (obj.children.length > 0) {
          return {
            ...obj,
            children: addObjectToTree(obj.children),
          };
        }

        return obj;
      });
    };

    runInAction(() => {
      // Skip if we already handled a root object
      if (objectInRoot && newParentId === null) {
        // No action needed, already in root
        return;
      }

      // First pass: remove the object from its current location
      let newRoot = objectInRoot
        ? this.sceneData.root.filter((obj) => obj.id !== objectId)
        : removeObjectFromTree(this.sceneData.root);

      // Check if the object was found
      if (objectToMove) {
        // Second pass: add to new parent or to root
        if (newParentId === null) {
          newRoot = [...newRoot, objectToMove];
        } else {
          newRoot = addObjectToTree(newRoot);
        }
      }

      this.sceneData.root = newRoot;
      this.sceneData.lastUpdateTimestamp = Date.now();
    });
  };

  toggleVisibility = (id: string) => {
    const toggleVisibilityInTree = (objects: SceneObject[]): SceneObject[] => {
      return objects.map((obj) => {
        if (obj.id === id) {
          return {
            ...obj,
            visible: !obj.visible,
          };
        }

        if (obj.children.length > 0) {
          return {
            ...obj,
            children: toggleVisibilityInTree(obj.children),
          };
        }

        return obj;
      });
    };

    runInAction(() => {
      this.sceneData.root = toggleVisibilityInTree(this.sceneData.root);
      this.sceneData.lastUpdateTimestamp = Date.now();
    });
  };
}

// Create a singleton instance
export const sceneStore = new SceneStore();

// For compatibility with existing code, create a hook-like function
export const useSceneStore = () => sceneStore;
export const useSceneData = () => sceneStore.sceneData;
