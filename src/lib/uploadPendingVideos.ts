import { Filesystem, Directory } from "@capacitor/filesystem";
import { supabase } from "./supabase"; // adjust path if needed

export async function uploadPendingVideos() {
  const pendingVideos = JSON.parse(localStorage.getItem("pendingVideos") || "[]");
  const uploaded = [];

  for (const video of pendingVideos) {
    try {
      const file = await Filesystem.readFile({
        path: video.path,
        directory: Directory.Documents,
      });
      const byteCharacters = atob(file.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "video/webm" });

      const { error } = await supabase.storage
        .from("videos")
        .upload(`${video.athleteId}/${video.exerciseKey}/${video.fileName}`, blob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (!error) {
        uploaded.push(video);
      }
    } catch (e) {
      console.error("Upload failed for", video.path, e);
    }
  }

  if (uploaded.length > 0) {
    const newPending = pendingVideos.filter(
      v => !uploaded.some(u => u.path === v.path)
    );
    localStorage.setItem("pendingVideos", JSON.stringify(newPending));
  }
}