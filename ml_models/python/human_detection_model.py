import tensorflow as tf
import cv2
import numpy as np
import mediapipe as mp
from typing import List, Tuple, Dict, Optional
import json
import os

class HumanDetectionModel:
    """
    Advanced Human Detection Model using MediaPipe and TensorFlow
    """
    
    def __init__(self, model_path: str = None):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_holistic = mp.solutions.holistic
        
        # Initialize pose detection
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Initialize holistic detection (face, pose, hands)
        self.holistic = self.mp_holistic.Holistic(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=True,
            refine_face_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Custom TensorFlow model for exercise classification
        self.exercise_model = None
        self.model_path = model_path
        
        if model_path and os.path.exists(model_path):
            self.load_custom_model(model_path)
    
    def detect_human_pose(self, frame: np.ndarray) -> Dict:
        """
        Detect human pose and return keypoints, bounding box, and confidence
        """
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process the frame
        results = self.pose.process(rgb_frame)
        
        detection_result = {
            'is_human_detected': False,
            'keypoints': [],
            'bounding_box': None,
            'confidence': 0.0,
            'landmarks': [],
            'segmentation_mask': None
        }
        
        if results.pose_landmarks:
            detection_result['is_human_detected'] = True
            detection_result['confidence'] = 0.9  # MediaPipe doesn't provide confidence directly
            
            # Extract keypoints
            h, w, _ = frame.shape
            keypoints = []
            landmarks = []
            
            for landmark in results.pose_landmarks.landmark:
                x = int(landmark.x * w)
                y = int(landmark.y * h)
                z = landmark.z
                visibility = landmark.visibility
                
                keypoints.append({
                    'x': x, 'y': y, 'z': z, 'visibility': visibility
                })
                landmarks.append([x, y, z])
            
            detection_result['keypoints'] = keypoints
            detection_result['landmarks'] = landmarks
            
            # Calculate bounding box
            if landmarks:
                landmarks_array = np.array(landmarks)
                x_min = int(np.min(landmarks_array[:, 0]))
                y_min = int(np.min(landmarks_array[:, 1]))
                x_max = int(np.max(landmarks_array[:, 0]))
                y_max = int(np.max(landmarks_array[:, 1]))
                
                detection_result['bounding_box'] = {
                    'x': x_min,
                    'y': y_min,
                    'width': x_max - x_min,
                    'height': y_max - y_min
                }
            
            # Get segmentation mask
            if results.segmentation_mask is not None:
                detection_result['segmentation_mask'] = results.segmentation_mask
        
        return detection_result
    
    def detect_holistic(self, frame: np.ndarray) -> Dict:
        """
        Detect holistic features (face, pose, hands) using MediaPipe
        """
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.holistic.process(rgb_frame)
        
        holistic_result = {
            'pose_landmarks': results.pose_landmarks,
            'face_landmarks': results.face_landmarks,
            'left_hand_landmarks': results.left_hand_landmarks,
            'right_hand_landmarks': results.right_hand_landmarks,
            'pose_world_landmarks': results.pose_world_landmarks,
            'face_landmarks_world': results.face_landmarks_world
        }
        
        return holistic_result
    
    def classify_exercise(self, landmarks: List[List[float]], exercise_type: str) -> Dict:
        """
        Classify the type of exercise being performed
        """
        if not self.exercise_model:
            return {'exercise': 'unknown', 'confidence': 0.0, 'form_score': 0.0}
        
        # Preprocess landmarks for the model
        processed_landmarks = self.preprocess_landmarks(landmarks)
        
        # Make prediction
        prediction = self.exercise_model.predict(processed_landmarks.reshape(1, -1))
        
        # Calculate form score based on keypoint visibility and positioning
        form_score = self.calculate_form_score(landmarks)
        
        return {
            'exercise': exercise_type,
            'confidence': float(prediction[0][0]),
            'form_score': form_score,
            'recommendations': self.get_form_recommendations(landmarks, exercise_type)
        }
    
    def preprocess_landmarks(self, landmarks: List[List[float]]) -> np.ndarray:
        """
        Preprocess landmarks for model input
        """
        # Flatten landmarks and normalize
        flat_landmarks = np.array(landmarks).flatten()
        
        # Normalize to 0-1 range
        if len(flat_landmarks) > 0:
            flat_landmarks = (flat_landmarks - np.min(flat_landmarks)) / (np.max(flat_landmarks) - np.min(flat_landmarks))
        
        return flat_landmarks
    
    def calculate_form_score(self, landmarks: List[List[float]]) -> float:
        """
        Calculate form score based on pose analysis
        """
        if not landmarks or len(landmarks) < 10:
            return 0.0
        
        # Simple form scoring based on keypoint visibility and symmetry
        visible_points = sum(1 for landmark in landmarks if landmark[2] > 0.5)  # z > 0.5 indicates visibility
        total_points = len(landmarks)
        
        visibility_score = visible_points / total_points if total_points > 0 else 0
        
        # Add symmetry analysis for certain exercises
        symmetry_score = self.analyze_symmetry(landmarks)
        
        # Combine scores
        form_score = (visibility_score * 0.7) + (symmetry_score * 0.3)
        
        return min(form_score, 1.0)
    
    def analyze_symmetry(self, landmarks: List[List[float]]) -> float:
        """
        Analyze pose symmetry for form evaluation
        """
        if len(landmarks) < 10:
            return 0.0
        
        # Define left and right side keypoints (MediaPipe pose model)
        left_side = [11, 13, 15, 23, 25, 27]  # Left arm and leg
        right_side = [12, 14, 16, 24, 26, 28]  # Right arm and leg
        
        symmetry_scores = []
        
        for left_idx, right_idx in zip(left_side, right_side):
            if left_idx < len(landmarks) and right_idx < len(landmarks):
                left_point = landmarks[left_idx]
                right_point = landmarks[right_idx]
                
                # Calculate horizontal symmetry
                if left_point[2] > 0.5 and right_point[2] > 0.5:  # Both points visible
                    y_diff = abs(left_point[1] - right_point[1])
                    symmetry_scores.append(1.0 - min(y_diff / 100, 1.0))  # Normalize by 100 pixels
        
        return np.mean(symmetry_scores) if symmetry_scores else 0.0
    
    def get_form_recommendations(self, landmarks: List[List[float]], exercise_type: str) -> List[str]:
        """
        Get form recommendations based on pose analysis
        """
        recommendations = []
        
        if not landmarks or len(landmarks) < 10:
            return ["Ensure you are visible in the camera frame"]
        
        # Exercise-specific recommendations
        if exercise_type.lower() == 'pushup':
            recommendations.extend(self.analyze_pushup_form(landmarks))
        elif exercise_type.lower() == 'squat':
            recommendations.extend(self.analyze_squat_form(landmarks))
        elif exercise_type.lower() == 'plank':
            recommendations.extend(self.analyze_plank_form(landmarks))
        
        return recommendations
    
    def analyze_pushup_form(self, landmarks: List[List[float]]) -> List[str]:
        """Analyze pushup form and provide recommendations"""
        recommendations = []
        
        # Check shoulder alignment
        if len(landmarks) > 11:
            left_shoulder = landmarks[11]
            right_shoulder = landmarks[12]
            
            if abs(left_shoulder[1] - right_shoulder[1]) > 20:
                recommendations.append("Keep your shoulders level")
        
        # Check body alignment
        if len(landmarks) > 11 and len(landmarks) > 23:
            shoulder = landmarks[11]
            hip = landmarks[23]
            
            if abs(shoulder[0] - hip[0]) > 30:
                recommendations.append("Keep your body in a straight line")
        
        return recommendations
    
    def analyze_squat_form(self, landmarks: List[List[float]]) -> List[str]:
        """Analyze squat form and provide recommendations"""
        recommendations = []
        
        # Check knee alignment
        if len(landmarks) > 25 and len(landmarks) > 26:
            left_knee = landmarks[25]
            right_knee = landmarks[26]
            
            if abs(left_knee[0] - right_knee[0]) > 50:
                recommendations.append("Keep your knees aligned with your feet")
        
        return recommendations
    
    def analyze_plank_form(self, landmarks: List[List[float]]) -> List[str]:
        """Analyze plank form and provide recommendations"""
        recommendations = []
        
        # Check body alignment
        if len(landmarks) > 11 and len(landmarks) > 23:
            shoulder = landmarks[11]
            hip = landmarks[23]
            
            if abs(shoulder[1] - hip[1]) > 30:
                recommendations.append("Keep your body in a straight line from head to heels")
        
        return recommendations
    
    def create_custom_model(self, input_shape: int, num_classes: int) -> tf.keras.Model:
        """
        Create a custom TensorFlow model for exercise classification
        """
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(input_shape,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(num_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def load_custom_model(self, model_path: str):
        """Load a pre-trained custom model"""
        try:
            self.exercise_model = tf.keras.models.load_model(model_path)
            print(f"Custom model loaded from {model_path}")
        except Exception as e:
            print(f"Error loading custom model: {e}")
    
    def save_model(self, model_path: str):
        """Save the trained model"""
        if self.exercise_model:
            self.exercise_model.save(model_path)
            print(f"Model saved to {model_path}")
    
    def draw_pose_landmarks(self, frame: np.ndarray, landmarks: List[List[float]]) -> np.ndarray:
        """
        Draw pose landmarks on the frame
        """
        annotated_frame = frame.copy()
        
        # Draw keypoints
        for landmark in landmarks:
            if landmark[2] > 0.5:  # Only draw visible points
                cv2.circle(annotated_frame, (int(landmark[0]), int(landmark[1])), 5, (0, 255, 0), -1)
        
        return annotated_frame
    
    def process_video_frame(self, frame: np.ndarray, exercise_type: str = "general") -> Dict:
        """
        Process a single video frame and return comprehensive analysis
        """
        # Detect pose
        pose_result = self.detect_human_pose(frame)
        
        # Detect holistic features
        holistic_result = self.detect_holistic(frame)
        
        # Classify exercise if landmarks are available
        exercise_result = {}
        if pose_result['landmarks']:
            exercise_result = self.classify_exercise(pose_result['landmarks'], exercise_type)
        
        # Combine results
        result = {
            'pose_detection': pose_result,
            'holistic_detection': holistic_result,
            'exercise_classification': exercise_result,
            'timestamp': cv2.getTickCount() / cv2.getTickFrequency()
        }
        
        return result

# Example usage and testing
if __name__ == "__main__":
    # Initialize the model
    detector = HumanDetectionModel()
    
    # Test with webcam
    cap = cv2.VideoCapture(0)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Process frame
        result = detector.process_video_frame(frame, "pushup")
        
        # Draw results
        if result['pose_detection']['landmarks']:
            frame = detector.draw_pose_landmarks(frame, result['pose_detection']['landmarks'])
        
        # Display
        cv2.imshow('Human Detection', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
