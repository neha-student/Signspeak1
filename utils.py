import cv2
import mediapipe as mp
import numpy as np
import base64

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

def process_frame(base64_string):
    """
    Decodes a base64 string to a cv2 image, processes it with MediaPipe,
    and returns a list of landmarks.
    """
    try:
        # Decode base64 to numpy array
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return None, "Failed to decode image"

        # Convert to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Process with MediaPipe
        results = hands.process(img_rgb)
        
        landmarks_data = []
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Extract 21 landmarks
                lm_list = []
                for lm in hand_landmarks.landmark:
                    lm_list.append([lm.x, lm.y, lm.z])
                landmarks_data.append(lm_list)
                
        return landmarks_data, None
    except Exception as e:
        return None, str(e)
