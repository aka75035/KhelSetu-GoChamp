import { HumanDetectionResult } from '../../src/hooks/useHumanDetection';

export interface MLDetectionResult extends HumanDetectionResult {
  exerciseClassification?: {
    exercise: string;
    confidence: number;
    allPredictions: Record<string, number>;
  };
  formAnalysis?: {
    formScore: number;
    recommendations: string[];
  };
  holisticFeatures?: {
    faceLandmarks?: any[];
    handLandmarks?: any[];
  };
}

export class MLModelIntegration {
  private apiUrl: string;
  private isServerRunning: boolean = false;

  constructor(apiUrl: string = 'http://localhost:5000') {
    this.apiUrl = apiUrl;
  }

  /**
   * Check if the Python ML server is running
   */
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      const data = await response.json();
      this.isServerRunning = data.status === 'healthy';
      return this.isServerRunning;
    } catch (error) {
      console.warn('ML server not available:', error);
      this.isServerRunning = false;
      return false;
    }
  }

  /**
   * Convert video frame to base64 for API transmission
   */
  private async frameToBase64(videoElement: HTMLVideoElement): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  }

  /**
   * Process video frame using Python ML models
   */
  async processFrame(
    videoElement: HTMLVideoElement,
    exerciseType: string = 'general'
  ): Promise<MLDetectionResult> {
    try {
      // Check if server is running
      if (!this.isServerRunning) {
        const isRunning = await this.checkServerHealth();
        if (!isRunning) {
          throw new Error('ML server is not available');
        }
      }

      // Convert frame to base64
      const imageBase64 = await this.frameToBase64(videoElement);

      // Send request to Python API
      const response = await fetch(`${this.apiUrl}/process_video_frame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          exercise_type: exerciseType
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Convert API response to our format
      return this.convertApiResponse(result);

    } catch (error) {
      console.error('Error processing frame with ML models:', error);
      
      // Return fallback result
      return {
        isHumanDetected: false,
        poseKeypoints: [],
        boundingBox: undefined,
        confidence: 0,
        exerciseClassification: undefined,
        formAnalysis: undefined,
        holisticFeatures: undefined
      };
    }
  }

  /**
   * Convert Python API response to our TypeScript interface
   */
  private convertApiResponse(apiResult: any): MLDetectionResult {
    const poseDetection = apiResult.pose_detection || {};
    const exerciseClassification = apiResult.exercise_classification;
    const holisticDetection = apiResult.holistic_detection || {};

    return {
      isHumanDetected: poseDetection.is_human_detected || false,
      poseKeypoints: poseDetection.keypoints || [],
      boundingBox: poseDetection.bounding_box ? {
        x: poseDetection.bounding_box.x,
        y: poseDetection.bounding_box.y,
        width: poseDetection.bounding_box.width,
        height: poseDetection.bounding_box.height
      } : undefined,
      confidence: poseDetection.confidence || 0,
      exerciseClassification: exerciseClassification ? {
        exercise: exerciseClassification.exercise,
        confidence: exerciseClassification.confidence,
        allPredictions: exerciseClassification.all_predictions || {}
      } : undefined,
      formAnalysis: exerciseClassification ? {
        formScore: exerciseClassification.form_score || 0,
        recommendations: exerciseClassification.recommendations || []
      } : undefined,
      holisticFeatures: {
        faceLandmarks: holisticDetection.face_landmarks,
        handLandmarks: [
          ...(holisticDetection.left_hand_landmarks || []),
          ...(holisticDetection.right_hand_landmarks || [])
        ]
      }
    };
  }

  /**
   * Train the exercise classifier
   */
  async trainClassifier(options: {
    numSamples?: number;
    epochs?: number;
    batchSize?: number;
  } = {}): Promise<{ success: boolean; message: string; accuracy?: number }> {
    try {
      const response = await fetch(`${this.apiUrl}/train_classifier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          num_samples: options.numSamples || 1000,
          epochs: options.epochs || 50,
          batch_size: options.batchSize || 32
        })
      });

      if (!response.ok) {
        throw new Error(`Training failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message,
        accuracy: result.test_accuracy
      };

    } catch (error) {
      console.error('Error training classifier:', error);
      return {
        success: false,
        message: `Training failed: ${error}`
      };
    }
  }

  /**
   * Get information about loaded models
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/get_model_info`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting model info:', error);
      return null;
    }
  }

  /**
   * Analyze exercise form from landmarks
   */
  async analyzeForm(landmarks: number[][], exerciseType: string): Promise<{
    formScore: number;
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/analyze_form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          landmarks: landmarks,
          exercise_type: exerciseType
        })
      });

      if (!response.ok) {
        throw new Error(`Form analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        formScore: result.form_score || 0,
        recommendations: result.recommendations || []
      };

    } catch (error) {
      console.error('Error analyzing form:', error);
      return {
        formScore: 0,
        recommendations: ['Unable to analyze form']
      };
    }
  }
}

// Export singleton instance
export const mlIntegration = new MLModelIntegration();

