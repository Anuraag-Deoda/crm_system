from flask import Blueprint, request, jsonify
from ...services.call_manager import CallManager
from ...agent.crm_agent import agent

demo_bp = Blueprint('demo', __name__)


@demo_bp.route('/start', methods=['POST'])
def start_demo_call():
    """Start a new demo call"""
    data = request.json or {}
    phone = data.get('phone', '+91 98765 43210')
    customer_name = data.get('customer_name', 'Demo Customer')
    direction = data.get('direction', 'inbound')
    call_type = data.get('type', 'inquiry')

    call = CallManager.start_call(phone, direction, call_type, customer_name)

    greeting = agent.get_greeting()
    CallManager.add_message(call['call_id'], 'assistant', greeting)

    call['transcript'] = CallManager.get_call(call['call_id'])['transcript']

    return jsonify({
        'success': True,
        'call': call,
        'greeting': greeting
    })


@demo_bp.route('/message', methods=['POST'])
def send_message():
    """Send a message in the demo call and get AI response"""
    data = request.json
    call_id = data.get('call_id')
    message = data.get('message')

    if not call_id or not message:
        return jsonify({'error': 'call_id and message are required'}), 400

    call = CallManager.get_call(call_id)
    if not call:
        return jsonify({'error': 'Call not found or ended'}), 404

    if call.get('status') == 'takeover':
        return jsonify({
            'error': 'Call is in takeover mode. Human agent is handling.',
            'takeover': True
        }), 400

    CallManager.add_message(call_id, 'user', message)

    result = agent.process_message(call_id, message, call.get('phone'))

    CallManager.add_message(call_id, 'assistant', result['response'])

    if result.get('functions_called'):
        for func in result['functions_called']:
            if 'model' in str(func.get('arguments', {})).lower():
                model = func['arguments'].get('model_name') or func['arguments'].get('vehicle_model')
                if model:
                    CallManager.update_context(call_id, {'model_discussed': model})

    updated_call = CallManager.get_call(call_id)

    return jsonify({
        'success': True,
        'response': result['response'],
        'functions_called': result.get('functions_called', []),
        'confidence': result.get('confidence', 0.85),
        'sentiment': result.get('sentiment', 0.0),
        'takeover_requested': result.get('takeover_requested', False),
        'call': updated_call
    })


@demo_bp.route('/takeover', methods=['POST'])
def takeover_demo_call():
    """Takeover the demo call"""
    data = request.json
    call_id = data.get('call_id')
    reason = data.get('reason', 'Manual takeover by admin')

    if not call_id:
        return jsonify({'error': 'call_id is required'}), 400

    success = CallManager.takeover(call_id, reason)

    if success:
        takeover_message = "Sir, ek second, main aapko hamare senior executive se connect kar raha hoon..."
        CallManager.add_message(call_id, 'assistant', takeover_message)

        call = CallManager.get_call(call_id)
        return jsonify({
            'success': True,
            'message': 'Call taken over successfully',
            'call': call
        })

    return jsonify({'error': 'Call not found or already ended'}), 404


@demo_bp.route('/human-message', methods=['POST'])
def send_human_message():
    """Send a message as human agent after takeover"""
    data = request.json
    call_id = data.get('call_id')
    message = data.get('message')

    if not call_id or not message:
        return jsonify({'error': 'call_id and message are required'}), 400

    call = CallManager.get_call(call_id)
    if not call:
        return jsonify({'error': 'Call not found'}), 404

    CallManager.add_message(call_id, 'human_agent', message)

    updated_call = CallManager.get_call(call_id)
    return jsonify({
        'success': True,
        'call': updated_call
    })


@demo_bp.route('/end', methods=['POST'])
def end_demo_call():
    """End the demo call"""
    data = request.json
    call_id = data.get('call_id')
    outcome = data.get('outcome', 'resolved')

    if not call_id:
        return jsonify({'error': 'call_id is required'}), 400

    agent.clear_conversation(call_id)

    call = CallManager.end_call(call_id, outcome)

    if call:
        return jsonify({
            'success': True,
            'message': 'Call ended successfully',
            'call': call
        })

    return jsonify({'error': 'Call not found or already ended'}), 404


@demo_bp.route('/status/<call_id>', methods=['GET'])
def get_call_status(call_id):
    """Get current status of a demo call"""
    call = CallManager.get_call(call_id)
    if call:
        return jsonify(call)
    return jsonify({'error': 'Call not found'}), 404
