from datetime import datetime, timedelta
from ..data.excel_handler import ExcelHandler, APPOINTMENT_COLUMNS
from ..config import Config


class AppointmentService:
    TIME_SLOTS = [
        "09:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "12:00 PM - 01:00 PM",
        "02:00 PM - 03:00 PM",
        "03:00 PM - 04:00 PM",
        "04:00 PM - 05:00 PM",
        "05:00 PM - 06:00 PM"
    ]

    @staticmethod
    def get_all():
        df = ExcelHandler.read_excel(Config.APPOINTMENTS_FILE, APPOINTMENT_COLUMNS)
        return df.to_dict('records')

    @staticmethod
    def get_by_id(appointment_id):
        return ExcelHandler.get_by_id(
            Config.APPOINTMENTS_FILE, 'appointment_id', appointment_id, APPOINTMENT_COLUMNS
        )

    @staticmethod
    def get_by_date(date):
        df = ExcelHandler.read_excel(Config.APPOINTMENTS_FILE, APPOINTMENT_COLUMNS)
        result = df[df['date'] == date]
        return result.to_dict('records')

    @staticmethod
    def get_by_customer(customer_id):
        df = ExcelHandler.read_excel(Config.APPOINTMENTS_FILE, APPOINTMENT_COLUMNS)
        result = df[df['customer_id'] == customer_id]
        return result.to_dict('records')

    @staticmethod
    def get_available_slots(date, appointment_type='test_drive'):
        booked = AppointmentService.get_by_date(date)
        booked_slots = [apt['time_slot'] for apt in booked if apt['status'] != 'cancelled']
        available = [slot for slot in AppointmentService.TIME_SLOTS if slot not in booked_slots]
        return available

    @staticmethod
    def create(data):
        appointment_id = ExcelHandler.generate_id('APT')
        appointment = {
            'appointment_id': appointment_id,
            'customer_id': data.get('customer_id', ''),
            'customer_name': data.get('customer_name', ''),
            'customer_phone': data.get('customer_phone', ''),
            'type': data.get('type', 'test_drive'),
            'vehicle_model': data.get('vehicle_model', ''),
            'date': data.get('date', ''),
            'time_slot': data.get('time_slot', ''),
            'status': 'scheduled',
            'booked_via': data.get('booked_via', 'ai_call'),
            'call_id': data.get('call_id', ''),
            'reminder_sent': False,
            'assigned_to': data.get('assigned_to', ''),
            'notes': data.get('notes', ''),
            'created_at': datetime.now().isoformat()
        }
        return ExcelHandler.append_row(Config.APPOINTMENTS_FILE, appointment, APPOINTMENT_COLUMNS)

    @staticmethod
    def update(appointment_id, data):
        return ExcelHandler.update_row(
            Config.APPOINTMENTS_FILE, 'appointment_id', appointment_id, data, APPOINTMENT_COLUMNS
        )

    @staticmethod
    def update_status(appointment_id, status):
        return AppointmentService.update(appointment_id, {'status': status})

    @staticmethod
    def delete(appointment_id):
        ExcelHandler.delete_row(Config.APPOINTMENTS_FILE, 'appointment_id', appointment_id, APPOINTMENT_COLUMNS)

    @staticmethod
    def get_upcoming(days=7):
        df = ExcelHandler.read_excel(Config.APPOINTMENTS_FILE, APPOINTMENT_COLUMNS)
        today = datetime.now().date()
        end_date = today + timedelta(days=days)

        df['date_parsed'] = pd.to_datetime(df['date'], errors='coerce')
        mask = (
            (df['date_parsed'].dt.date >= today) &
            (df['date_parsed'].dt.date <= end_date) &
            (df['status'].isin(['scheduled', 'confirmed']))
        )
        return df[mask].to_dict('records')

    @staticmethod
    def get_today():
        today = datetime.now().strftime('%Y-%m-%d')
        return AppointmentService.get_by_date(today)


import pandas as pd
