from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from .api.routes.customers import customers_bp
from .api.routes.appointments import appointments_bp
from .api.routes.complaints import complaints_bp
from .api.routes.leads import leads_bp
from .api.routes.vehicles import vehicles_bp
from .api.routes.calls import calls_bp
from .api.routes.demo import demo_bp
from .services.call_manager import CallManager

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

app.register_blueprint(customers_bp, url_prefix='/api/customers')
app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
app.register_blueprint(complaints_bp, url_prefix='/api/complaints')
app.register_blueprint(leads_bp, url_prefix='/api/leads')
app.register_blueprint(vehicles_bp, url_prefix='/api/vehicles')
app.register_blueprint(calls_bp, url_prefix='/api/calls')
app.register_blueprint(demo_bp, url_prefix='/api/demo')


@app.route('/')
def index():
    return jsonify({
        'name': 'Satis Motor CRM API',
        'version': '1.0.0',
        'status': 'running'
    })


@app.route('/api/dashboard/stats')
def get_dashboard_stats():
    from .services.complaint import ComplaintService
    from .services.lead import LeadService
    from .services.appointment import AppointmentService

    call_stats = CallManager.get_stats()
    complaint_stats = ComplaintService.get_stats()
    lead_stats = LeadService.get_stats()
    today_appointments = AppointmentService.get_today()

    return jsonify({
        'calls': call_stats,
        'complaints': complaint_stats,
        'leads': lead_stats,
        'today_appointments': len(today_appointments),
        'active_calls': len(CallManager.get_active_calls())
    })


@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connected', {'status': 'connected'})


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@socketio.on('subscribe_call')
def handle_subscribe(data):
    call_id = data.get('call_id')
    call = CallManager.get_call(call_id)
    if call:
        emit('call_update', call)


@socketio.on('get_active_calls')
def handle_get_active_calls():
    calls = CallManager.get_active_calls()
    emit('active_calls', calls)


def broadcast_call_update(call_id):
    call = CallManager.get_call(call_id)
    if call:
        socketio.emit('call_update', call)


def broadcast_active_calls():
    calls = CallManager.get_active_calls()
    socketio.emit('active_calls', calls)


if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
