from ..data.excel_handler import ExcelHandler, VEHICLE_COLUMNS
from ..config import Config


class VehicleService:
    @staticmethod
    def get_all():
        df = ExcelHandler.read_excel(Config.VEHICLES_FILE, VEHICLE_COLUMNS)
        return df.to_dict('records')

    @staticmethod
    def get_by_id(vehicle_id):
        return ExcelHandler.get_by_id(
            Config.VEHICLES_FILE, 'vehicle_id', vehicle_id, VEHICLE_COLUMNS
        )

    @staticmethod
    def get_by_model(model):
        df = ExcelHandler.read_excel(Config.VEHICLES_FILE, VEHICLE_COLUMNS)
        result = df[df['model'].str.lower() == model.lower()]
        return result.to_dict('records')

    @staticmethod
    def search(query):
        df = ExcelHandler.read_excel(Config.VEHICLES_FILE, VEHICLE_COLUMNS)
        query = query.lower()
        mask = (
            df['model'].str.lower().str.contains(query, na=False) |
            df['variant'].str.lower().str.contains(query, na=False) |
            df['fuel_type'].str.lower().str.contains(query, na=False)
        )
        return df[mask].to_dict('records')

    @staticmethod
    def get_by_fuel_type(fuel_type):
        df = ExcelHandler.read_excel(Config.VEHICLES_FILE, VEHICLE_COLUMNS)
        result = df[df['fuel_type'].str.lower() == fuel_type.lower()]
        return result.to_dict('records')

    @staticmethod
    def get_in_stock():
        df = ExcelHandler.read_excel(Config.VEHICLES_FILE, VEHICLE_COLUMNS)
        result = df[df['in_stock'] == True]
        return result.to_dict('records')

    @staticmethod
    def get_current_offers():
        df = ExcelHandler.read_excel(Config.VEHICLES_FILE, VEHICLE_COLUMNS)
        result = df[df['current_offer'].notna() & (df['current_offer'] != '')]
        return result.to_dict('records')

    @staticmethod
    def create(data):
        vehicle_id = f"VEH-{data.get('model', 'X').upper()[:3]}-{data.get('variant', 'X').upper()[:3]}"
        vehicle = {
            'vehicle_id': vehicle_id,
            'model': data.get('model', ''),
            'variant': data.get('variant', ''),
            'fuel_type': data.get('fuel_type', ''),
            'price_ex_showroom': data.get('price_ex_showroom', 0),
            'price_on_road': data.get('price_on_road', 0),
            'engine': data.get('engine', ''),
            'mileage': data.get('mileage', ''),
            'features': data.get('features', ''),
            'in_stock': data.get('in_stock', True),
            'current_offer': data.get('current_offer', ''),
            'image_url': data.get('image_url', '')
        }
        return ExcelHandler.append_row(Config.VEHICLES_FILE, vehicle, VEHICLE_COLUMNS)

    @staticmethod
    def update(vehicle_id, data):
        return ExcelHandler.update_row(
            Config.VEHICLES_FILE, 'vehicle_id', vehicle_id, data, VEHICLE_COLUMNS
        )

    @staticmethod
    def delete(vehicle_id):
        ExcelHandler.delete_row(Config.VEHICLES_FILE, 'vehicle_id', vehicle_id, VEHICLE_COLUMNS)

    @staticmethod
    def get_price_range():
        df = ExcelHandler.read_excel(Config.VEHICLES_FILE, VEHICLE_COLUMNS)
        if len(df) == 0:
            return {'min': 0, 'max': 0}
        return {
            'min': df['price_ex_showroom'].min(),
            'max': df['price_ex_showroom'].max()
        }

    @staticmethod
    def get_models_list():
        df = ExcelHandler.read_excel(Config.VEHICLES_FILE, VEHICLE_COLUMNS)
        return df['model'].unique().tolist()
