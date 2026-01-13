from flask import Blueprint, request, jsonify, Response
from ...services.tts import TTSService

tts_bp = Blueprint('tts', __name__)


@tts_bp.route('/speak', methods=['POST'])
def text_to_speech():
    """Convert text to speech using ElevenLabs"""
    data = request.get_json()
    text = data.get('text', '')
    voice = data.get('voice', 'rachel')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

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
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"TTS Error: {e}")
        return jsonify({'error': 'Failed to generate speech', 'details': str(e)}), 500


@tts_bp.route('/voices', methods=['GET'])
def get_voices():
    """Get available voices"""
    return jsonify({
        'voices': TTSService.get_available_voices(),
        'default': TTSService.DEFAULT_VOICE
    })
