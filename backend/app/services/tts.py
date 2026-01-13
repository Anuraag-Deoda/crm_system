import httpx
from ..config import Config

class TTSService:
    ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1"

    # Good Hindi/Indian voices from ElevenLabs
    VOICE_OPTIONS = {
        "rachel": "21m00Tcm4TlvDq8ikWAM",  # Rachel - female
        "domi": "AZnzlk1XvdvUeBnXmlld",     # Domi - female
        "bella": "EXAVITQu4vr4xnSDxMaL",    # Bella - female
        "josh": "TxGEqnHWrfWFTfGW9XjX",     # Josh - male
        "arnold": "VR6AewLTigWG4xSOukaG",   # Arnold - male
        "adam": "pNInz6obpgDQGcFmaJgB",     # Adam - male
    }

    DEFAULT_VOICE = "rachel"

    @classmethod
    def get_speech(cls, text: str, voice: str = None) -> bytes:
        """Convert text to speech using ElevenLabs API"""

        api_key = Config.ELEVENLABS_API_KEY
        if not api_key:
            raise ValueError("ElevenLabs API key not configured")

        voice_id = cls.VOICE_OPTIONS.get(voice or cls.DEFAULT_VOICE, cls.VOICE_OPTIONS[cls.DEFAULT_VOICE])

        url = f"{cls.ELEVENLABS_API_URL}/text-to-speech/{voice_id}"

        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key
        }

        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",  # Best for Hindi/Hinglish
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.5,
                "use_speaker_boost": True
            }
        }

        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, json=data, headers=headers)
            response.raise_for_status()
            return response.content

    @classmethod
    def get_available_voices(cls):
        """Get list of available voices"""
        return list(cls.VOICE_OPTIONS.keys())
