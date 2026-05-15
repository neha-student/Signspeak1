from gtts import gTTS
import io
import base64

class TTSEngine:
    def __init__(self):
        print("Initialized TTS Engine")

    def generate_audio_base64(self, text):
        """
        Converts text to speech using gTTS and returns a base64 encoded MP3 string.
        """
        if not text:
            return None
        
        try:
            tts = gTTS(text=text, lang='en')
            # Save to an in-memory file
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            
            # Encode as base64
            audio_base64 = base64.b64encode(fp.read()).decode('utf-8')
            return audio_base64
        except Exception as e:
            print(f"TTS Error: {e}")
            return None
