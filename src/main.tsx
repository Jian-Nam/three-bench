import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";

// Set up performance monitoring
const originalCreateElement = React.createElement;
const profilerMap = new Map<string, { renders: number; recreations: number }>();

// Patch React.createElement to monitor component creation and re-creation
(React as any).createElement = function (type: any, ...rest: any[]) {
  // Only track object with display names (components)
  const result = originalCreateElement.apply(this, [type, ...rest]);

  if (typeof type === "function" && type.name) {
    const name = type.name;
    const profile = profilerMap.get(name) || { renders: 0, recreations: 0 };

    // Count render
    profile.renders++;

    // Check if this component created a new instance
    if (result.type !== type) {
      profile.recreations++;
    }

    profilerMap.set(name, profile);

    // Add ability to inspect performance stats in console
    if (!(window as any).__r3fPerformanceStats) {
      (window as any).__r3fPerformanceStats = {
        getStats: () => {
          return Array.from(profilerMap.entries()).map(([name, stats]) => ({
            name,
            ...stats,
          }));
        },
      };
      console.log(
        "Performance monitoring enabled. Use window.__r3fPerformanceStats.getStats() to view results"
      );
    }
  }

  return result;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
