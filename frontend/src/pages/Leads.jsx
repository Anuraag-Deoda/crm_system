import { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Phone,
  Mail,
  Car,
  DollarSign,
  ChevronRight,
  User
} from 'lucide-react';
import { leadsAPI } from '../lib/api';

const STAGE_COLORS = {
  new: 'bg-gray-100 text-gray-700 border-gray-300',
  contacted: 'bg-blue-100 text-blue-700 border-blue-300',
  qualified: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  appointment_set: 'bg-purple-100 text-purple-700 border-purple-300',
  visited: 'bg-pink-100 text-pink-700 border-pink-300',
  negotiation: 'bg-orange-100 text-orange-700 border-orange-300',
  converted: 'bg-green-100 text-green-700 border-green-300',
  lost: 'bg-red-100 text-red-700 border-red-300'
};

const STAGE_ORDER = ['new', 'contacted', 'qualified', 'appointment_set', 'visited', 'negotiation', 'converted', 'lost'];

function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('pipeline');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await leadsAPI.getAll();
      setLeads(response.data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (leadId, stage) => {
    try {
      await leadsAPI.updateStage(leadId, stage);
      fetchLeads();
    } catch (error) {
      console.error('Failed to update stage:', error);
    }
  };

  const getLeadsByStage = (stage) => {
    return leads.filter(lead => lead.stage === stage);
  };

  const getNextStage = (currentStage) => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex < STAGE_ORDER.length - 2) {
      return STAGE_ORDER[currentIndex + 1];
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('pipeline')}
              className={`px-4 py-1 rounded ${view === 'pipeline' ? 'bg-white shadow' : ''}`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-1 rounded ${view === 'list' ? 'bg-white shadow' : ''}`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={18} />
            Add Lead
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : view === 'pipeline' ? (
        /* Pipeline View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGE_ORDER.filter(s => s !== 'converted' && s !== 'lost').map((stage) => (
            <div key={stage} className="flex-shrink-0 w-72">
              <div className={`p-3 rounded-t-lg border-b-2 ${STAGE_COLORS[stage]}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{stage.replace('_', ' ')}</span>
                  <span className="text-sm">{getLeadsByStage(stage).length}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-b-lg p-2 min-h-[400px] space-y-2">
                {getLeadsByStage(stage).map((lead) => (
                  <div
                    key={lead.lead_id}
                    onClick={() => setSelectedLead(lead)}
                    className="bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="font-medium mb-1">{lead.name}</div>
                    <div className="text-sm text-gray-500 mb-2">{lead.phone}</div>
                    {lead.interested_model && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Car size={14} />
                        {lead.interested_model}
                      </div>
                    )}
                    {lead.budget && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <DollarSign size={14} />
                        {lead.budget}
                      </div>
                    )}
                    {getNextStage(stage) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStage(lead.lead_id, getNextStage(stage));
                        }}
                        className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-blue-600 hover:bg-blue-50 py-1 rounded"
                      >
                        Move to {getNextStage(stage).replace('_', ' ')}
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Converted & Lost columns */}
          <div className="flex-shrink-0 w-72">
            <div className={`p-3 rounded-t-lg border-b-2 ${STAGE_COLORS.converted}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Converted</span>
                <span className="text-sm">{getLeadsByStage('converted').length}</span>
              </div>
            </div>
            <div className="bg-green-50 rounded-b-lg p-2 min-h-[200px] space-y-2">
              {getLeadsByStage('converted').map((lead) => (
                <div key={lead.lead_id} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-sm text-gray-500">{lead.interested_model}</div>
                </div>
              ))}
            </div>

            <div className={`p-3 rounded-t-lg border-b-2 mt-4 ${STAGE_COLORS.lost}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Lost</span>
                <span className="text-sm">{getLeadsByStage('lost').length}</span>
              </div>
            </div>
            <div className="bg-red-50 rounded-b-lg p-2 min-h-[100px] space-y-2">
              {getLeadsByStage('lost').map((lead) => (
                <div key={lead.lead_id} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="font-medium">{lead.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Lead</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Interest</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Stage</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((lead) => (
                <tr
                  key={lead.lead_id}
                  onClick={() => setSelectedLead(lead)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.lead_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{lead.phone}</div>
                    <div className="text-sm text-gray-500">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{lead.interested_model || '-'}</div>
                    <div className="text-sm text-gray-500">{lead.budget || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${STAGE_COLORS[lead.stage]}`}>
                      {lead.stage?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm capitalize">{lead.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Lead Details</h2>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400">×</button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-400" />
                <div>
                  <div className="font-medium">{selectedLead.name}</div>
                  <div className="text-sm text-gray-500">{selectedLead.lead_id}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="text-gray-400" />
                <span>{selectedLead.phone}</span>
              </div>

              {selectedLead.email && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <span>{selectedLead.email}</span>
                </div>
              )}

              {selectedLead.interested_model && (
                <div className="flex items-center gap-3">
                  <Car size={18} className="text-gray-400" />
                  <span>{selectedLead.interested_model}</span>
                </div>
              )}

              {selectedLead.budget && (
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400" />
                  <span>{selectedLead.budget}</span>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-500">Current Stage</span>
                <div className={`inline-block ml-2 px-2 py-1 rounded text-xs ${STAGE_COLORS[selectedLead.stage]}`}>
                  {selectedLead.stage?.replace('_', ' ')}
                </div>
              </div>

              {selectedLead.notes && (
                <div>
                  <span className="text-sm text-gray-500">Notes</span>
                  <p className="mt-1">{selectedLead.notes}</p>
                </div>
              )}

              <hr />

              <div>
                <span className="text-sm text-gray-500 block mb-2">Move to Stage</span>
                <div className="flex flex-wrap gap-2">
                  {STAGE_ORDER.filter(s => s !== selectedLead.stage).map((stage) => (
                    <button
                      key={stage}
                      onClick={() => {
                        updateStage(selectedLead.lead_id, stage);
                        setSelectedLead(null);
                      }}
                      className={`px-3 py-1 rounded text-xs ${STAGE_COLORS[stage]}`}
                    >
                      {stage.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Lead</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                try {
                  await leadsAPI.create({
                    name: formData.get('name'),
                    phone: formData.get('phone'),
                    email: formData.get('email'),
                    interested_model: formData.get('interested_model'),
                    budget: formData.get('budget'),
                    source: formData.get('source'),
                    notes: formData.get('notes')
                  });
                  setShowAddModal(false);
                  fetchLeads();
                } catch (error) {
                  console.error('Failed to create lead:', error);
                }
              }}
              className="space-y-4"
            >
              <input name="name" placeholder="Name" required className="w-full border rounded-lg px-4 py-2" />
              <input name="phone" placeholder="Phone" required className="w-full border rounded-lg px-4 py-2" />
              <input name="email" placeholder="Email" type="email" className="w-full border rounded-lg px-4 py-2" />
              <input name="interested_model" placeholder="Interested Model" className="w-full border rounded-lg px-4 py-2" />
              <input name="budget" placeholder="Budget Range" className="w-full border rounded-lg px-4 py-2" />
              <select name="source" className="w-full border rounded-lg px-4 py-2">
                <option value="call">Call</option>
                <option value="walk_in">Walk In</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
              </select>
              <textarea name="notes" placeholder="Notes" className="w-full border rounded-lg px-4 py-2" rows={2} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;
