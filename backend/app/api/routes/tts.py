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

    # Check if API key is configured
    if not Config.ELEVENLABS_API_KEY:
        return jsonify({
            'error': 'ElevenLabs API key not configured',
            'fallback': True
        }), 503

    try:
        audio_content = TTSService.get_speech(text, voice)
        return Response(
            audio_content,
            mimetype='audio/mpeg',
            headers={
                'Content-Disposition': 'inline',
                'Cache-Control': 'no-cache'
            }
        )
    except ValueError as e:
        return jsonify({'error': str(e), 'fallback': True}), 400
    except Exception as e:
        print(f"TTS Error: {e}")
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
