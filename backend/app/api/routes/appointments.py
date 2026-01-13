from flask import Blueprint, request, jsonify
from ...services.appointment import AppointmentService

appointments_bp = Blueprint('appointments', __name__)


@appointments_bp.route('/', methods=['GET'])
def get_appointments():
    date = request.args.get('date')
    customer_id = request.args.get('customer_id')

    if date:
        appointments = AppointmentService.get_by_date(date)
    elif customer_id:
        appointments = AppointmentService.get_by_customer(customer_id)
    else:
        appointments = AppointmentService.get_all()
    return jsonify(appointments)


@appointments_bp.route('/<appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    appointment = AppointmentService.get_by_id(appointment_id)
    if appointment:
        return jsonify(appointment)
    return jsonify({'error': 'Appointment not found'}), 404


@appointments_bp.route('/slots', methods=['GET'])
def get_available_slots():
    date = request.args.get('date')
    apt_type = request.args.get('type', 'test_drive')
    if not date:
        return jsonify({'error': 'Date is required'}), 400
    slots = AppointmentService.get_available_slots(date, apt_type)
    return jsonify({'date': date, 'available_slots': slots})


@appointments_bp.route('/today', methods=['GET'])
def get_today_appointments():
    appointments = AppointmentService.get_today()
    return jsonify(appointments)


@appointments_bp.route('/', methods=['POST'])
def create_appointment():
    data = request.json
    appointment = AppointmentService.create(data)
    return jsonify(appointment), 201


@appointments_bp.route('/<appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    data = request.json
    success = AppointmentService.update(appointment_id, data)
    if success:
        return jsonify({'success': True})
    return jsonify({'error': 'Appointment not found'}), 404


@appointments_bp.route('/<appointment_id>/status', methods=['PATCH'])
def update_appointment_status(appointment_id):
    data = request.json
    status = data.get('status')
    if not status:
        return jsonify({'error': 'Status is required'}), 400
    success = AppointmentService.update_status(appointment_id, status)
    if success:
        return jsonify({'success': True})
    return jsonify({'error': 'Appointment not found'}), 404


@appointments_bp.route('/<appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    AppointmentService.delete(appointment_id)
    return jsonify({'success': True})
