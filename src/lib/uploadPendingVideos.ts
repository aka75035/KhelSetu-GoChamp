import { supabase } from './supabase';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'react-hot-toast';

// A simple in-memory lock to prevent multiple upload processes from running simultaneously.
let isUploading = false;

/**
 * Processes and uploads videos that are queued in localStorage.
 *
 * @param athleteAadhar The Aadhar number of the athlete, used for the storage path.
 * @returns {Promise<boolean>} A promise that resolves to true if any uploads were attempted.
 */
export const uploadPendingVideos = async (
  athleteAadhar: string,
): Promise<boolean> => {
  // Prevent concurrent uploads
  if (isUploading) {
    console.log("Upload already in progress.");
    return false;
  }
  isUploading = true;

  let uploadsAttempted = false;

  try {
    const pendingVideosResult = await localStorage.getItem('pendingVideos');
    const pendingVideos = JSON.parse(pendingVideosResult || '[]');

    if (pendingVideos.length === 0) {
      console.log("No pending videos to upload.");
      return false;
    }
    
    uploadsAttempted = true;
    toast.loading(`Starting upload for ${pendingVideos.length} video(s)...`, { id: 'upload-toast' });

    let successCount = 0;
    let failureCount = 0;

    for (const video of pendingVideos) {
      try {
        const file = await Filesystem.readFile({
          path: video.path,
          directory: Directory.Documents,
        });

        // The data is base64 encoded, decode it to a blob
        const buffer = Uint8Array.from(atob(file.data as string), c => c.charCodeAt(0));
        const blob = new Blob([buffer], { type: 'video/webm' });

        const filePath = `${athleteAadhar}/${video.exerciseKey}/${video.fileName}`;

        const { data, error } = await supabase.storage
          .from('videos')
          .upload(filePath, blob, {
            contentType: 'video/webm',
            upsert: false, // Avoid overwriting files on the server
          });

        if (error) {
          // If the file already exists, we can consider it "uploaded" and remove it locally.
          if (error.message.includes('already exists')) {
             console.warn(`Video ${video.fileName} already exists on server. Removing local copy.`);
          } else {
            throw new Error(`Supabase upload error: ${error.message}`);
          }
        }
        
        console.log('Video uploaded successfully:', data || video.fileName);
       
        // Remove from local storage queue
        const currentPending = JSON.parse(localStorage.getItem('pendingVideos') || '[]').filter(
          (v: any) => v.path !== video.path
        );
        localStorage.setItem('pendingVideos', JSON.stringify(currentPending));

        // Delete the local file
        await Filesystem.deleteFile({
          path: video.path,
          directory: Directory.Documents,
        });

        successCount++;

      } catch (e: any) {
        failureCount++;
        console.error('Failed to upload pending video:', video.fileName, e);
        toast.error(`Upload failed for ${video.fileName}`, { duration: 4000 });
      }
    }

    if (successCount > 0 || failureCount > 0) {
        toast.dismiss('upload-toast');
        toast.success(`${successCount} video(s) uploaded. ${failureCount} failed.`);
    } else {
        toast.dismiss('upload-toast');
    }

  } catch (e: any) {
    console.error("Error in uploadPendingVideos function:", e);
    toast.error("An unexpected error occurred during the upload process.");
  } finally {
    isUploading = false; // Release the lock
  }
  return uploadsAttempted;
};
