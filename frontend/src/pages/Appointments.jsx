import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Car,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { appointmentsAPI } from '../lib/api';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, status);
      fetchAppointments();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={16} />;
      case 'no_show':
        return <AlertCircle className="text-yellow-500" size={16} />;
      default:
        return <Clock className="text-blue-500" size={16} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'test_drive':
        return 'bg-blue-100 text-blue-700';
      case 'service':
        return 'bg-purple-100 text-purple-700';
      case 'consultation':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          New Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={18} className="text-gray-400" />
        {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-lg text-sm capitalize ${
              filter === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.appointment_id}
              className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(apt.status)}
                  <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(apt.type)}`}>
                    {apt.type?.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{apt.appointment_id.slice(-8)}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium">{apt.customer_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{apt.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span>{apt.time_slot}</span>
                </div>
                {apt.vehicle_model && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Car size={16} className="text-gray-400" />
                    <span>{apt.vehicle_model}</span>
                  </div>
                )}
              </div>

              {apt.status === 'scheduled' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(apt.appointment_id, 'confirmed')}
                    className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 rounded text-sm hover:bg-green-100"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateStatus(apt.appointment_id, 'cancelled')}
                    className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {apt.status === 'confirmed' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(apt.appointment_id, 'completed')}
                    className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 rounded text-sm hover:bg-green-100"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => updateStatus(apt.appointment_id, 'no_show')}
                    className="flex-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded text-sm hover:bg-yellow-100"
                  >
                    No Show
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredAppointments.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No appointments found
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">New Appointment</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                try {
                  await appointmentsAPI.create({
                    customer_name: formData.get('customer_name'),
                    customer_phone: formData.get('customer_phone'),
                    type: formData.get('type'),
                    vehicle_model: formData.get('vehicle_model'),
                    date: formData.get('date'),
                    time_slot: formData.get('time_slot'),
                    booked_via: 'manual'
                  });
                  setShowAddModal(false);
                  fetchAppointments();
                } catch (error) {
                  console.error('Failed to create appointment:', error);
                }
              }}
              className="space-y-4"
            >
              <input
                name="customer_name"
                placeholder="Customer Name"
                required
                className="w-full border rounded-lg px-4 py-2"
              />
              <input
                name="customer_phone"
                placeholder="Phone"
                required
                className="w-full border rounded-lg px-4 py-2"
              />
              <select
                name="type"
                className="w-full border rounded-lg px-4 py-2"
                required
              >
                <option value="test_drive">Test Drive</option>
                <option value="service">Service</option>
                <option value="consultation">Consultation</option>
              </select>
              <input
                name="vehicle_model"
                placeholder="Vehicle Model"
                className="w-full border rounded-lg px-4 py-2"
              />
              <input
                name="date"
                type="date"
                required
                className="w-full border rounded-lg px-4 py-2"
              />
              <select
                name="time_slot"
                className="w-full border rounded-lg px-4 py-2"
                required
              >
                <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;
