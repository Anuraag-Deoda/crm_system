from flask import Blueprint, request, jsonify
from ...services.call_manager import CallManager

calls_bp = Blueprint('calls', __name__)


@calls_bp.route('/active', methods=['GET'])
def get_active_calls():
    calls = CallManager.get_active_calls()
    return jsonify(calls)


@calls_bp.route('/active/<call_id>', methods=['GET'])
def get_active_call(call_id):
    call = CallManager.get_call(call_id)
    if call:
        return jsonify(call)
    return jsonify({'error': 'Call not found'}), 404


@calls_bp.route('/logs', methods=['GET'])
def get_call_logs():
    logs = CallManager.get_call_logs()
    return jsonify(logs)


@calls_bp.route('/logs/<call_id>', methods=['GET'])
def get_call_log(call_id):
    log = CallManager.get_call_log(call_id)
    if log:
        return jsonify(log)
    return jsonify({'error': 'Call log not found'}), 404


@calls_bp.route('/transcript/<call_id>', methods=['GET'])
def get_transcript(call_id):
    transcript = CallManager.get_transcript(call_id)
    if transcript:
        return jsonify({'call_id': call_id, 'transcript': transcript})
    return jsonify({'error': 'Transcript not found'}), 404


@calls_bp.route('/stats', methods=['GET'])
def get_call_stats():
    stats = CallManager.get_stats()
    return jsonify(stats)


@calls_bp.route('/<call_id>/takeover', methods=['POST'])
def takeover_call(call_id):
    data = request.json or {}
    reason = data.get('reason', 'manual')
    success = CallManager.takeover(call_id, reason)
    if success:
        return jsonify({'success': True, 'message': 'Call taken over'})
    return jsonify({'error': 'Call not found or already ended'}), 404


@calls_bp.route('/<call_id>/end', methods=['POST'])
def end_call(call_id):
    data = request.json or {}
    outcome = data.get('outcome', 'resolved')
    call = CallManager.end_call(call_id, outcome)
    if call:
        return jsonify({'success': True, 'call': call})
    return jsonify({'error': 'Call not found'}), 404
