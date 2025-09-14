// src/hooks/useCameraPermission.ts
import { useEffect, useState } from "react";

export function useCameraPermission() {
  const [permission, setPermission] = useState(localStorage.getItem("cameraPermission"));

  useEffect(() => {
    if (!permission) {
      // Only ask once
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          setPermission("granted");
          localStorage.setItem("cameraPermission", "granted");
        })
        .catch(() => {
          setPermission("denied");
          localStorage.setItem("cameraPermission", "denied");
        });
    }
  }, [permission]);

  return permission;
}

// src/SomeComponent.tsx
import React from "react";
import { useCameraPermission } from "./hooks/useCameraPermission";

const SomeComponent = () => {
  const cameraPermission = useCameraPermission();

  return (
    <div>
      {cameraPermission === "denied" && (
        <p>Please enable camera in settings</p>
      )}
      {/* ...rest of your component */}
    </div>
  );
};

export default SomeComponent;