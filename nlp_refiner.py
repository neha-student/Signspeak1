import requests
import json

class NLPRefiner:
    def __init__(self, model_name="llama3"):
        self.model_name = model_name
        self.url = "http://localhost:11434/api/generate"
        print(f"Initialized NLP Refiner with Ollama model: {self.model_name}")

    def refine_intent(self, intent):
        """
        Takes a base intent like "HELP" or "HUNGRY" and uses Ollama
        to generate a natural, polite spoken sentence.
        """
        if not intent:
            return ""
            
        prompt = f"Convert this sign language intent into a short, natural, polite spoken sentence for a text-to-speech engine. Intent: '{intent}'. Only output the sentence, nothing else. No quotes."

        data = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False
        }

        try:
            response = requests.post(self.url, json=data, timeout=5)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "").strip().strip('"\'')
        except requests.exceptions.RequestException as e:
            print(f"Ollama API Error: {e}")
            # Fallback if Ollama is not running
            fallbacks = {
                "HELP": "I need some help, please.",
                "HUNGRY": "I am feeling hungry.",
                "HELLO": "Hello, how are you?",
                "WHERE": "Can you tell me where this is?"
            }
            return fallbacks.get(intent, intent)
