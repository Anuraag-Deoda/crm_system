from datetime import datetime
from ..data.excel_handler import ExcelHandler, LEAD_COLUMNS
from ..config import Config


class LeadService:
    STAGES = [
        'new',
        'contacted',
        'qualified',
        'appointment_set',
        'visited',
        'negotiation',
        'converted',
        'lost'
    ]

    SOURCES = ['call', 'walk_in', 'website', 'referral', 'campaign']

    @staticmethod
    def get_all():
        df = ExcelHandler.read_excel(Config.LEADS_FILE, LEAD_COLUMNS)
        return df.to_dict('records')

    @staticmethod
    def get_by_id(lead_id):
        return ExcelHandler.get_by_id(
            Config.LEADS_FILE, 'lead_id', lead_id, LEAD_COLUMNS
        )

    @staticmethod
    def get_by_phone(phone):
        df = ExcelHandler.read_excel(Config.LEADS_FILE, LEAD_COLUMNS)
        result = df[df['phone'] == phone]
        if len(result) > 0:
            return result.iloc[0].to_dict()
        return None

    @staticmethod
    def get_by_stage(stage):
        df = ExcelHandler.read_excel(Config.LEADS_FILE, LEAD_COLUMNS)
        result = df[df['stage'] == stage]
        return result.to_dict('records')

    @staticmethod
    def get_active_leads():
        df = ExcelHandler.read_excel(Config.LEADS_FILE, LEAD_COLUMNS)
        result = df[~df['stage'].isin(['converted', 'lost'])]
        return result.to_dict('records')

    @staticmethod
    def create(data):
        lead_id = ExcelHandler.generate_id('LEAD')
        lead = {
            'lead_id': lead_id,
            'name': data.get('name', ''),
            'phone': data.get('phone', ''),
            'email': data.get('email', ''),
            'interested_model': data.get('interested_model', ''),
            'budget': data.get('budget', ''),
            'stage': 'new',
            'source': data.get('source', 'call'),
            'assigned_to': data.get('assigned_to', ''),
            'next_followup': data.get('next_followup', ''),
            'notes': data.get('notes', ''),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        return ExcelHandler.append_row(Config.LEADS_FILE, lead, LEAD_COLUMNS)

    @staticmethod
    def update(lead_id, data):
        data['updated_at'] = datetime.now().isoformat()
        return ExcelHandler.update_row(
            Config.LEADS_FILE, 'lead_id', lead_id, data, LEAD_COLUMNS
        )

    @staticmethod
    def update_stage(lead_id, stage):
        return LeadService.update(lead_id, {'stage': stage})

    @staticmethod
    def delete(lead_id):
        ExcelHandler.delete_row(Config.LEADS_FILE, 'lead_id', lead_id, LEAD_COLUMNS)

    @staticmethod
    def convert_to_customer(lead_id):
        lead = LeadService.get_by_id(lead_id)
        if lead:
            LeadService.update_stage(lead_id, 'converted')
            return lead
        return None

    @staticmethod
    def get_stats():
        df = ExcelHandler.read_excel(Config.LEADS_FILE, LEAD_COLUMNS)
        stats = {'total': len(df)}
        for stage in LeadService.STAGES:
            stats[stage] = len(df[df['stage'] == stage])
        return stats

    @staticmethod
    def get_pipeline():
        df = ExcelHandler.read_excel(Config.LEADS_FILE, LEAD_COLUMNS)
        pipeline = {}
        for stage in LeadService.STAGES:
            pipeline[stage] = df[df['stage'] == stage].to_dict('records')
        return pipeline
