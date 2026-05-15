import React, { useState, useEffect, useRef } from 'react';
import VideoStream from './components/VideoStream';
import Transcript from './components/Transcript';
import { HandMetal } from 'lucide-react';

function App() {
  const [ws, setWs] = useState(null);
  const [translationData, setTranslationData] = useState({
    intent: '',
    sentence: '',
    audioBase64: null
  });
  
  const wsRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket
    const socket = new WebSocket('ws://localhost:8000/ws');
    
    socket.onopen = () => {
      console.log('WebSocket Connected');
      setWs(socket);
      wsRef.current = socket;
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        console.error("Backend Error:", data.error);
        return;
      }
      
      if (data.sentence) {
        setTranslationData({
          intent: data.intent,
          sentence: data.sentence,
          audioBase64: data.audio_base64
        });
      }
    };

    socket.onclose = () => {
      console.log('WebSocket Disconnected');
      setWs(null);
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleFrame = (base64Image) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(base64Image);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <HandMetal className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              SignSpeak AI
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2.5 h-2.5 rounded-full ${ws ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-slate-400">
              {ws ? 'System Online' : 'Connecting...'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Breaking Communication Barriers
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Real-time sign language translation powered by advanced AI and natural language processing.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          {/* Video Stream Section */}
          <section className="animate-fade-in">
            <VideoStream onFrame={handleFrame} />
          </section>

          {/* Transcript Section */}
          <section className="animate-fade-in delay-100">
            <Transcript 
              intent={translationData.intent}
              sentence={translationData.sentence} 
              audioBase64={translationData.audioBase64} 
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
