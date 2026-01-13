import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Car,
  Calendar,
  X
} from 'lucide-react';
import { customersAPI } from '../lib/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (searchQuery = '') => {
    setLoading(true);
    try {
      const response = await customersAPI.getAll(searchQuery);
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleDelete = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customersAPI.delete(customerId);
      fetchCustomers();
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Vehicle</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((customer) => (
                    <tr
                      key={customer.customer_id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedCustomer?.customer_id === customer.customer_id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.customer_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{customer.phone}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {customer.vehicle_owned ? (
                          <>
                            <div className="text-sm">{customer.vehicle_owned}</div>
                            <div className="text-sm text-gray-500">{customer.vehicle_reg_no}</div>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          customer.customer_type === 'owner' ? 'bg-green-100 text-green-700' :
                          customer.customer_type === 'prospect' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {customer.customer_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {customers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No customers found
                </div>
              )}
            </div>
          </div>

          {/* Customer Details */}
          <div>
            {selectedCustomer ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-400" />
                    <span>{selectedCustomer.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-400" />
                    <span>{selectedCustomer.address || '-'}</span>
                  </div>

                  {selectedCustomer.vehicle_owned && (
                    <>
                      <hr />
                      <div className="flex items-center gap-3">
                        <Car size={18} className="text-gray-400" />
                        <div>
                          <div>{selectedCustomer.vehicle_owned}</div>
                          <div className="text-sm text-gray-500">{selectedCustomer.vehicle_reg_no}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-gray-400" />
                        <span>Purchased: {selectedCustomer.purchase_date || '-'}</span>
                      </div>
                    </>
                  )}

                  <hr />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Calls</span>
                      <div className="font-semibold">{selectedCustomer.total_calls || 0}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Call</span>
                      <div className="font-semibold">
                        {selectedCustomer.last_call_date
                          ? new Date(selectedCustomer.last_call_date).toLocaleDateString()
                          : '-'}
                      </div>
                    </div>
                  </div>

                  {selectedCustomer.notes && (
                    <>
                      <hr />
                      <div>
                        <span className="text-sm text-gray-500">Notes</span>
                        <p className="mt-1">{selectedCustomer.notes}</p>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedCustomer.customer_id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                Select a customer to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Customer Modal - Simplified */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Customer</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                try {
                  await customersAPI.create({
                    name: formData.get('name'),
                    phone: formData.get('phone'),
                    email: formData.get('email'),
                    customer_type: 'prospect'
                  });
                  setShowAddModal(false);
                  fetchCustomers();
                } catch (error) {
                  console.error('Failed to create customer:', error);
                }
              }}
              className="space-y-4"
            >
              <input
                name="name"
                placeholder="Name"
                required
                className="w-full border rounded-lg px-4 py-2"
              />
              <input
                name="phone"
                placeholder="Phone"
                required
                className="w-full border rounded-lg px-4 py-2"
              />
              <input
                name="email"
                placeholder="Email"
                type="email"
                className="w-full border rounded-lg px-4 py-2"
              />
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
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
