import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

export type ExerciseType = 'pushups' | 'situps' | 'pullups';

export interface VideoAnalysisResult {
  exerciseType: ExerciseType;
  totalReps: number;
  avgConfidence: number;
  postureScore: number; // 0-100
  durationSec: number;
  notes?: string[];
}

function angleBetween(a: any, b: any, c: any): number | null {
  if (!a || !b || !c) return null;
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);
  if (magAB === 0 || magCB === 0) return null;
  const cos = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export async function analyzeVideo(url: string, exerciseType: ExerciseType): Promise<VideoAnalysisResult> {
  await tf.setBackend('webgl');
  await tf.ready();

  const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
  );

  const video = document.createElement('video');
  video.src = url;
  video.crossOrigin = 'anonymous';
  video.playsInline = true;
  await video.play().catch(() => {});
  await new Promise<void>((resolve) => {
    if (video.readyState >= 2) return resolve();
    video.onloadeddata = () => resolve();
  });

  const sampleFps = 10; // frames per second to analyze
  const frameInterval = 1 / sampleFps;
  let lastTime = 0;
  let totalFrames = 0;
  let confidenceAccum = 0;

  let reps = 0;
  let down = false;
  let up = false;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  const notes: string[] = [];

  while (!video.ended) {
    if (video.currentTime - lastTime < frameInterval) {
      await new Promise(requestAnimationFrame);
      continue;
    }
    lastTime = video.currentTime;

    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const poses = await detector.estimatePoses(video);
    if (poses.length === 0) {
      await new Promise(requestAnimationFrame);
      continue;
    }
    const kp = poses[0].keypoints as any[];
    const vis = kp.filter(k => (k.score || 0) > 0.3).length;
    if (vis < 6) { await new Promise(requestAnimationFrame); continue; }

    const conf = Math.max(...kp.map(k => k.score || 0));
    confidenceAccum += conf;
    totalFrames++;

    // Basic posture scoring: average elbow/knee/hip angles closeness to expected ranges
    const leftElbow = angleBetween(kp[5], kp[7], kp[9]);
    const rightElbow = angleBetween(kp[6], kp[8], kp[10]);
    const leftKnee = angleBetween(kp[11], kp[13], kp[15]);
    const rightKnee = angleBetween(kp[12], kp[14], kp[16]);

    const scoreAngle = (angle: number | null, target: number, tol: number) => {
      if (angle == null) return 0;
      const diff = Math.abs(angle - target);
      return Math.max(0, 1 - diff / tol);
    };

    let postureSample = 0;
    if (exerciseType === 'pushups') {
      postureSample = (scoreAngle(leftElbow, 180, 60) + scoreAngle(rightElbow, 180, 60)) / 2;
      // rep logic: wrist/elbow above/below shoulder
      const avgShoulderY = (kp[5].y + kp[6].y) / 2;
      const avgElbowY = (kp[7].y + kp[8].y) / 2;
      const avgWristY = (kp[9].y + kp[10].y) / 2;
      const isDown = avgWristY > avgShoulderY && avgElbowY > avgShoulderY;
      const isUp = avgWristY < avgShoulderY && avgElbowY < avgShoulderY;
      if (isDown && !down) down = true;
      if (isUp && down && !up) { up = true; reps++; }
      if (!isUp && up) { up = false; down = false; }
    } else if (exerciseType === 'situps') {
      postureSample = (scoreAngle(leftKnee, 90, 60) + scoreAngle(rightKnee, 90, 60)) / 2;
      const noseY = kp[0].y;
      const avgHipY = (kp[11].y + kp[12].y) / 2;
      const isDown = noseY > avgHipY;
      const isUp = noseY < avgHipY;
      if (isDown && !down) down = true;
      if (isUp && down && !up) { up = true; reps++; }
      if (!isUp && up) { up = false; down = false; }
    } else if (exerciseType === 'pullups') {
      postureSample = (scoreAngle(leftElbow, 90, 60) + scoreAngle(rightElbow, 90, 60)) / 2;
      const avgShoulderY = (kp[5].y + kp[6].y) / 2;
      const avgWristY = (kp[9].y + kp[10].y) / 2;
      const isDown = avgWristY > avgShoulderY;
      const isUp = avgWristY < avgShoulderY;
      if (isDown && !down) down = true;
      if (isUp && down && !up) { up = true; reps++; }
      if (!isUp && up) { up = false; down = false; }
    }

    // Optional notes for feedback
    if (exerciseType === 'pushups' && leftElbow != null && leftElbow < 60) notes.push('Go lower for full ROM');

    await new Promise(requestAnimationFrame);
  }

  const durationSec = Math.round(video.duration);
  const avgConfidence = totalFrames > 0 ? confidenceAccum / totalFrames : 0;
  const postureScore = Math.round(100 * Math.min(1, Math.max(0, avgConfidence))); // simple proxy; improved above via postureSample if needed

  return {
    exerciseType,
    totalReps: reps,
    avgConfidence,
    postureScore,
    durationSec,
    notes
  };
}
