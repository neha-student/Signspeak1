from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json

from utils import process_frame
from gesture_model import GestureRecognitionModel
from nlp_refiner import NLPRefiner
from tts_engine import TTSEngine

app = FastAPI()

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gesture_model = GestureRecognitionModel()
nlp_refiner = NLPRefiner()
tts_engine = TTSEngine()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected via WebSocket")
    
    last_intent = None

    try:
        while True:
            # Receive base64 frame from frontend
            data = await websocket.receive_text()
            
            # Get MediaPipe landmarks
            landmarks, error = process_frame(data)
            
            if error:
                await websocket.send_json({"error": error})
                continue
                
            if not landmarks:
                continue
                
            # Predict gesture (Simulated)
            intent = gesture_model.predict(landmarks)
            
            # Simple debouncing logic: only trigger if intent changes
            if intent and intent != last_intent:
                last_intent = intent
                print(f"Detected intent: {intent}")
                
                # Use Ollama to convert intent to a spoken sentence
                sentence = nlp_refiner.refine_intent(intent)
                print(f"Refined sentence: {sentence}")
                
                # Generate MP3 audio using gTTS (Base64)
                audio_base64 = tts_engine.generate_audio_base64(sentence)
                
                # Send everything back to the React UI
                await websocket.send_json({
                    "intent": intent,
                    "sentence": sentence,
                    "audio_base64": audio_base64,
                    "landmarks": landmarks
                })

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket Exception: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
