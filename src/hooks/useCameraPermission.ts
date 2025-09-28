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