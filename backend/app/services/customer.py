from datetime import datetime
from ..data.excel_handler import ExcelHandler, CUSTOMER_COLUMNS
from ..config import Config


class CustomerService:
    @staticmethod
    def get_all():
        df = ExcelHandler.read_excel(Config.CUSTOMERS_FILE, CUSTOMER_COLUMNS)
        return df.to_dict('records')

    @staticmethod
    def get_by_id(customer_id):
        return ExcelHandler.get_by_id(
            Config.CUSTOMERS_FILE, 'customer_id', customer_id, CUSTOMER_COLUMNS
        )

    @staticmethod
    def get_by_phone(phone):
        df = ExcelHandler.read_excel(Config.CUSTOMERS_FILE, CUSTOMER_COLUMNS)
        result = df[df['phone'] == phone]
        if len(result) > 0:
            return result.iloc[0].to_dict()
        return None

    @staticmethod
    def create(data):
        customer_id = ExcelHandler.generate_id('CUST')
        customer = {
            'customer_id': customer_id,
            'name': data.get('name', ''),
            'phone': data.get('phone', ''),
            'email': data.get('email', ''),
            'address': data.get('address', ''),
            'preferred_language': data.get('preferred_language', 'hindi'),
            'vehicle_owned': data.get('vehicle_owned', ''),
            'vehicle_reg_no': data.get('vehicle_reg_no', ''),
            'purchase_date': data.get('purchase_date', ''),
            'total_calls': 0,
            'last_call_date': '',
            'customer_type': data.get('customer_type', 'prospect'),
            'notes': data.get('notes', ''),
            'created_at': datetime.now().isoformat()
        }
        return ExcelHandler.append_row(Config.CUSTOMERS_FILE, customer, CUSTOMER_COLUMNS)

    @staticmethod
    def update(customer_id, data):
        return ExcelHandler.update_row(
            Config.CUSTOMERS_FILE, 'customer_id', customer_id, data, CUSTOMER_COLUMNS
        )

    @staticmethod
    def delete(customer_id):
        ExcelHandler.delete_row(Config.CUSTOMERS_FILE, 'customer_id', customer_id, CUSTOMER_COLUMNS)

    @staticmethod
    def increment_call_count(customer_id):
        customer = CustomerService.get_by_id(customer_id)
        if customer:
            CustomerService.update(customer_id, {
                'total_calls': int(customer.get('total_calls', 0)) + 1,
                'last_call_date': datetime.now().isoformat()
            })

    @staticmethod
    def search(query):
        df = ExcelHandler.read_excel(Config.CUSTOMERS_FILE, CUSTOMER_COLUMNS)
        query = query.lower()
        mask = (
            df['name'].str.lower().str.contains(query, na=False) |
            df['phone'].str.contains(query, na=False) |
            df['email'].str.lower().str.contains(query, na=False)
        )
        return df[mask].to_dict('records')
