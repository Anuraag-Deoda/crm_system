import os
from dotenv import load_dotenv

# Try multiple locations for .env file
env_paths = [
    os.path.join(os.path.dirname(__file__), '..', '..', '.env'),  # Local dev (crm_system/.env)
    os.path.join(os.path.dirname(__file__), '..', '.env'),        # Backend folder
    '/app/.env',                                                    # Docker mount
    '.env'                                                          # Current dir
]

_env_loaded = False
for env_path in env_paths:
    if os.path.exists(env_path):
        load_dotenv(env_path, override=True)
        _env_loaded = True
        print(f"[Config] Loaded .env from: {env_path}")
        break

if not _env_loaded:
    print("[Config] Warning: No .env file found!")

class Config:
    # Support both lowercase (from .env) and uppercase (from environment)
    OPENAI_API_KEY = os.getenv('openai_api_key') or os.getenv('OPENAI_API_KEY')
    GEMINI_API_KEY = os.getenv('gemini_api_key') or os.getenv('GEMINI_API_KEY')
    ELEVENLABS_API_KEY = os.getenv('elevenlabs_api_key') or os.getenv('ELEVENLABS_API_KEY')

    @classmethod
    def debug_keys(cls):
        """Print key status for debugging"""
        print(f"[Config] OpenAI: {'set' if cls.OPENAI_API_KEY else 'NOT SET'}")
        print(f"[Config] ElevenLabs: {'set' if cls.ELEVENLABS_API_KEY else 'NOT SET'}")
        print(f"[Config] Gemini: {'set' if cls.GEMINI_API_KEY else 'NOT SET'}")

    DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

    CUSTOMERS_FILE = os.path.join(DATA_DIR, 'customers.xlsx')
    APPOINTMENTS_FILE = os.path.join(DATA_DIR, 'appointments.xlsx')
    COMPLAINTS_FILE = os.path.join(DATA_DIR, 'complaints.xlsx')
    LEADS_FILE = os.path.join(DATA_DIR, 'leads.xlsx')
    VEHICLES_FILE = os.path.join(DATA_DIR, 'vehicles.xlsx')
    SERVICE_HISTORY_FILE = os.path.join(DATA_DIR, 'service_history.xlsx')
    CALL_LOGS_FILE = os.path.join(DATA_DIR, 'call_logs.xlsx')
    TRANSCRIPTS_DIR = os.path.join(DATA_DIR, 'transcripts')

    DEALERSHIP_NAME = "Satis Motor"
    DEALERSHIP_ADDRESS = "MG Road, Pune"
    DEALERSHIP_PHONE = "+91 20 1234 5678"
    DEALERSHIP_TIMINGS = "9:00 AM - 7:00 PM (Mon-Sat), 10:00 AM - 5:00 PM (Sun)"
