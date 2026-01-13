from datetime import datetime
from ..data.excel_handler import ExcelHandler, COMPLAINT_COLUMNS
from ..config import Config


class ComplaintService:
    CATEGORIES = [
        'vehicle_defect',
        'service_quality',
        'delivery_delay',
        'billing_issue',
        'staff_behavior',
        'spare_parts',
        'warranty_claims',
        'other'
    ]

    PRIORITIES = ['high', 'medium', 'low']
    STATUSES = ['open', 'in_progress', 'resolved', 'closed']

    @staticmethod
    def get_all():
        df = ExcelHandler.read_excel(Config.COMPLAINTS_FILE, COMPLAINT_COLUMNS)
        return df.to_dict('records')

    @staticmethod
    def get_by_id(complaint_id):
        return ExcelHandler.get_by_id(
            Config.COMPLAINTS_FILE, 'complaint_id', complaint_id, COMPLAINT_COLUMNS
        )

    @staticmethod
    def get_by_customer(customer_id):
        df = ExcelHandler.read_excel(Config.COMPLAINTS_FILE, COMPLAINT_COLUMNS)
        result = df[df['customer_id'] == customer_id]
        return result.to_dict('records')

    @staticmethod
    def get_by_status(status):
        df = ExcelHandler.read_excel(Config.COMPLAINTS_FILE, COMPLAINT_COLUMNS)
        result = df[df['status'] == status]
        return result.to_dict('records')

    @staticmethod
    def get_open_complaints():
        df = ExcelHandler.read_excel(Config.COMPLAINTS_FILE, COMPLAINT_COLUMNS)
        result = df[df['status'].isin(['open', 'in_progress'])]
        return result.to_dict('records')

    @staticmethod
    def create(data):
        complaint_id = ExcelHandler.generate_id('COMP')

        category = data.get('category', 'other')
        if category in ['vehicle_defect', 'warranty_claims', 'delivery_delay']:
            priority = 'high'
        elif category in ['service_quality', 'billing_issue']:
            priority = 'medium'
        else:
            priority = data.get('priority', 'low')

        complaint = {
            'complaint_id': complaint_id,
            'customer_id': data.get('customer_id', ''),
            'customer_name': data.get('customer_name', ''),
            'customer_phone': data.get('customer_phone', ''),
            'category': category,
            'description': data.get('description', ''),
            'priority': priority,
            'status': 'open',
            'resolution': '',
            'created_at': datetime.now().isoformat(),
            'resolved_at': ''
        }
        return ExcelHandler.append_row(Config.COMPLAINTS_FILE, complaint, COMPLAINT_COLUMNS)

    @staticmethod
    def update(complaint_id, data):
        return ExcelHandler.update_row(
            Config.COMPLAINTS_FILE, 'complaint_id', complaint_id, data, COMPLAINT_COLUMNS
        )

    @staticmethod
    def update_status(complaint_id, status, resolution=''):
        update_data = {'status': status}
        if status in ['resolved', 'closed']:
            update_data['resolved_at'] = datetime.now().isoformat()
        if resolution:
            update_data['resolution'] = resolution
        return ComplaintService.update(complaint_id, update_data)

    @staticmethod
    def delete(complaint_id):
        ExcelHandler.delete_row(Config.COMPLAINTS_FILE, 'complaint_id', complaint_id, COMPLAINT_COLUMNS)

    @staticmethod
    def get_stats():
        df = ExcelHandler.read_excel(Config.COMPLAINTS_FILE, COMPLAINT_COLUMNS)
        return {
            'total': len(df),
            'open': len(df[df['status'] == 'open']),
            'in_progress': len(df[df['status'] == 'in_progress']),
            'resolved': len(df[df['status'] == 'resolved']),
            'closed': len(df[df['status'] == 'closed']),
            'high_priority': len(df[df['priority'] == 'high'])
        }
