from flask import Blueprint, request, jsonify
from ...services.customer import CustomerService

customers_bp = Blueprint('customers', __name__)


@customers_bp.route('/', methods=['GET'])
def get_customers():
    search = request.args.get('search', '')
    if search:
        customers = CustomerService.search(search)
    else:
        customers = CustomerService.get_all()
    return jsonify(customers)


@customers_bp.route('/<customer_id>', methods=['GET'])
def get_customer(customer_id):
    customer = CustomerService.get_by_id(customer_id)
    if customer:
        return jsonify(customer)
    return jsonify({'error': 'Customer not found'}), 404


@customers_bp.route('/phone/<phone>', methods=['GET'])
def get_customer_by_phone(phone):
    customer = CustomerService.get_by_phone(phone)
    if customer:
        return jsonify(customer)
    return jsonify({'error': 'Customer not found'}), 404


@customers_bp.route('/', methods=['POST'])
def create_customer():
    data = request.json
    customer = CustomerService.create(data)
    return jsonify(customer), 201


@customers_bp.route('/<customer_id>', methods=['PUT'])
def update_customer(customer_id):
    data = request.json
    success = CustomerService.update(customer_id, data)
    if success:
        return jsonify({'success': True})
    return jsonify({'error': 'Customer not found'}), 404


@customers_bp.route('/<customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    CustomerService.delete(customer_id)
    return jsonify({'success': True})
