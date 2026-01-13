import { useState, useRef, useEffect } from 'react';
import {
  Phone,
  PhoneOff,
  Send,
  UserCheck,
  AlertTriangle,
  Clock,
  Zap,
  MessageSquare
} from 'lucide-react';
import { demoAPI } from '../lib/api';

function DemoCall() {
  const [callActive, setCallActive] = useState(false);
  const [callData, setCallData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [takenOver, setTakenOver] = useState(false);
  const transcriptRef = useRef(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [callData?.transcript]);

  const startCall = async () => {
    setLoading(true);
    try {
      const response = await demoAPI.startCall({
        phone: '+91 98765 43210',
        customer_name: 'Demo Customer',
        direction: 'inbound',
        type: 'inquiry'
      });
      setCallData(response.data.call);
      setCallActive(true);
      setTakenOver(false);
    } catch (error) {
      console.error('Failed to start call:', error);
      alert('Failed to start call. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !callActive) return;

    setLoading(true);
    try {
      const response = takenOver
        ? await demoAPI.sendHumanMessage(callData.call_id, message)
        : await demoAPI.sendMessage(callData.call_id, message);

      setCallData(response.data.call);
      setMessage('');

      if (response.data.takeover_requested) {
        setTakenOver(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      if (error.response?.data?.takeover) {
        setTakenOver(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const takeover = async () => {
    try {
      const response = await demoAPI.takeover(callData.call_id, 'Manual takeover by admin');
      setCallData(response.data.call);
      setTakenOver(true);
    } catch (error) {
      console.error('Failed to takeover:', error);
    }
  };

  const endCall = async () => {
    try {
      await demoAPI.endCall(callData.call_id, 'resolved');
      setCallActive(false);
      setCallData(null);
      setTakenOver(false);
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const formatDuration = () => {
    if (!callData?.start_time) return '00:00';
    const start = new Date(callData.start_time);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Demo Call</h1>
        <p className="text-gray-500">Test the AI Agent</p>
      </div>

      {!callActive ? (
        /* Start Call Screen */
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-xl mx-auto">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone className="text-blue-600" size={40} />
          </div>
          <h2 className="text-xl font-semibold mb-2">Start a Demo Call</h2>
          <p className="text-gray-500 mb-6">
            Simulate a customer call and test the AI agent's capabilities.
            Type messages as the customer would speak.
          </p>
          <button
            onClick={startCall}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Phone size={20} />
            )}
            Start Call
          </button>
        </div>
      ) : (
        /* Active Call Screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transcript Panel */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm flex flex-col h-[600px]">
            {/* Call Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${takenOver ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span className="font-medium">
                  {takenOver ? 'Human Agent Mode' : 'AI Handling Call'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {formatDuration()}
                </span>
                <span>{callData?.phone}</span>
              </div>
            </div>

            {/* Transcript */}
            <div
              ref={transcriptRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
            >
              {callData?.transcript?.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : msg.role === 'human_agent'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1">
                      [{msg.timestamp}] {msg.role === 'user' ? 'Customer' : msg.role === 'human_agent' ? 'Human Agent' : 'AI'}
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={takenOver ? "Type as human agent..." : "Type customer message..."}
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="p-4 border-t flex gap-3">
              {!takenOver && (
                <button
                  onClick={takeover}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                >
                  <UserCheck size={18} />
                  Takeover
                </button>
              )}
              <button
                onClick={endCall}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                <PhoneOff size={18} />
                End Call
              </button>
            </div>
          </div>

          {/* Context Panel */}
          <div className="space-y-4">
            {/* AI Context */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap size={18} className="text-yellow-500" />
                AI Context
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Intent</span>
                  <span className="font-medium">{callData?.context?.intent || 'Detecting...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Model Discussed</span>
                  <span className="font-medium">{callData?.context?.model_discussed || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Confidence</span>
                  <span className={`font-medium ${
                    callData?.ai_confidence > 0.7 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {Math.round((callData?.ai_confidence || 0.85) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sentiment</span>
                  <span className={`font-medium ${
                    callData?.sentiment_score > 0 ? 'text-green-600' :
                    callData?.sentiment_score < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {callData?.sentiment_score > 0 ? 'Positive' :
                     callData?.sentiment_score < 0 ? 'Negative' : 'Neutral'}
                  </span>
                </div>
              </div>
            </div>

            {/* Functions Called */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-500" />
                Functions Called
              </h3>
              <div className="space-y-2">
                {callData?.context?.functions_called?.length > 0 ? (
                  callData.context.functions_called.map((func, index) => (
                    <div key={index} className="text-sm bg-gray-50 px-3 py-2 rounded">
                      {func}()
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No functions called yet</p>
                )}
              </div>
            </div>

            {/* Call Info */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold mb-3">Call Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Call ID</span>
                  <span className="font-mono text-xs">{callData?.call_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="capitalize">{callData?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Direction</span>
                  <span className="capitalize">{callData?.direction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    callData?.status === 'active' ? 'bg-green-100 text-green-700' :
                    callData?.status === 'takeover' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                  }`}>
                    {callData?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {callData?.ai_confidence < 0.7 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle size={18} />
                  <span className="font-medium">Low Confidence</span>
                </div>
                <p className="text-sm text-yellow-600 mt-1">
                  AI confidence is low. Consider taking over the call.
                </p>
              </div>
            )}

            {callData?.sentiment_score < -0.5 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle size={18} />
                  <span className="font-medium">Negative Sentiment</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  Customer seems frustrated. Human intervention recommended.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DemoCall;
