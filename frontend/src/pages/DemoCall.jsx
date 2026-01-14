import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  UserCheck,
  AlertTriangle,
  Clock,
  Zap,
  MessageSquare,
  Volume2,
  VolumeX,
  RefreshCw
} from 'lucide-react';
import { demoAPI, ttsAPI } from '../lib/api';

function DemoCall() {
  const [callActive, setCallActive] = useState(false);
  const [callData, setCallData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [takenOver, setTakenOver] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [useElevenLabs, setUseElevenLabs] = useState(false); // Default to browser voice
  const [elevenLabsAvailable, setElevenLabsAvailable] = useState(false);
  const [language, setLanguage] = useState('hi-IN'); // hi-IN, mr-IN, en-IN

  const LANGUAGE_OPTIONS = [
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'Marathi', flag: '🏛️' },
    { code: 'en-IN', name: 'English (India)', flag: '🇬🇧' }
  ];

  const transcriptRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Use refs to avoid stale closures
  const callActiveRef = useRef(callActive);
  const callDataRef = useRef(callData);
  const takenOverRef = useRef(takenOver);
  const useElevenLabsRef = useRef(useElevenLabs);
  const voiceEnabledRef = useRef(voiceEnabled);
  const languageRef = useRef(language);

  // Keep refs in sync
  useEffect(() => { callActiveRef.current = callActive; }, [callActive]);
  useEffect(() => { callDataRef.current = callData; }, [callData]);
  useEffect(() => { takenOverRef.current = takenOver; }, [takenOver]);
  useEffect(() => { useElevenLabsRef.current = useElevenLabs; }, [useElevenLabs]);
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);
  useEffect(() => { languageRef.current = language; }, [language]);

  // Check ElevenLabs availability on mount
  useEffect(() => {
    const checkTTSStatus = async () => {
      try {
        const response = await ttsAPI.getStatus();
        const available = response.data.available;
        setElevenLabsAvailable(available);
        if (available) {
          setUseElevenLabs(true);
        }
      } catch (err) {
        console.log('ElevenLabs not available, using browser voice');
        setElevenLabsAvailable(false);
        setUseElevenLabs(false);
      }
    };
    checkTTSStatus();
  }, []);

  // Fallback to browser speech synthesis
  const speakWithBrowser = useCallback((text) => {
    if (!voiceEnabledRef.current || !text) return;

    synthRef.current.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = synthRef.current.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes('hi')) ||
                       voices.find(v => v.lang.includes('en-IN')) ||
                       voices[0];
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  // Speak using ElevenLabs
  const speakWithElevenLabs = useCallback(async (text) => {
    if (!voiceEnabledRef.current || !text) return;

    try {
      setIsSpeaking(true);
      const audioBlob = await ttsAPI.speak(text, 'rachel');
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (err) {
      console.error('ElevenLabs TTS error:', err);
      // Fallback to browser speech
      speakWithBrowser(text);
    }
  }, [speakWithBrowser]);

  // Main speak function
  const speakResponse = useCallback((text) => {
    if (useElevenLabsRef.current) {
      speakWithElevenLabs(text);
    } else {
      speakWithBrowser(text);
    }
  }, [speakWithElevenLabs, speakWithBrowser]);

  // Handle voice input - this is the function that processes speech
  const processVoiceInput = useCallback(async (voiceText) => {
    if (!voiceText.trim()) return;
    if (!callActiveRef.current) {
      console.log('Call not active, ignoring input');
      return;
    }

    const currentCallData = callDataRef.current;
    if (!currentCallData?.call_id) {
      console.log('No call data, ignoring input');
      return;
    }

    setLoading(true);
    setTranscript('');
    setError('');

    try {
      console.log('Sending message:', voiceText, 'to call:', currentCallData.call_id);

      const response = takenOverRef.current
        ? await demoAPI.sendHumanMessage(currentCallData.call_id, voiceText)
        : await demoAPI.sendMessage(currentCallData.call_id, voiceText);

      console.log('Response received:', response.data);

      setCallData(response.data.call);

      // Get AI response and speak it
      const lastMessage = response.data.call.transcript?.slice(-1)[0];
      if (lastMessage && lastMessage.role === 'assistant') {
        speakResponse(lastMessage.content);
      }

      if (response.data.takeover_requested) {
        setTakenOver(true);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to process. Please try again.');
      if (err.response?.data?.takeover) {
        setTakenOver(true);
      }
    } finally {
      setLoading(false);
    }
  }, [speakResponse]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = languageRef.current; // Dynamic language

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          processVoiceInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);

        if (event.error === 'network') {
          setError('Network error. Make sure you have internet connection. Try using Chrome browser.');
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access in browser settings.');
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else {
          setError(`Voice error: ${event.error}. Try clicking the mic again.`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Voice recognition not supported. Please use Chrome browser.');
    }

    // Create audio element for ElevenLabs playback
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsSpeaking(false);
    audioRef.current.onerror = () => {
      setIsSpeaking(false);
      console.error('Audio playback error');
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      synthRef.current.cancel();
    };
  }, [processVoiceInput]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [callData?.transcript]);

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setError('');

      // Stop any ongoing speech
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      synthRef.current.cancel();
      setIsSpeaking(false);

      try {
        // Update language before starting
        if (recognitionRef.current) {
          recognitionRef.current.lang = languageRef.current;
        }
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error('Recognition start error:', e);
        setError('Could not start voice recognition. Please try again.');
      }
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const startCall = async () => {
    setLoading(true);
    try {
      const response = await demoAPI.startCall({
        phone: '+91 98765 43210',
        customer_name: 'Demo Customer',
        direction: 'inbound',
        type: 'inquiry'
      });

      console.log('Call started:', response.data);

      setCallData(response.data.call);
      setCallActive(true);
      setTakenOver(false);
      setError('');

      // Speak initial greeting
      const initialMessage = response.data.call.transcript?.[0];
      if (initialMessage && initialMessage.role === 'assistant') {
        setTimeout(() => speakResponse(initialMessage.content), 500);
      }
    } catch (err) {
      console.error('Failed to start call:', err);
      setError('Failed to start call. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const takeover = async () => {
    try {
      const response = await demoAPI.takeover(callData.call_id, 'Manual takeover by admin');
      setCallData(response.data.call);
      setTakenOver(true);
    } catch (err) {
      console.error('Failed to takeover:', err);
    }
  };

  const endCall = async () => {
    stopSpeaking();
    recognitionRef.current?.stop();

    try {
      await demoAPI.endCall(callData.call_id, 'resolved');
      setCallActive(false);
      setCallData(null);
      setTakenOver(false);
      setIsListening(false);
      setIsSpeaking(false);
    } catch (err) {
      console.error('Failed to end call:', err);
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

  // Update duration every second
  useEffect(() => {
    if (!callActive) return;
    const interval = setInterval(() => {
      setCallData(prev => prev ? {...prev} : null);
    }, 1000);
    return () => clearInterval(interval);
  }, [callActive]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Demo Call</h1>
        <p className="text-gray-500">Voice-Enabled AI Agent Test</p>
      </div>

      {!callActive ? (
        /* Start Call Screen */
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-xl mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone className="text-green-600" size={40} />
          </div>
          <h2 className="text-xl font-semibold mb-2">Start a Voice Demo Call</h2>
          <p className="text-gray-500 mb-4">
            Simulate a customer call using your microphone.
            <br />
            <span className="text-sm">Click the mic button to speak as the customer.</span>
          </p>

          {/* Language Selection */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Language / भाषा निवडा
            </label>
            <div className="flex justify-center gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    language === lang.code
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Engine Selection */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <label className="flex items-center justify-center gap-3 cursor-pointer">
              <span className={`text-sm ${!useElevenLabs ? 'font-medium' : 'text-gray-500'}`}>Browser Voice</span>
              <div
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  !elevenLabsAvailable ? 'bg-gray-200 cursor-not-allowed' :
                  useElevenLabs ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => elevenLabsAvailable && setUseElevenLabs(!useElevenLabs)}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${useElevenLabs ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </div>
              <span className={`text-sm ${useElevenLabs ? 'font-medium' : 'text-gray-500'}`}>
                ElevenLabs {elevenLabsAvailable ? '(HD)' : '(N/A)'}
              </span>
            </label>
            <p className="text-xs text-gray-400 mt-1">
              {!elevenLabsAvailable
                ? 'ElevenLabs API key not configured - using browser voice'
                : useElevenLabs
                  ? 'High-quality natural voice'
                  : 'Built-in browser voice'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

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
            Start Voice Call
          </button>
        </div>
      ) : (
        /* Active Call Screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Call Panel */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm flex flex-col h-[600px]">
            {/* Call Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${takenOver ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span className="font-medium">
                  {takenOver ? 'Human Agent Mode' : 'AI Handling Call'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${useElevenLabs ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {useElevenLabs ? 'ElevenLabs' : 'Browser'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {formatDuration()}
                </span>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-1 rounded ${voiceEnabled ? 'text-green-600' : 'text-gray-400'}`}
                  title={voiceEnabled ? 'Mute AI voice' : 'Enable AI voice'}
                >
                  {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
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

              {/* Live transcript preview */}
              {transcript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg p-3 bg-blue-200 text-blue-800 border-2 border-dashed border-blue-400">
                    <div className="text-xs opacity-70 mb-1">Speaking...</div>
                    <p className="whitespace-pre-wrap">{transcript}</p>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                      AI is thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Voice Controls */}
            <div className="p-6 border-t bg-gray-50">
              {error && (
                <div className="bg-red-50 text-red-600 p-2 rounded-lg mb-4 text-sm text-center flex items-center justify-center gap-2">
                  <AlertTriangle size={16} />
                  {error}
                  <button
                    onClick={() => setError('')}
                    className="ml-2 text-red-400 hover:text-red-600"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              )}

              {/* Big Mic Button */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  {/* Stop Speaking Button */}
                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center shadow-lg"
                      title="Stop AI speaking"
                    >
                      <VolumeX size={24} className="text-white" />
                    </button>
                  )}

                  {/* Main Mic Button */}
                  <button
                    onClick={toggleListening}
                    disabled={loading || isSpeaking}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isListening
                        ? 'bg-red-500 animate-pulse shadow-lg shadow-red-300'
                        : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-300'
                    }`}
                  >
                    {isListening ? (
                      <MicOff size={40} className="text-white" />
                    ) : (
                      <Mic size={40} className="text-white" />
                    )}
                  </button>
                </div>

                <div className="text-center">
                  {loading ? (
                    <p className="text-gray-600 flex items-center gap-2 justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></span>
                      Processing...
                    </p>
                  ) : isSpeaking ? (
                    <p className="text-green-600 flex items-center gap-2 justify-center">
                      <Volume2 size={18} className="animate-pulse" />
                      AI is speaking... (click orange button to interrupt)
                    </p>
                  ) : isListening ? (
                    <p className="text-red-600 font-medium">Listening... (click to stop)</p>
                  ) : (
                    <p className="text-gray-500">Click the mic to speak as customer</p>
                  )}
                </div>
              </div>
            </div>

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
            {/* Voice Status */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Mic size={18} className="text-blue-500" />
                Voice Status
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Microphone</span>
                  <span className={`px-2 py-1 rounded text-xs ${isListening ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {isListening ? 'Active' : 'Ready'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">AI Voice</span>
                  <span className={`px-2 py-1 rounded text-xs ${isSpeaking ? 'bg-green-100 text-green-700' : voiceEnabled ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>
                    {isSpeaking ? 'Speaking' : voiceEnabled ? 'Enabled' : 'Muted'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Voice Engine</span>
                  <span className={`px-2 py-1 rounded text-xs ${useElevenLabs ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {useElevenLabs ? 'ElevenLabs HD' : 'Browser'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Language</span>
                  <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                    {LANGUAGE_OPTIONS.find(l => l.code === language)?.name || 'Hindi'}
                  </span>
                </div>
              </div>
            </div>

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
                  <span className="font-mono text-xs">{callData?.call_id?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="capitalize">{callData?.type}</span>
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
