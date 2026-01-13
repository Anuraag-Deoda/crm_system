from flask import Blueprint, request, jsonify
from ...services.complaint import ComplaintService

complaints_bp = Blueprint('complaints', __name__)


@complaints_bp.route('/', methods=['GET'])
def get_complaints():
    status = request.args.get('status')
    customer_id = request.args.get('customer_id')

    if status:
        complaints = ComplaintService.get_by_status(status)
    elif customer_id:
        complaints = ComplaintService.get_by_customer(customer_id)
    else:
        complaints = ComplaintService.get_all()
    return jsonify(complaints)


@complaints_bp.route('/open', methods=['GET'])
def get_open_complaints():
    complaints = ComplaintService.get_open_complaints()
    return jsonify(complaints)


@complaints_bp.route('/stats', methods=['GET'])
def get_complaint_stats():
    stats = ComplaintService.get_stats()
    return jsonify(stats)


@complaints_bp.route('/<complaint_id>', methods=['GET'])
def get_complaint(complaint_id):
    complaint = ComplaintService.get_by_id(complaint_id)
    if complaint:
        return jsonify(complaint)
    return jsonify({'error': 'Complaint not found'}), 404


@complaints_bp.route('/', methods=['POST'])
def create_complaint():
    data = request.json
    complaint = ComplaintService.create(data)
    return jsonify(complaint), 201


@complaints_bp.route('/<complaint_id>', methods=['PUT'])
def update_complaint(complaint_id):
    data = request.json
    success = ComplaintService.update(complaint_id, data)
    if success:
        return jsonify({'success': True})
    return jsonify({'error': 'Complaint not found'}), 404


@complaints_bp.route('/<complaint_id>/status', methods=['PATCH'])
def update_complaint_status(complaint_id):
    data = request.json
    status = data.get('status')
    resolution = data.get('resolution', '')
    if not status:
        return jsonify({'error': 'Status is required'}), 400
    success = ComplaintService.update_status(complaint_id, status, resolution)
    if success:
        return jsonify({'success': True})
    return jsonify({'error': 'Complaint not found'}), 404


@complaints_bp.route('/<complaint_id>', methods=['DELETE'])
def delete_complaint(complaint_id):
    ComplaintService.delete(complaint_id)
    return jsonify({'success': True})


@complaints_bp.route('/categories', methods=['GET'])
def get_categories():
    return jsonify(ComplaintService.CATEGORIES)
