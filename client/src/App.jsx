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
    <div className="min-h-screen bg-[#1e3a5f] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-12 pb-32">
        <div className="w-full max-w-2xl text-center">
          <div className="flex justify-center mb-4">
            <ChatBubbleIcon />
          </div>
          <h1 className="text-white text-2xl font-normal mb-1">Hi there!</h1>
          <h2 className="text-white text-3xl font-bold mb-3">
            What would you like to know?
          </h2>
          <p className="text-white/70 text-sm mb-8">
            Use one of the most common prompts below or ask your own question.
          </p>

          {error && (
            <div className="text-sm text-red-300 bg-red-500/20 px-4 py-2 rounded-lg mb-4 inline-block">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sky-200 text-sm mb-4">
              <span className="inline-block w-4 h-4 border-2 border-sky-300 border-t-transparent rounded-full animate-spin" />
              Getting answer...
            </div>
          )}

          {reply && !loading && (
            <div className="bg-white/10 rounded-xl p-4 text-left text-white whitespace-pre-wrap text-sm mb-4">
              {reply}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1e3a5f]">
        <div className="max-w-2xl mx-auto flex items-center gap-2 bg-[#e5e7eb] rounded-full px-4 py-2 shadow-lg">
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2 rounded-full shrink-0 ${
              recording ? 'bg-red-200 text-red-600' : 'text-sky-500 hover:bg-sky-100'
            }`}
            title={recording ? 'Stop recording' : 'Voice input'}
            disabled={loading}
          >
            <MicIcon recording={recording} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask whatever you want"
            className="flex-1 bg-transparent py-2 px-1 text-stone-800 placeholder:text-stone-500 focus:outline-none min-w-0"
            disabled={loading}
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            className="shrink-0 w-10 h-10 rounded-full bg-[#1e3a5f] text-sky-300 flex items-center justify-center hover:bg-[#2d4a6f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send"
          >
            <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatBubbleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7dd3fc"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MicIcon({ recording }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {recording ? (
        <rect x="6" y="6" width="12" height="12" rx="2" />
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

function ArrowIcon() {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default App;
