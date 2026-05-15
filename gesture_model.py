import math
import os
import numpy as np

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

class GestureRecognitionModel:
    def __init__(self, model_path='gesture_model.h5'):
        self.model = None
        self.labels = ["HELLO", "HELP", "HUNGRY", "WHERE", "YES", "NO", "THANK YOU"]
        
        if TF_AVAILABLE and os.path.exists(model_path):
            try:
                self.model = tf.keras.models.load_model(model_path)
                print(f"Successfully loaded model from {model_path}")
            except Exception as e:
                print(f"Error loading model: {e}. Falling back to heuristic mode.")
        else:
            print("TensorFlow not available or model file not found. Running in heuristic fallback mode.")

    def predict(self, landmarks):
        """
        Takes MediaPipe landmarks and returns a base intent/meaning string.
        """
        if not landmarks or len(landmarks) == 0:
            return None
            
        if self.model:
            # Flatten landmarks for model input assuming shape (21 * 3,) or similar
            flat_landmarks = []
            for lm in landmarks:
                flat_landmarks.extend([lm[0], lm[1], lm[2]])
            input_data = np.array([flat_landmarks])
            
            # Predict
            try:
                prediction = self.model.predict(input_data, verbose=0)
                class_id = np.argmax(prediction[0])
                if class_id < len(self.labels):
                    return self.labels[class_id]
            except Exception as e:
                print(f"Prediction error: {e}")
            return "UNKNOWN"

        # Fallback Heuristic Logic
        hand = landmarks[0]
        thumb_tip = hand[4]
        index_tip = hand[8]
        
        dist = math.sqrt(
            (thumb_tip[0] - index_tip[0])**2 + 
            (thumb_tip[1] - index_tip[1])**2 + 
            (thumb_tip[2] - index_tip[2])**2
        )
        
        if dist < 0.05:
            return "HELP"
        
        fingers_open = 0
        if hand[8][1] < hand[6][1]: fingers_open += 1
        if hand[12][1] < hand[10][1]: fingers_open += 1
        if hand[16][1] < hand[14][1]: fingers_open += 1
        if hand[20][1] < hand[18][1]: fingers_open += 1

        if fingers_open >= 3:
            return "HELLO"
        elif fingers_open == 0:
            return "HUNGRY"
            
        return "WHERE"
