import pandas as pd
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(os.path.join(DATA_DIR, 'transcripts'), exist_ok=True)

vehicles_data = [
    {
        'vehicle_id': 'VEH-NEX-PET',
        'model': 'Nexon',
        'variant': 'Smart',
        'fuel_type': 'Petrol',
        'price_ex_showroom': 815000,
        'price_on_road': 950000,
        'engine': '1.2L Turbocharged Petrol',
        'mileage': '17.4 km/l',
        'features': '5-star safety, Touchscreen, Automatic Climate Control',
        'in_stock': True,
        'current_offer': 'Exchange bonus up to Rs 50,000',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-NEX-PET-TOP',
        'model': 'Nexon',
        'variant': 'Fearless+ S',
        'fuel_type': 'Petrol',
        'price_ex_showroom': 1550000,
        'price_on_road': 1750000,
        'engine': '1.2L Turbocharged Petrol',
        'mileage': '17.4 km/l',
        'features': '5-star safety, Sunroof, Ventilated Seats, 360 Camera',
        'in_stock': True,
        'current_offer': 'Exchange bonus up to Rs 50,000',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-NEX-DIE',
        'model': 'Nexon',
        'variant': 'Smart',
        'fuel_type': 'Diesel',
        'price_ex_showroom': 1000000,
        'price_on_road': 1150000,
        'engine': '1.5L Turbocharged Diesel',
        'mileage': '21.5 km/l',
        'features': '5-star safety, Touchscreen, Automatic Climate Control',
        'in_stock': True,
        'current_offer': 'Exchange bonus up to Rs 50,000',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-NEX-EV-PRI',
        'model': 'Nexon EV',
        'variant': 'Prime',
        'fuel_type': 'Electric',
        'price_ex_showroom': 1449000,
        'price_on_road': 1550000,
        'engine': 'Electric Motor 143PS',
        'mileage': '325 km range',
        'features': 'Fast charging, Connected car tech, Regenerative braking',
        'in_stock': True,
        'current_offer': 'Rs 50,000 exchange bonus',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-NEX-EV-LR',
        'model': 'Nexon EV',
        'variant': 'Fearless Long Range',
        'fuel_type': 'Electric',
        'price_ex_showroom': 1749000,
        'price_on_road': 1850000,
        'engine': 'Electric Motor 143PS',
        'mileage': '465 km range',
        'features': 'Fast charging, Sunroof, Ventilated seats, ADAS',
        'in_stock': True,
        'current_offer': 'Rs 50,000 exchange bonus',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-PUN-PET',
        'model': 'Punch',
        'variant': 'Pure',
        'fuel_type': 'Petrol',
        'price_ex_showroom': 613000,
        'price_on_road': 720000,
        'engine': '1.2L Petrol',
        'mileage': '18.8 km/l',
        'features': '5-star safety, High ground clearance',
        'in_stock': True,
        'current_offer': 'Corporate discount Rs 15,000',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-PUN-TOP',
        'model': 'Punch',
        'variant': 'Creative+ AMT',
        'fuel_type': 'Petrol',
        'price_ex_showroom': 1020000,
        'price_on_road': 1150000,
        'engine': '1.2L Petrol AMT',
        'mileage': '18.2 km/l',
        'features': '5-star safety, Sunroof, Touchscreen, Cruise Control',
        'in_stock': True,
        'current_offer': 'Corporate discount Rs 15,000',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-PUN-EV',
        'model': 'Punch EV',
        'variant': 'Adventure Long Range',
        'fuel_type': 'Electric',
        'price_ex_showroom': 1429000,
        'price_on_road': 1520000,
        'engine': 'Electric Motor 122PS',
        'mileage': '421 km range',
        'features': 'Fast charging, Connected car, Regenerative braking',
        'in_stock': True,
        'current_offer': '',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-HAR-ADV',
        'model': 'Harrier',
        'variant': 'Adventure+',
        'fuel_type': 'Diesel',
        'price_ex_showroom': 1549000,
        'price_on_road': 1750000,
        'engine': '2.0L Kryotec Diesel',
        'mileage': '14.6 km/l',
        'features': 'Panoramic sunroof, 360 camera, JBL audio',
        'in_stock': True,
        'current_offer': 'Exchange bonus Rs 40,000',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-HAR-TOP',
        'model': 'Harrier',
        'variant': 'Fearless+ AT',
        'fuel_type': 'Diesel',
        'price_ex_showroom': 2644000,
        'price_on_road': 2900000,
        'engine': '2.0L Kryotec Diesel Automatic',
        'mileage': '14.6 km/l',
        'features': 'ADAS, Ventilated seats, 360 camera, Level 2 ADAS',
        'in_stock': True,
        'current_offer': 'Exchange bonus Rs 40,000',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-SAF-SMA',
        'model': 'Safari',
        'variant': 'Smart',
        'fuel_type': 'Diesel',
        'price_ex_showroom': 1619000,
        'price_on_road': 1850000,
        'engine': '2.0L Kryotec Diesel',
        'mileage': '14.5 km/l',
        'features': '7-seater, Captain seats, Touchscreen',
        'in_stock': True,
        'current_offer': 'Exchange bonus Rs 45,000',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-SAF-TOP',
        'model': 'Safari',
        'variant': 'Accomplished+ AT',
        'fuel_type': 'Diesel',
        'price_ex_showroom': 2734000,
        'price_on_road': 3000000,
        'engine': '2.0L Kryotec Diesel Automatic',
        'mileage': '14.5 km/l',
        'features': '6/7 seater, ADAS, Panoramic sunroof, Ventilated seats',
        'in_stock': True,
        'current_offer': 'Exchange bonus Rs 45,000',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-TIA-XE',
        'model': 'Tiago',
        'variant': 'XE',
        'fuel_type': 'Petrol',
        'price_ex_showroom': 565000,
        'price_on_road': 680000,
        'engine': '1.2L Petrol',
        'mileage': '19.8 km/l',
        'features': 'Dual airbags, ABS, Music system',
        'in_stock': True,
        'current_offer': 'First time buyer Rs 10,000 off',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-TIA-TOP',
        'model': 'Tiago',
        'variant': 'XZ+ AMT',
        'fuel_type': 'Petrol',
        'price_ex_showroom': 845000,
        'price_on_road': 980000,
        'engine': '1.2L Petrol AMT',
        'mileage': '19.2 km/l',
        'features': 'Touchscreen, Automatic, Apple CarPlay, Android Auto',
        'in_stock': True,
        'current_offer': 'First time buyer Rs 10,000 off',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-TIA-EV',
        'model': 'Tiago EV',
        'variant': 'XZ+ Long Range',
        'fuel_type': 'Electric',
        'price_ex_showroom': 1189000,
        'price_on_road': 1280000,
        'engine': 'Electric Motor 75PS',
        'mileage': '315 km range',
        'features': 'Fast charging, Connected car, Regenerative braking',
        'in_stock': True,
        'current_offer': '',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-ALT-XE',
        'model': 'Altroz',
        'variant': 'XE',
        'fuel_type': 'Petrol',
        'price_ex_showroom': 670000,
        'price_on_road': 780000,
        'engine': '1.2L Petrol',
        'mileage': '19.4 km/l',
        'features': '5-star safety, Premium hatchback',
        'in_stock': True,
        'current_offer': 'Corporate discount Rs 15,000',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-ALT-TOP',
        'model': 'Altroz',
        'variant': 'XZ+ Turbo DCT',
        'fuel_type': 'Petrol',
        'price_ex_showroom': 1095000,
        'price_on_road': 1250000,
        'engine': '1.2L Turbo Petrol DCT',
        'mileage': '18.0 km/l',
        'features': '5-star safety, Sunroof, DCT automatic, Touchscreen',
        'in_stock': True,
        'current_offer': 'Corporate discount Rs 15,000',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-TIG-XE',
        'model': 'Tigor',
        'variant': 'XE',
        'fuel_type': 'Petrol',
        'price_ex_showroom': 630000,
        'price_on_road': 750000,
        'engine': '1.2L Petrol',
        'mileage': '19.0 km/l',
        'features': 'Compact sedan, ABS, Dual airbags',
        'in_stock': True,
        'current_offer': 'First time buyer Rs 10,000 off',
        'image_url': ''
    },
    {
        'vehicle_id': 'VEH-TIG-EV',
        'model': 'Tigor EV',
        'variant': 'XZ+ Long Range',
        'fuel_type': 'Electric',
        'price_ex_showroom': 1375000,
        'price_on_road': 1450000,
        'engine': 'Electric Motor 75PS',
        'mileage': '315 km range',
        'features': 'Fast charging, Connected car, Sedan comfort',
        'in_stock': True,
        'current_offer': '',
        'image_url': ''
    }
]

customers_data = [
    {
        'customer_id': 'CUST-DEMO-001',
        'name': 'Rajesh Kumar',
        'phone': '+91 98765 43210',
        'email': 'rajesh.kumar@email.com',
        'address': 'Koregaon Park, Pune',
        'preferred_language': 'hindi',
        'vehicle_owned': 'Nexon XZ+',
        'vehicle_reg_no': 'MH12AB1234',
        'purchase_date': '2024-03-15',
        'total_calls': 5,
        'last_call_date': '2025-12-20',
        'customer_type': 'owner',
        'notes': 'Regular service customer',
        'created_at': '2024-03-15T10:00:00'
    },
    {
        'customer_id': 'CUST-DEMO-002',
        'name': 'Priya Sharma',
        'phone': '+91 87654 32109',
        'email': 'priya.sharma@email.com',
        'address': 'Baner, Pune',
        'preferred_language': 'english',
        'vehicle_owned': 'Punch Creative',
        'vehicle_reg_no': 'MH12CD5678',
        'purchase_date': '2024-06-20',
        'total_calls': 3,
        'last_call_date': '2025-12-15',
        'customer_type': 'owner',
        'notes': '',
        'created_at': '2024-06-20T14:30:00'
    },
    {
        'customer_id': 'CUST-DEMO-003',
        'name': 'Amit Patel',
        'phone': '+91 76543 21098',
        'email': 'amit.patel@email.com',
        'address': 'Hinjewadi, Pune',
        'preferred_language': 'hindi',
        'vehicle_owned': '',
        'vehicle_reg_no': '',
        'purchase_date': '',
        'total_calls': 2,
        'last_call_date': '2025-12-10',
        'customer_type': 'prospect',
        'notes': 'Interested in Safari',
        'created_at': '2025-12-01T09:00:00'
    }
]

leads_data = [
    {
        'lead_id': 'LEAD-DEMO-001',
        'name': 'Vikram Singh',
        'phone': '+91 95432 10987',
        'email': 'vikram.singh@email.com',
        'interested_model': 'Nexon EV',
        'budget': '15-18 Lakh',
        'stage': 'qualified',
        'source': 'call',
        'assigned_to': 'Sales Team',
        'next_followup': '2026-01-15',
        'notes': 'Looking for EV, has exchange vehicle',
        'created_at': '2025-12-20T11:00:00',
        'updated_at': '2025-12-28T15:00:00'
    },
    {
        'lead_id': 'LEAD-DEMO-002',
        'name': 'Neha Gupta',
        'phone': '+91 94321 09876',
        'email': 'neha.gupta@email.com',
        'interested_model': 'Harrier',
        'budget': '20-25 Lakh',
        'stage': 'appointment_set',
        'source': 'walk_in',
        'assigned_to': 'Sales Team',
        'next_followup': '2026-01-16',
        'notes': 'Test drive scheduled',
        'created_at': '2025-12-22T14:00:00',
        'updated_at': '2025-12-28T16:00:00'
    },
    {
        'lead_id': 'LEAD-DEMO-003',
        'name': 'Rahul Mehta',
        'phone': '+91 93210 98765',
        'email': 'rahul.mehta@email.com',
        'interested_model': 'Punch',
        'budget': '8-10 Lakh',
        'stage': 'new',
        'source': 'call',
        'assigned_to': '',
        'next_followup': '',
        'notes': 'First car buyer',
        'created_at': '2025-12-28T10:00:00',
        'updated_at': '2025-12-28T10:00:00'
    }
]

appointments_data = [
    {
        'appointment_id': 'APT-DEMO-001',
        'customer_id': 'CUST-DEMO-003',
        'customer_name': 'Amit Patel',
        'customer_phone': '+91 76543 21098',
        'type': 'test_drive',
        'vehicle_model': 'Safari',
        'date': '2026-01-15',
        'time_slot': '02:00 PM - 03:00 PM',
        'status': 'scheduled',
        'booked_via': 'ai_call',
        'call_id': '',
        'reminder_sent': False,
        'assigned_to': 'Sales Team',
        'notes': '',
        'created_at': '2025-12-28T10:00:00'
    },
    {
        'appointment_id': 'APT-DEMO-002',
        'customer_id': 'CUST-DEMO-001',
        'customer_name': 'Rajesh Kumar',
        'customer_phone': '+91 98765 43210',
        'type': 'service',
        'vehicle_model': 'Nexon XZ+',
        'date': '2026-01-16',
        'time_slot': '10:00 AM - 11:00 AM',
        'status': 'scheduled',
        'booked_via': 'human_call',
        'call_id': '',
        'reminder_sent': False,
        'assigned_to': 'Service Team',
        'notes': 'Regular service',
        'created_at': '2025-12-27T14:00:00'
    }
]

complaints_data = [
    {
        'complaint_id': 'COMP-DEMO-001',
        'customer_id': 'CUST-DEMO-002',
        'customer_name': 'Priya Sharma',
        'customer_phone': '+91 87654 32109',
        'category': 'service_quality',
        'description': 'Last service was not up to the mark. Car still making noise.',
        'priority': 'medium',
        'status': 'in_progress',
        'resolution': 'Scheduled for re-inspection',
        'created_at': '2025-12-25T11:00:00',
        'resolved_at': ''
    }
]

pd.DataFrame(vehicles_data).to_excel(os.path.join(DATA_DIR, 'vehicles.xlsx'), index=False)
pd.DataFrame(customers_data).to_excel(os.path.join(DATA_DIR, 'customers.xlsx'), index=False)
pd.DataFrame(leads_data).to_excel(os.path.join(DATA_DIR, 'leads.xlsx'), index=False)
pd.DataFrame(appointments_data).to_excel(os.path.join(DATA_DIR, 'appointments.xlsx'), index=False)
pd.DataFrame(complaints_data).to_excel(os.path.join(DATA_DIR, 'complaints.xlsx'), index=False)

pd.DataFrame(columns=[
    'service_id', 'customer_id', 'vehicle_reg_no', 'service_type',
    'service_date', 'next_service_due', 'cost', 'notes', 'created_at'
]).to_excel(os.path.join(DATA_DIR, 'service_history.xlsx'), index=False)

pd.DataFrame(columns=[
    'call_id', 'customer_id', 'customer_name', 'phone', 'direction',
    'type', 'start_time', 'end_time', 'duration_seconds',
    'handled_by', 'takeover_reason', 'outcome', 'transcript_file',
    'sentiment_score', 'ai_confidence', 'notes'
]).to_excel(os.path.join(DATA_DIR, 'call_logs.xlsx'), index=False)

print("Seed data created successfully!")
print(f"Data directory: {DATA_DIR}")
print("Files created:")
print("  - vehicles.xlsx (19 Tata vehicles)")
print("  - customers.xlsx (3 demo customers)")
print("  - leads.xlsx (3 demo leads)")
print("  - appointments.xlsx (2 demo appointments)")
print("  - complaints.xlsx (1 demo complaint)")
print("  - service_history.xlsx (empty)")
print("  - call_logs.xlsx (empty)")
