import tensorflow as tf
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
import json
import os
import cv2
from typing import List, Dict, Tuple
import matplotlib.pyplot as plt
import seaborn as sns

class ExerciseClassifierTrainer:
    """
    Train a custom exercise classifier using pose landmarks
    """
    
    def __init__(self, data_dir: str = "data", model_dir: str = "trained_models"):
        self.data_dir = data_dir
        self.model_dir = model_dir
        self.model = None
        self.label_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        
        # Create directories if they don't exist
        os.makedirs(data_dir, exist_ok=True)
        os.makedirs(model_dir, exist_ok=True)
    
    def generate_synthetic_data(self, num_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic pose data for training
        This simulates different exercise poses
        """
        exercises = ['pushup', 'squat', 'plank', 'jumping_jack', 'lunge']
        X = []
        y = []
        
        for _ in range(num_samples):
            exercise = np.random.choice(exercises)
            
            # Generate synthetic landmarks based on exercise type
            landmarks = self.generate_exercise_landmarks(exercise)
            
            X.append(landmarks.flatten())
            y.append(exercise)
        
        return np.array(X), np.array(y)
    
    def generate_exercise_landmarks(self, exercise: str) -> np.ndarray:
        """
        Generate synthetic landmarks for different exercises
        """
        # Base pose landmarks (33 points from MediaPipe)
        landmarks = np.zeros((33, 3))
        
        if exercise == 'pushup':
            # Pushup position - body horizontal
            landmarks[11] = [0.3, 0.2, 0]  # Left shoulder
            landmarks[12] = [0.7, 0.2, 0]  # Right shoulder
            landmarks[13] = [0.2, 0.4, 0]  # Left elbow
            landmarks[14] = [0.8, 0.4, 0]  # Right elbow
            landmarks[15] = [0.1, 0.6, 0]  # Left wrist
            landmarks[16] = [0.9, 0.6, 0]  # Right wrist
            landmarks[23] = [0.4, 0.5, 0]  # Left hip
            landmarks[24] = [0.6, 0.5, 0]  # Right hip
            landmarks[25] = [0.3, 0.7, 0]  # Left knee
            landmarks[26] = [0.7, 0.7, 0]  # Right knee
            landmarks[27] = [0.2, 0.9, 0]  # Left ankle
            landmarks[28] = [0.8, 0.9, 0]  # Right ankle
            
        elif exercise == 'squat':
            # Squat position - knees bent
            landmarks[11] = [0.3, 0.3, 0]  # Left shoulder
            landmarks[12] = [0.7, 0.3, 0]  # Right shoulder
            landmarks[23] = [0.4, 0.4, 0]  # Left hip
            landmarks[24] = [0.6, 0.4, 0]  # Right hip
            landmarks[25] = [0.3, 0.6, 0]  # Left knee (bent)
            landmarks[26] = [0.7, 0.6, 0]  # Right knee (bent)
            landmarks[27] = [0.2, 0.8, 0]  # Left ankle
            landmarks[28] = [0.8, 0.8, 0]  # Right ankle
            
        elif exercise == 'plank':
            # Plank position - straight line
            landmarks[11] = [0.3, 0.2, 0]  # Left shoulder
            landmarks[12] = [0.7, 0.2, 0]  # Right shoulder
            landmarks[13] = [0.2, 0.3, 0]  # Left elbow
            landmarks[14] = [0.8, 0.3, 0]  # Right elbow
            landmarks[15] = [0.1, 0.4, 0]  # Left wrist
            landmarks[16] = [0.9, 0.4, 0]  # Right wrist
            landmarks[23] = [0.4, 0.5, 0]  # Left hip
            landmarks[24] = [0.6, 0.5, 0]  # Right hip
            landmarks[25] = [0.3, 0.6, 0]  # Left knee
            landmarks[26] = [0.7, 0.6, 0]  # Right knee
            landmarks[27] = [0.2, 0.7, 0]  # Left ankle
            landmarks[28] = [0.8, 0.7, 0]  # Right ankle
            
        elif exercise == 'jumping_jack':
            # Jumping jack position - arms up
            landmarks[11] = [0.2, 0.1, 0]  # Left shoulder
            landmarks[12] = [0.8, 0.1, 0]  # Right shoulder
            landmarks[13] = [0.1, 0.2, 0]  # Left elbow
            landmarks[14] = [0.9, 0.2, 0]  # Right elbow
            landmarks[15] = [0.0, 0.3, 0]  # Left wrist
            landmarks[16] = [1.0, 0.3, 0]  # Right wrist
            landmarks[23] = [0.4, 0.4, 0]  # Left hip
            landmarks[24] = [0.6, 0.4, 0]  # Right hip
            landmarks[25] = [0.3, 0.6, 0]  # Left knee
            landmarks[26] = [0.7, 0.6, 0]  # Right knee
            landmarks[27] = [0.2, 0.8, 0]  # Left ankle
            landmarks[28] = [0.8, 0.8, 0]  # Right ankle
            
        elif exercise == 'lunge':
            # Lunge position - one leg forward
            landmarks[11] = [0.3, 0.3, 0]  # Left shoulder
            landmarks[12] = [0.7, 0.3, 0]  # Right shoulder
            landmarks[23] = [0.4, 0.4, 0]  # Left hip
            landmarks[24] = [0.6, 0.4, 0]  # Right hip
            landmarks[25] = [0.2, 0.6, 0]  # Left knee (forward)
            landmarks[26] = [0.7, 0.7, 0]  # Right knee (back)
            landmarks[27] = [0.1, 0.8, 0]  # Left ankle (forward)
            landmarks[28] = [0.8, 0.9, 0]  # Right ankle (back)
        
        # Add some noise to make it more realistic
        noise = np.random.normal(0, 0.02, landmarks.shape)
        landmarks += noise
        
        # Ensure all values are between 0 and 1
        landmarks = np.clip(landmarks, 0, 1)
        
        return landmarks
    
    def load_real_data(self, data_file: str) -> Tuple[np.ndarray, np.ndarray]:
        """
        Load real pose data from file
        """
        if not os.path.exists(data_file):
            print(f"Data file {data_file} not found. Generating synthetic data...")
            return self.generate_synthetic_data()
        
        data = pd.read_csv(data_file)
        X = data.drop('exercise', axis=1).values
        y = data['exercise'].values
        
        return X, y
    
    def preprocess_data(self, X: np.ndarray, y: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Preprocess the data for training
        """
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        return X_train, X_test, y_train, y_test
    
    def create_model(self, input_shape: int, num_classes: int) -> tf.keras.Model:
        """
        Create the neural network model
        """
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(256, activation='relu', input_shape=(input_shape,)),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.3),
            
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.3),
            
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            
            tf.keras.layers.Dense(num_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train_model(self, X_train: np.ndarray, y_train: np.ndarray, 
                   X_test: np.ndarray, y_test: np.ndarray, 
                   epochs: int = 100, batch_size: int = 32) -> Dict:
        """
        Train the model
        """
        input_shape = X_train.shape[1]
        num_classes = len(np.unique(y_train))
        
        # Create model
        self.model = self.create_model(input_shape, num_classes)
        
        # Callbacks
        callbacks = [
            tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=5),
            tf.keras.callbacks.ModelCheckpoint(
                filepath=os.path.join(self.model_dir, 'best_model.h5'),
                save_best_only=True,
                monitor='val_accuracy'
            )
        ]
        
        # Train model
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_test, y_test),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        # Evaluate model
        test_loss, test_accuracy = self.model.evaluate(X_test, y_test, verbose=0)
        
        return {
            'history': history.history,
            'test_accuracy': test_accuracy,
            'test_loss': test_loss
        }
    
    def plot_training_history(self, history: Dict, save_path: str = None):
        """
        Plot training history
        """
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
        
        # Plot accuracy
        ax1.plot(history['accuracy'], label='Training Accuracy')
        ax1.plot(history['val_accuracy'], label='Validation Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        ax1.grid(True)
        
        # Plot loss
        ax2.plot(history['loss'], label='Training Loss')
        ax2.plot(history['val_loss'], label='Validation Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        ax2.grid(True)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        plt.show()
    
    def save_model_and_preprocessors(self, model_name: str = 'exercise_classifier'):
        """
        Save the trained model and preprocessors
        """
        if self.model is None:
            print("No model to save. Train a model first.")
            return
        
        # Save model
        model_path = os.path.join(self.model_dir, f'{model_name}.h5')
        self.model.save(model_path)
        
        # Save preprocessors
        import joblib
        joblib.dump(self.scaler, os.path.join(self.model_dir, 'scaler.pkl'))
        joblib.dump(self.label_encoder, os.path.join(self.model_dir, 'label_encoder.pkl'))
        
        print(f"Model saved to {model_path}")
        print(f"Preprocessors saved to {self.model_dir}")
    
    def load_model_and_preprocessors(self, model_name: str = 'exercise_classifier'):
        """
        Load the trained model and preprocessors
        """
        import joblib
        
        # Load model
        model_path = os.path.join(self.model_dir, f'{model_name}.h5')
        self.model = tf.keras.models.load_model(model_path)
        
        # Load preprocessors
        self.scaler = joblib.load(os.path.join(self.model_dir, 'scaler.pkl'))
        self.label_encoder = joblib.load(os.path.join(self.model_dir, 'label_encoder.pkl'))
        
        print(f"Model loaded from {model_path}")
    
    def predict_exercise(self, landmarks: np.ndarray) -> Dict:
        """
        Predict exercise from landmarks
        """
        if self.model is None:
            return {'exercise': 'unknown', 'confidence': 0.0}
        
        # Preprocess landmarks
        landmarks_scaled = self.scaler.transform(landmarks.reshape(1, -1))
        
        # Make prediction
        prediction = self.model.predict(landmarks_scaled, verbose=0)
        
        # Get class and confidence
        class_idx = np.argmax(prediction[0])
        confidence = prediction[0][class_idx]
        exercise = self.label_encoder.inverse_transform([class_idx])[0]
        
        return {
            'exercise': exercise,
            'confidence': float(confidence),
            'all_predictions': {
                self.label_encoder.inverse_transform([i])[0]: float(prediction[0][i])
                for i in range(len(prediction[0]))
            }
        }

# Example usage
if __name__ == "__main__":
    # Initialize trainer
    trainer = ExerciseClassifierTrainer()
    
    # Generate or load data
    X, y = trainer.generate_synthetic_data(num_samples=2000)
    
    # Preprocess data
    X_train, X_test, y_train, y_test = trainer.preprocess_data(X, y)
    
    # Train model
    results = trainer.train_model(X_train, y_train, X_test, y_test, epochs=50)
    
    # Plot results
    trainer.plot_training_history(results['history'])
    
    # Save model
    trainer.save_model_and_preprocessors()
    
    print(f"Training completed!")
    print(f"Test Accuracy: {results['test_accuracy']:.4f}")
    print(f"Test Loss: {results['test_loss']:.4f}")

