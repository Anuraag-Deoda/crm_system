import { useState, useEffect } from 'react';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  User,
  FileText,
  Filter,
  Download,
  X
} from 'lucide-react';
import { callsAPI } from '../lib/api';

function CallLogs() {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [transcript, setTranscript] = useState(null);

  useEffect(() => {
    fetchCallLogs();
  }, []);

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      const response = await callsAPI.getLogs();
      setCallLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch call logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTranscript = async (callId) => {
    try {
      const response = await callsAPI.getTranscript(callId);
      setTranscript(response.data.transcript);
    } catch (error) {
      console.error('Failed to fetch transcript:', error);
      setTranscript('Transcript not available');
    }
  };

  const filteredLogs = callLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'ai') return log.handled_by === 'ai';
    if (filter === 'human') return log.handled_by === 'ai_then_human';
    return log.outcome === filter;
  });

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'appointment_booked':
        return 'bg-blue-100 text-blue-700';
      case 'escalated':
        return 'bg-yellow-100 text-yellow-700';
      case 'callback_needed':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Call Logs</h1>
        <span className="text-gray-500">{filteredLogs.length} calls</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={18} className="text-gray-400" />
        {['all', 'ai', 'human', 'resolved', 'appointment_booked'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm capitalize ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'ai' ? 'AI Handled' :
             f === 'human' ? 'Human Takeover' :
             f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logs List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Call</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Duration</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Handler</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.call_id}
                      onClick={() => {
                        setSelectedLog(log);
                        fetchTranscript(log.call_id);
                      }}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedLog?.call_id === log.call_id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {log.direction === 'inbound' ? (
                            <PhoneIncoming size={16} className="text-green-500" />
                          ) : (
                            <PhoneOutgoing size={16} className="text-blue-500" />
                          )}
                          <div>
                            <div className="font-mono text-sm">{log.call_id?.slice(-10)}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.start_time).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{log.customer_name}</div>
                        <div className="text-xs text-gray-500">{log.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-sm">
                          <Clock size={14} className="text-gray-400" />
                          {formatDuration(log.duration_seconds)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.handled_by === 'ai' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {log.handled_by === 'ai' ? 'AI' : 'AI → Human'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${getOutcomeColor(log.outcome)}`}>
                          {log.outcome?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLogs.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No call logs found
                </div>
              )}
            </div>
          </div>

          {/* Call Details */}
          <div>
            {selectedLog ? (
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Call Details</h3>
                  <button
                    onClick={() => {
                      setSelectedLog(null);
                      setTranscript(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-gray-400" />
                    <div>
                      <div className="font-medium">{selectedLog.customer_name}</div>
                      <div className="text-sm text-gray-500">{selectedLog.phone}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Call ID</span>
                      <p className="font-mono text-xs">{selectedLog.call_id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Type</span>
                      <p className="capitalize">{selectedLog.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Direction</span>
                      <p className="capitalize">{selectedLog.direction}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration</span>
                      <p>{formatDuration(selectedLog.duration_seconds)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Confidence</span>
                      <p>{Math.round((selectedLog.ai_confidence || 0) * 100)}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Sentiment</span>
                      <p>{selectedLog.sentiment_score > 0 ? 'Positive' :
                          selectedLog.sentiment_score < 0 ? 'Negative' : 'Neutral'}</p>
                    </div>
                  </div>

                  {selectedLog.takeover_reason && (
                    <div>
                      <span className="text-sm text-gray-500">Takeover Reason</span>
                      <p className="text-sm mt-1 text-yellow-600">{selectedLog.takeover_reason}</p>
                    </div>
                  )}

                  <hr />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Transcript</span>
                      <FileText size={14} className="text-gray-400" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                      {transcript ? (
                        <pre className="text-xs whitespace-pre-wrap font-mono">
                          {transcript}
                        </pre>
                      ) : (
                        <p className="text-sm text-gray-400">Loading transcript...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                <Phone size={48} className="mx-auto mb-4 text-gray-300" />
                Select a call to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <span className="text-gray-500 text-sm">Total Calls</span>
          <p className="text-2xl font-bold">{callLogs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <span className="text-gray-500 text-sm">AI Handled</span>
          <p className="text-2xl font-bold text-blue-600">
            {callLogs.filter(l => l.handled_by === 'ai').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <span className="text-gray-500 text-sm">Human Takeover</span>
          <p className="text-2xl font-bold text-yellow-600">
            {callLogs.filter(l => l.handled_by === 'ai_then_human').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <span className="text-gray-500 text-sm">Avg Duration</span>
          <p className="text-2xl font-bold">
            {formatDuration(
              Math.round(
                callLogs.reduce((acc, l) => acc + (l.duration_seconds || 0), 0) / (callLogs.length || 1)
              )
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CallLogs;
