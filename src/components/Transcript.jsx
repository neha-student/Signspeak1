import React, { useEffect, useRef } from 'react';
import { Volume2, BotMessageSquare } from 'lucide-react';

const Transcript = ({ sentence, audioBase64, intent }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioBase64) {
      const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
      }
    }
  }, [audioBase64, sentence]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-slate-200 flex items-center">
          <BotMessageSquare className="w-6 h-6 mr-2 text-indigo-400" />
          AI Translation
        </h3>
        {intent && (
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-md uppercase tracking-widest border border-indigo-500/30">
            {intent}
          </span>
        )}
      </div>
      
      <div className="bg-slate-900 rounded-xl p-6 min-h-[120px] flex items-center justify-center relative group transition-all duration-300 border border-slate-800 hover:border-slate-600">
        <audio ref={audioRef} className="hidden" />
        
        {sentence ? (
          <p className="text-2xl md:text-3xl font-light text-center text-white leading-relaxed tracking-wide animate-fade-in-up">
            "{sentence}"
          </p>
        ) : (
          <p className="text-slate-500 italic text-lg animate-pulse">
            Waiting for sign language gestures...
          </p>
        )}

        {sentence && (
          <button 
            onClick={() => audioRef.current?.play()}
            className="absolute bottom-4 right-4 p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
            title="Replay Audio"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Transcript;
