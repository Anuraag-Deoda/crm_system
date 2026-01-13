import { useState, useEffect } from 'react';
import {
  Car,
  Search,
  Filter,
  Fuel,
  Gauge,
  IndianRupee,
  Tag,
  Battery,
  CheckCircle
} from 'lucide-react';
import { vehiclesAPI } from '../lib/api';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fuelFilter, setFuelFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehiclesAPI.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = search === '' ||
      vehicle.model?.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.variant?.toLowerCase().includes(search.toLowerCase());

    const matchesFuel = fuelFilter === 'all' ||
      vehicle.fuel_type?.toLowerCase() === fuelFilter.toLowerCase();

    return matchesSearch && matchesFuel;
  });

  const formatPrice = (price) => {
    if (!price) return '-';
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getFuelIcon = (fuelType) => {
    if (fuelType?.toLowerCase() === 'electric') {
      return <Battery className="text-green-500" size={18} />;
    }
    return <Fuel className="text-gray-500" size={18} />;
  };

  const uniqueModels = [...new Set(vehicles.map(v => v.model))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Vehicle Catalog</h1>
        <span className="text-gray-500">{filteredVehicles.length} vehicles</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          {['all', 'petrol', 'diesel', 'electric'].map((fuel) => (
            <button
              key={fuel}
              onClick={() => setFuelFilter(fuel)}
              className={`px-3 py-1 rounded-lg text-sm capitalize ${
                fuelFilter === fuel
                  ? fuel === 'electric' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {fuel}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle List */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.vehicle_id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{vehicle.model}</h3>
                      <p className="text-sm text-gray-500">{vehicle.variant}</p>
                    </div>
                    {getFuelIcon(vehicle.fuel_type)}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Ex-Showroom</span>
                      <span className="font-semibold text-blue-600">
                        {formatPrice(vehicle.price_ex_showroom)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Mileage</span>
                      <span>{vehicle.mileage || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs ${
                      vehicle.fuel_type?.toLowerCase() === 'electric'
                        ? 'bg-green-100 text-green-700'
                        : vehicle.fuel_type?.toLowerCase() === 'diesel'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {vehicle.fuel_type}
                    </span>
                    {vehicle.in_stock && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle size={14} />
                        In Stock
                      </span>
                    )}
                  </div>

                  {vehicle.current_offer && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded-lg flex items-center gap-2">
                      <Tag size={14} className="text-yellow-600" />
                      <span className="text-xs text-yellow-700">{vehicle.current_offer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredVehicles.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No vehicles found
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div>
            {selectedVehicle ? (
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-xl">{selectedVehicle.model}</h3>
                  <p className="text-gray-500">{selectedVehicle.variant}</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-sm text-gray-500">Ex-Showroom</span>
                      <p className="font-semibold text-blue-600">
                        {formatPrice(selectedVehicle.price_ex_showroom)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-sm text-gray-500">On-Road</span>
                      <p className="font-semibold">
                        {formatPrice(selectedVehicle.price_on_road)}
                      </p>
                    </div>
                  </div>

                  <hr />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {getFuelIcon(selectedVehicle.fuel_type)}
                      <div>
                        <span className="text-sm text-gray-500">Fuel Type</span>
                        <p className="font-medium">{selectedVehicle.fuel_type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Car size={18} className="text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-500">Engine</span>
                        <p className="font-medium">{selectedVehicle.engine || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Gauge size={18} className="text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-500">Mileage</span>
                        <p className="font-medium">{selectedVehicle.mileage || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <hr />

                  <div>
                    <span className="text-sm text-gray-500">Features</span>
                    <p className="mt-1 text-sm">{selectedVehicle.features || '-'}</p>
                  </div>

                  {selectedVehicle.current_offer && (
                    <>
                      <hr />
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm text-yellow-700 font-medium">Current Offer</span>
                        <p className="text-sm text-yellow-600 mt-1">
                          {selectedVehicle.current_offer}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className={`px-3 py-1 rounded ${
                      selectedVehicle.in_stock
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedVehicle.in_stock ? 'In Stock' : 'Booking Required'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                <Car size={48} className="mx-auto mb-4 text-gray-300" />
                Select a vehicle to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Model Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">Model Summary</h2>
        <div className="flex flex-wrap gap-2">
          {uniqueModels.map((model) => {
            const count = vehicles.filter(v => v.model === model).length;
            return (
              <button
                key={model}
                onClick={() => setSearch(model)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                {model} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Vehicles;
