from flask import Blueprint, request, jsonify
from ...services.vehicle import VehicleService

vehicles_bp = Blueprint('vehicles', __name__)


@vehicles_bp.route('/', methods=['GET'])
def get_vehicles():
    search = request.args.get('search')
    fuel_type = request.args.get('fuel_type')
    in_stock = request.args.get('in_stock')

    if search:
        vehicles = VehicleService.search(search)
    elif fuel_type:
        vehicles = VehicleService.get_by_fuel_type(fuel_type)
    elif in_stock and in_stock.lower() == 'true':
        vehicles = VehicleService.get_in_stock()
    else:
        vehicles = VehicleService.get_all()
    return jsonify(vehicles)


@vehicles_bp.route('/<vehicle_id>', methods=['GET'])
def get_vehicle(vehicle_id):
    vehicle = VehicleService.get_by_id(vehicle_id)
    if vehicle:
        return jsonify(vehicle)
    return jsonify({'error': 'Vehicle not found'}), 404


@vehicles_bp.route('/model/<model_name>', methods=['GET'])
def get_by_model(model_name):
    vehicles = VehicleService.get_by_model(model_name)
    return jsonify(vehicles)


@vehicles_bp.route('/offers', methods=['GET'])
def get_offers():
    offers = VehicleService.get_current_offers()
    return jsonify(offers)


@vehicles_bp.route('/models', methods=['GET'])
def get_models_list():
    models = VehicleService.get_models_list()
    return jsonify(models)


@vehicles_bp.route('/price-range', methods=['GET'])
def get_price_range():
    price_range = VehicleService.get_price_range()
    return jsonify(price_range)


@vehicles_bp.route('/', methods=['POST'])
def create_vehicle():
    data = request.json
    vehicle = VehicleService.create(data)
    return jsonify(vehicle), 201


@vehicles_bp.route('/<vehicle_id>', methods=['PUT'])
def update_vehicle(vehicle_id):
    data = request.json
    success = VehicleService.update(vehicle_id, data)
    if success:
        return jsonify({'success': True})
    return jsonify({'error': 'Vehicle not found'}), 404


@vehicles_bp.route('/<vehicle_id>', methods=['DELETE'])
def delete_vehicle(vehicle_id):
    VehicleService.delete(vehicle_id)
    return jsonify({'success': True})
