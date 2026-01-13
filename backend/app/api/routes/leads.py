from flask import Blueprint, request, jsonify
from ...services.lead import LeadService

leads_bp = Blueprint('leads', __name__)


@leads_bp.route('/', methods=['GET'])
def get_leads():
    stage = request.args.get('stage')
    active_only = request.args.get('active', 'false').lower() == 'true'

    if stage:
        leads = LeadService.get_by_stage(stage)
    elif active_only:
        leads = LeadService.get_active_leads()
    else:
        leads = LeadService.get_all()
    return jsonify(leads)


@leads_bp.route('/pipeline', methods=['GET'])
def get_pipeline():
    pipeline = LeadService.get_pipeline()
    return jsonify(pipeline)


@leads_bp.route('/stats', methods=['GET'])
def get_lead_stats():
    stats = LeadService.get_stats()
    return jsonify(stats)


@leads_bp.route('/<lead_id>', methods=['GET'])
def get_lead(lead_id):
    lead = LeadService.get_by_id(lead_id)
    if lead:
        return jsonify(lead)
    return jsonify({'error': 'Lead not found'}), 404


@leads_bp.route('/phone/<phone>', methods=['GET'])
def get_lead_by_phone(phone):
    lead = LeadService.get_by_phone(phone)
    if lead:
        return jsonify(lead)
    return jsonify({'error': 'Lead not found'}), 404


@leads_bp.route('/', methods=['POST'])
def create_lead():
    data = request.json
    lead = LeadService.create(data)
    return jsonify(lead), 201


@leads_bp.route('/<lead_id>', methods=['PUT'])
def update_lead(lead_id):
    data = request.json
    success = LeadService.update(lead_id, data)
    if success:
        return jsonify({'success': True})
    return jsonify({'error': 'Lead not found'}), 404


@leads_bp.route('/<lead_id>/stage', methods=['PATCH'])
def update_lead_stage(lead_id):
    data = request.json
    stage = data.get('stage')
    if not stage:
        return jsonify({'error': 'Stage is required'}), 400
    if stage not in LeadService.STAGES:
        return jsonify({'error': f'Invalid stage. Must be one of: {LeadService.STAGES}'}), 400
    success = LeadService.update_stage(lead_id, stage)
    if success:
        return jsonify({'success': True})
    return jsonify({'error': 'Lead not found'}), 404


@leads_bp.route('/<lead_id>/convert', methods=['POST'])
def convert_lead(lead_id):
    lead = LeadService.convert_to_customer(lead_id)
    if lead:
        return jsonify({'success': True, 'lead': lead})
    return jsonify({'error': 'Lead not found'}), 404


@leads_bp.route('/<lead_id>', methods=['DELETE'])
def delete_lead(lead_id):
    LeadService.delete(lead_id)
    return jsonify({'success': True})


@leads_bp.route('/stages', methods=['GET'])
def get_stages():
    return jsonify(LeadService.STAGES)
