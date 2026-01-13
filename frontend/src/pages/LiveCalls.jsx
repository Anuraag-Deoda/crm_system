import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  PhoneOff,
  UserCheck,
  Clock,
  AlertTriangle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { callsAPI } from '../lib/api';

function LiveCalls() {
  const [activeCalls, setActiveCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState(null);

  useEffect(() => {
    fetchActiveCalls();
    const interval = setInterval(fetchActiveCalls, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveCalls = async () => {
    try {
      const response = await callsAPI.getActive();
      setActiveCalls(response.data);
    } catch (error) {
      console.error('Failed to fetch active calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeover = async (callId) => {
    try {
      await callsAPI.takeover(callId, 'Manual takeover from live monitoring');
      fetchActiveCalls();
    } catch (error) {
      console.error('Failed to takeover call:', error);
    }
  };

  const handleEndCall = async (callId) => {
    try {
      await callsAPI.end(callId, 'ended_by_admin');
      fetchActiveCalls();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const formatDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (call) => {
    if (call.status === 'takeover') return 'bg-yellow-500';
    if (call.ai_confidence < 0.7) return 'bg-yellow-500';
    if (call.sentiment_score < -0.5) return 'bg-red-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Live Calls</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-500">{activeCalls.length} Active</span>
          <button
            onClick={fetchActiveCalls}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {activeCalls.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Phone className="mx-auto mb-4 text-gray-300" size={48} />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Active Calls</h2>
          <p className="text-gray-400 mb-4">
            Start a demo call to see live monitoring in action
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            <Phone size={18} />
            Start Demo Call
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calls List */}
          <div className="space-y-4">
            {activeCalls.map((call) => (
              <div
                key={call.call_id}
                className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${
                  call.status === 'takeover' ? 'border-yellow-500' :
                  call.ai_confidence < 0.7 ? 'border-yellow-500' :
                  call.sentiment_score < -0.5 ? 'border-red-500' : 'border-green-500'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(call)}`}></div>
                    <div>
                      <h3 className="font-semibold">{call.customer_name}</h3>
                      <p className="text-sm text-gray-500">{call.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {call.call_id.slice(-8)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatDuration(call.start_time)}
                  </span>
                  <span className="capitalize">{call.type}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    call.status === 'takeover' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {call.status === 'takeover' ? 'Human Handling' : 'AI Handling'}
                  </span>
                </div>

                {/* Last Message */}
                {call.transcript?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">
                        {call.transcript[call.transcript.length - 1].role === 'user' ? 'Customer: ' : 'AI: '}
                      </span>
                      {call.transcript[call.transcript.length - 1].content.slice(0, 100)}
                      {call.transcript[call.transcript.length - 1].content.length > 100 && '...'}
                    </p>
                  </div>
                )}

                {/* Alerts */}
                {(call.ai_confidence < 0.7 || call.sentiment_score < -0.5) && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 mb-3">
                    <AlertTriangle size={14} />
                    {call.ai_confidence < 0.7 && 'Low confidence'}
                    {call.sentiment_score < -0.5 && ' | Negative sentiment'}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCall(call)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  {call.status !== 'takeover' && (
                    <button
                      onClick={() => handleTakeover(call.call_id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 text-sm"
                    >
                      <UserCheck size={14} />
                      Takeover
                    </button>
                  )}
                  <button
                    onClick={() => handleEndCall(call.call_id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                  >
                    <PhoneOff size={14} />
                    End
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Call Transcript */}
          {selectedCall && (
            <div className="bg-white rounded-xl shadow-sm flex flex-col h-[600px]">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedCall.customer_name}</h3>
                  <p className="text-sm text-gray-500">{selectedCall.call_id}</p>
                </div>
                <button
                  onClick={() => setSelectedCall(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {selectedCall.transcript?.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="text-xs opacity-70 mb-1">
                        [{msg.timestamp}] {msg.role === 'user' ? 'Customer' : 'AI'}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Confidence: </span>
                    <span className={selectedCall.ai_confidence > 0.7 ? 'text-green-600' : 'text-yellow-600'}>
                      {Math.round(selectedCall.ai_confidence * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sentiment: </span>
                    <span className={
                      selectedCall.sentiment_score > 0 ? 'text-green-600' :
                      selectedCall.sentiment_score < 0 ? 'text-red-600' : 'text-gray-600'
                    }>
                      {selectedCall.sentiment_score > 0 ? 'Positive' :
                       selectedCall.sentiment_score < 0 ? 'Negative' : 'Neutral'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LiveCalls;
