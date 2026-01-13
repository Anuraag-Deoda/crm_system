import { useState, useEffect } from 'react';
import {
  AlertCircle,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUp,
  User,
  Phone
} from 'lucide-react';
import { complaintsAPI } from '../lib/api';

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintsAPI.getAll();
      setComplaints(response.data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (complaintId, status) => {
    try {
      await complaintsAPI.updateStatus(complaintId, status, resolution);
      fetchComplaints();
      setResolution('');
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const filteredComplaints = complaints.filter(comp => {
    if (filter === 'all') return true;
    if (filter === 'high') return comp.priority === 'high';
    return comp.status === filter;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Complaints</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          New Complaint
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={18} className="text-gray-400" />
        {['all', 'open', 'in_progress', 'resolved', 'high'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-lg text-sm capitalize ${
              filter === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'high' ? 'High Priority' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Complaints List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint.complaint_id}
                onClick={() => setSelectedComplaint(complaint)}
                className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer border-l-4 ${
                  complaint.priority === 'high' ? 'border-red-500' :
                  complaint.priority === 'medium' ? 'border-yellow-500' : 'border-gray-300'
                } ${selectedComplaint?.complaint_id === complaint.complaint_id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className={
                      complaint.priority === 'high' ? 'text-red-500' :
                      complaint.priority === 'medium' ? 'text-yellow-500' : 'text-gray-400'
                    } />
                    <span className="font-medium">{complaint.complaint_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {complaint.customer_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={14} />
                    {complaint.customer_phone}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium capitalize">{complaint.category?.replace('_', ' ')}: </span>
                  {complaint.description?.slice(0, 100)}
                  {complaint.description?.length > 100 && '...'}
                </p>

                <div className="text-xs text-gray-400">
                  Created: {new Date(complaint.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}

            {filteredComplaints.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No complaints found
              </div>
            )}
          </div>

          {/* Selected Complaint Details */}
          <div>
            {selectedComplaint ? (
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <h3 className="font-semibold text-lg mb-4">Complaint Details</h3>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">ID</span>
                    <p className="font-mono">{selectedComplaint.complaint_id}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Customer</span>
                    <p>{selectedComplaint.customer_name}</p>
                    <p className="text-sm text-gray-500">{selectedComplaint.customer_phone}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Category</span>
                    <p className="capitalize">{selectedComplaint.category?.replace('_', ' ')}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Description</span>
                    <p className="text-sm">{selectedComplaint.description}</p>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Priority</span>
                      <p className={`inline-block px-2 py-0.5 rounded text-xs ${getPriorityColor(selectedComplaint.priority)}`}>
                        {selectedComplaint.priority}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status</span>
                      <p className={`inline-block px-2 py-0.5 rounded text-xs ${getStatusColor(selectedComplaint.status)}`}>
                        {selectedComplaint.status}
                      </p>
                    </div>
                  </div>

                  {selectedComplaint.resolution && (
                    <div>
                      <span className="text-sm text-gray-500">Resolution</span>
                      <p className="text-sm">{selectedComplaint.resolution}</p>
                    </div>
                  )}

                  {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'closed' && (
                    <>
                      <hr />
                      <div>
                        <label className="text-sm text-gray-500">Resolution Notes</label>
                        <textarea
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          placeholder="Enter resolution details..."
                          className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        {selectedComplaint.status === 'open' && (
                          <button
                            onClick={() => updateStatus(selectedComplaint.complaint_id, 'in_progress')}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
                          >
                            Start Working
                          </button>
                        )}
                        {selectedComplaint.status === 'in_progress' && (
                          <button
                            onClick={() => updateStatus(selectedComplaint.complaint_id, 'resolved')}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                Select a complaint to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">New Complaint</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                try {
                  await complaintsAPI.create({
                    customer_name: formData.get('customer_name'),
                    customer_phone: formData.get('customer_phone'),
                    category: formData.get('category'),
                    description: formData.get('description')
                  });
                  setShowAddModal(false);
                  fetchComplaints();
                } catch (error) {
                  console.error('Failed to create complaint:', error);
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
                name="category"
                className="w-full border rounded-lg px-4 py-2"
                required
              >
                <option value="">Select Category</option>
                <option value="vehicle_defect">Vehicle Defect</option>
                <option value="service_quality">Service Quality</option>
                <option value="delivery_delay">Delivery Delay</option>
                <option value="billing_issue">Billing Issue</option>
                <option value="staff_behavior">Staff Behavior</option>
                <option value="spare_parts">Spare Parts</option>
                <option value="warranty_claims">Warranty Claims</option>
                <option value="other">Other</option>
              </select>
              <textarea
                name="description"
                placeholder="Describe the complaint..."
                required
                className="w-full border rounded-lg px-4 py-2"
                rows={4}
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
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Complaints;
