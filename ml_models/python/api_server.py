from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import json
import os
from human_detection_model import HumanDetectionModel
from train_exercise_classifier import ExerciseClassifierTrainer

app = Flask(__name__)
CORS(app)

# Initialize models
detector = HumanDetectionModel()
classifier_trainer = ExerciseClassifierTrainer()

# Load trained classifier if available
try:
    classifier_trainer.load_model_and_preprocessors()
    print("Exercise classifier loaded successfully")
except:
    print("No trained classifier found. Train one first.")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'ML API server is running'
    })

@app.route('/detect_human', methods=['POST'])
def detect_human():
    """
    Detect human in image and return pose information
    """
    try:
        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Process frame
        result = detector.process_video_frame(frame, data.get('exercise_type', 'general'))
        
        # Convert numpy arrays to lists for JSON serialization
        def convert_numpy(obj):
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            return obj
        
        # Clean up the result for JSON serialization
        clean_result = json.loads(json.dumps(result, default=convert_numpy))
        
        return jsonify(clean_result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/classify_exercise', methods=['POST'])
def classify_exercise():
    """
    Classify exercise from pose landmarks
    """
    try:
        data = request.get_json()
        
        if 'landmarks' not in data:
            return jsonify({'error': 'No landmarks provided'}), 400
        
        landmarks = np.array(data['landmarks'])
        
        # Classify exercise
        prediction = classifier_trainer.predict_exercise(landmarks)
        
        return jsonify(prediction)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze_form', methods=['POST'])
def analyze_form():
    """
    Analyze exercise form and provide recommendations
    """
    try:
        data = request.get_json()
        
        if 'landmarks' not in data or 'exercise_type' not in data:
            return jsonify({'error': 'Missing landmarks or exercise_type'}), 400
        
        landmarks = np.array(data['landmarks'])
        exercise_type = data['exercise_type']
        
        # Analyze form
        form_analysis = detector.classify_exercise(landmarks, exercise_type)
        
        return jsonify(form_analysis)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/train_classifier', methods=['POST'])
def train_classifier():
    """
    Train the exercise classifier
    """
    try:
        data = request.get_json()
        
        # Get training parameters
        num_samples = data.get('num_samples', 1000)
        epochs = data.get('epochs', 50)
        batch_size = data.get('batch_size', 32)
        
        # Generate synthetic data
        X, y = classifier_trainer.generate_synthetic_data(num_samples)
        
        # Preprocess data
        X_train, X_test, y_train, y_test = classifier_trainer.preprocess_data(X, y)
        
        # Train model
        results = classifier_trainer.train_model(
            X_train, y_train, X_test, y_test, 
            epochs=epochs, batch_size=batch_size
        )
        
        # Save model
        classifier_trainer.save_model_and_preprocessors()
        
        return jsonify({
            'message': 'Training completed successfully',
            'test_accuracy': results['test_accuracy'],
            'test_loss': results['test_loss']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_model_info', methods=['GET'])
def get_model_info():
    """
    Get information about loaded models
    """
    try:
        info = {
            'human_detection': {
                'loaded': True,
                'type': 'MediaPipe + TensorFlow',
                'features': ['pose_detection', 'holistic_detection', 'form_analysis']
            },
            'exercise_classifier': {
                'loaded': classifier_trainer.model is not None,
                'type': 'Custom TensorFlow Neural Network',
                'classes': classifier_trainer.label_encoder.classes_.tolist() if hasattr(classifier_trainer.label_encoder, 'classes_') else []
            }
        }
        
        return jsonify(info)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/process_video_frame', methods=['POST'])
def process_video_frame():
    """
    Complete processing of a video frame including detection and classification
    """
    try:
        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        exercise_type = data.get('exercise_type', 'general')
        
        # Process frame
        result = detector.process_video_frame(frame, exercise_type)
        
        # Add exercise classification if landmarks are available
        if result['pose_detection']['landmarks']:
            landmarks = np.array(result['pose_detection']['landmarks'])
            classification = classifier_trainer.predict_exercise(landmarks)
            result['exercise_classification'] = classification
        
        # Convert numpy arrays to lists for JSON serialization
        def convert_numpy(obj):
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            return obj
        
        # Clean up the result for JSON serialization
        clean_result = json.loads(json.dumps(result, default=convert_numpy))
        
        return jsonify(clean_result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting ML API server...")
    print("Available endpoints:")
    print("- POST /detect_human - Detect human pose in image")
    print("- POST /classify_exercise - Classify exercise from landmarks")
    print("- POST /analyze_form - Analyze exercise form")
    print("- POST /train_classifier - Train exercise classifier")
    print("- GET /get_model_info - Get model information")
    print("- POST /process_video_frame - Complete frame processing")
    
    app.run(host='0.0.0.0', port=5000, debug=True)

