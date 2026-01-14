from flask import Blueprint, request, jsonify, Response
from ...services.tts import TTSService
from ...config import Config

tts_bp = Blueprint('tts', __name__)


@tts_bp.route('/speak', methods=['POST'])
def text_to_speech():
    """Convert text to speech using ElevenLabs"""
    data = request.get_json()
    text = data.get('text', '')
    voice = data.get('voice', 'rachel')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Re-check API key at request time (in case env wasn't loaded at import)
    api_key = Config.ELEVENLABS_API_KEY
    if not api_key:
        # Try loading directly from env
        import os
        api_key = os.getenv('elevenlabs_api_key') or os.getenv('ELEVENLABS_API_KEY')
        if api_key:
            Config.ELEVENLABS_API_KEY = api_key
            print(f"[TTS] Loaded API key from env directly")

    if not api_key:
        print(f"[TTS] API key not found!")
        return jsonify({
            'error': 'ElevenLabs API key not configured',
            'fallback': True
        }), 503

    try:
        print(f"[TTS] Generating speech for: {text[:50]}...")
        audio_content = TTSService.get_speech(text, voice)
        print(f"[TTS] Generated {len(audio_content)} bytes of audio")
        return Response(
            audio_content,
            mimetype='audio/mpeg',
            headers={
                'Content-Disposition': 'inline',
                'Cache-Control': 'no-cache'
            }
        )
    except ValueError as e:
        print(f"[TTS] ValueError: {e}")
        return jsonify({'error': str(e), 'fallback': True}), 400
    except Exception as e:
        import traceback
        print(f"[TTS] Error: {e}")
        print(f"[TTS] Traceback: {traceback.format_exc()}")
        return jsonify({
            'error': 'Failed to generate speech',
            'details': str(e),
            'fallback': True
        }), 500


@tts_bp.route('/voices', methods=['GET'])
def get_voices():
    """Get available voices"""
    return jsonify({
        'voices': TTSService.get_available_voices(),
        'default': TTSService.DEFAULT_VOICE,
        'available': bool(Config.ELEVENLABS_API_KEY)
    })


@tts_bp.route('/status', methods=['GET'])
def get_status():
    """Check if ElevenLabs TTS is available"""
    return jsonify({
        'available': bool(Config.ELEVENLABS_API_KEY),
        'message': 'ElevenLabs configured' if Config.ELEVENLABS_API_KEY else 'ElevenLabs API key not set'
    })
