import { useState, useRef, useCallback } from 'react';

const API_URL = '/api/chat';

function App() {
  const [input, setInput] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text) return;

    setError(null);
    setReply('');
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      setReply(data.reply ?? '');
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [input]);

  const toggleMic = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    if (recognitionRef.current && recording) {
      recognitionRef.current.stop();
      setRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ru-RU';

    recognition.onstart = () => setRecording(true);
    recognition.onend = () => setRecording(false);
    recognition.onerror = (e) => {
      setRecording(false);
      if (e.error !== 'aborted') {
        setError('Microphone error: ' + (e.error || 'unknown'));
      }
    };
    recognition.onresult = (e) => {
      const last = e.results.length - 1;
      const transcript = e.results[last][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [recording]);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-medium text-stone-800 mb-6 text-center">
          Chat
        </h1>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="button"
              onClick={toggleMic}
              className={`p-3 rounded-lg border shrink-0 ${
                recording
                  ? 'bg-red-100 border-red-300 text-red-700'
                  : 'bg-stone-100 border-stone-300 text-stone-600 hover:bg-stone-200'
              }`}
              title={recording ? 'Stop recording' : 'Voice input'}
              disabled={loading}
            >
              <MicIcon recording={recording} />
            </button>
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-lg bg-stone-800 text-white font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              Send
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-stone-500 text-sm">
              <span className="inline-block w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
              Waiting for response...
            </div>
          )}

          {reply && !loading && (
            <div className="pt-2 border-t border-stone-200">
              <p className="text-sm text-stone-500 mb-1">Reply:</p>
              <p className="text-stone-800 whitespace-pre-wrap">{reply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MicIcon({ recording }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {recording ? (
        <>
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </>
      ) : (
        <>
          <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </>
      )}
    </svg>
  );
}

export default App;
