import pandas as pd
import os
from datetime import datetime
from ..config import Config


class ExcelHandler:
    @staticmethod
    def ensure_file_exists(filepath, columns):
        if not os.path.exists(filepath):
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            df = pd.DataFrame(columns=columns)
            df.to_excel(filepath, index=False)
        return filepath

    @staticmethod
    def read_excel(filepath, columns=None):
        if not os.path.exists(filepath):
            if columns:
                ExcelHandler.ensure_file_exists(filepath, columns)
            return pd.DataFrame(columns=columns) if columns else pd.DataFrame()
        df = pd.read_excel(filepath)
        return df

    @staticmethod
    def write_excel(filepath, df):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        df.to_excel(filepath, index=False)

    @staticmethod
    def append_row(filepath, row_data, columns):
        df = ExcelHandler.read_excel(filepath, columns)
        new_row = pd.DataFrame([row_data])
        df = pd.concat([df, new_row], ignore_index=True)
        ExcelHandler.write_excel(filepath, df)
        return row_data

    @staticmethod
    def update_row(filepath, id_column, id_value, update_data, columns):
        df = ExcelHandler.read_excel(filepath, columns)
        mask = df[id_column] == id_value
        if mask.any():
            for key, value in update_data.items():
                df.loc[mask, key] = value
            ExcelHandler.write_excel(filepath, df)
            return True
        return False

    @staticmethod
    def delete_row(filepath, id_column, id_value, columns):
        df = ExcelHandler.read_excel(filepath, columns)
        df = df[df[id_column] != id_value]
        ExcelHandler.write_excel(filepath, df)

    @staticmethod
    def get_by_id(filepath, id_column, id_value, columns):
        df = ExcelHandler.read_excel(filepath, columns)
        result = df[df[id_column] == id_value]
        if len(result) > 0:
            return result.iloc[0].to_dict()
        return None

    @staticmethod
    def generate_id(prefix):
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        return f"{prefix}-{timestamp}"


CUSTOMER_COLUMNS = [
    'customer_id', 'name', 'phone', 'email', 'address',
    'preferred_language', 'vehicle_owned', 'vehicle_reg_no',
    'purchase_date', 'total_calls', 'last_call_date',
    'customer_type', 'notes', 'created_at'
]

APPOINTMENT_COLUMNS = [
    'appointment_id', 'customer_id', 'customer_name', 'customer_phone',
    'type', 'vehicle_model', 'date', 'time_slot', 'status',
    'booked_via', 'call_id', 'reminder_sent', 'assigned_to', 'notes', 'created_at'
]

COMPLAINT_COLUMNS = [
    'complaint_id', 'customer_id', 'customer_name', 'customer_phone',
    'category', 'description', 'priority', 'status',
    'resolution', 'created_at', 'resolved_at'
]

LEAD_COLUMNS = [
    'lead_id', 'name', 'phone', 'email', 'interested_model',
    'budget', 'stage', 'source', 'assigned_to',
    'next_followup', 'notes', 'created_at', 'updated_at'
]

VEHICLE_COLUMNS = [
    'vehicle_id', 'model', 'variant', 'fuel_type', 'price_ex_showroom',
    'price_on_road', 'engine', 'mileage', 'features',
    'in_stock', 'current_offer', 'image_url'
]

SERVICE_HISTORY_COLUMNS = [
    'service_id', 'customer_id', 'vehicle_reg_no', 'service_type',
    'service_date', 'next_service_due', 'cost', 'notes', 'created_at'
]

CALL_LOG_COLUMNS = [
    'call_id', 'customer_id', 'customer_name', 'phone', 'direction',
    'type', 'start_time', 'end_time', 'duration_seconds',
    'handled_by', 'takeover_reason', 'outcome', 'transcript_file',
    'sentiment_score', 'ai_confidence', 'notes'
]
