"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Copy, Mic, MicOff, Trash2, Globe, ArrowRight, Check, Languages, Sparkles, History, Volume2 } from 'lucide-react';

const languages = [
  { name: 'Auto-detect', code: 'auto' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Spanish', code: 'es' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Italian', code: 'it' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Korean', code: 'ko' },
  { name: 'Chinese', code: 'zh' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Russian', code: 'ru' },
  { name: 'Arabic', code: 'ar' },
];

export default function Translator() {
  const [isRecording, setIsRecording] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [sourceLang, setSourceLang] = useState('auto');
  const [isTranslating, setIsTranslating] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const startVisualization = (stream: MediaStream) => {
    if (!canvasRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    source.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        
        ctx.fillStyle = '#6366f1'; // Indigo-500
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 2;
      }
    };

    draw();
  };

  const stopVisualization = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const startRecording = async () => {
    try {
      setTranslatedText('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await translateAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        stopVisualization();
      };

      mediaRecorder.start();
      setIsRecording(true);
      startVisualization(stream);
    } catch {
      alert('Failed to access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const translateAudio = async (audioBlob: Blob) => {
    setIsTranslating(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('language', sourceLang);

      const response = await fetch("/api/translate", {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation failed');
      }

      const data = await response.json();
      setTranslatedText(data.text || 'No translation received');
    } catch (error : any) {
      console.error(error);
      setTranslatedText(error.message || 'Error occurred during translation. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const copyText = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 selection:bg-indigo-100">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-transparent to-transparent pointer-events-none opacity-70" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 lg:py-16">
        {/* Header */}
        <header className="flex flex-col items-center mb-12 text-center">
    
          <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
            Universal <span className="text-indigo-600">Translator</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl">
            Professional-grade voice translation. Bridge the gap between languages with a single tap.
          </p>
        </header>

        {/* Layout Container */}
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Input/Recording Section */}
          <div className="flex flex-col space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center min-h-[450px]">
              
              {/* Language Picker */}
              <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 mb-12">
                <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <select 
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 cursor-pointer outline-none"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="px-2 text-slate-400">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-slate-500">
                  <Languages className="w-4 h-4" />
                  <span>English</span>
                </div>
              </div>

              {/* Main Interaction Area */}
              <div className="relative flex flex-col items-center w-full">
                {/* Visualization Canvas */}
                <div className="h-24 w-full flex items-center justify-center mb-8">
                  {isRecording ? (
                    <canvas ref={canvasRef} width={400} height={80} className="w-full max-w-md h-full" />
                  ) : (
                    <div className="flex gap-1.5 items-center h-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleRecording}
                  disabled={isTranslating}
                  className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                    isRecording 
                      ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)] scale-110' 
                      : 'bg-indigo-600 shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:bg-indigo-700'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-12 h-12 text-white" />
                  ) : (
                    <Mic className="w-12 h-12 text-white" />
                  )}
                  
                  {isRecording && (
                    <div className="absolute inset-[-8px] border-2 border-red-500/30 rounded-full animate-ping" />
                  )}
                </button>

                <div className="mt-10 flex flex-col items-center gap-2">
                  <p className={`text-sm font-bold tracking-tight uppercase ${isRecording ? 'text-red-500' : 'text-slate-400'}`}>
                    {isRecording ? 'Listening...' : 'Ready to speak'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isRecording ? 'Tap to finish' : 'Click microphone to begin'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results/Translation Section */}
          <div className="flex flex-col bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Languages className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="font-bold text-slate-800 tracking-tight">Translation Result</h2>
              </div>
              <div className="flex gap-2">
                {translatedText && (
                  <button 
                    onClick={() => setTranslatedText('')}
                    className="p-2.5 hover:bg-slate-200/50 rounded-xl text-slate-400 transition-colors"
                    title="Clear"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 p-8 flex flex-col">
              <div className="flex-1 relative mb-6">
                {isTranslating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400 bg-white/80 backdrop-blur-sm rounded-2xl z-10">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-bold tracking-wide uppercase">Translating...</span>
                  </div>
                ) : null}
                
                <textarea
                  readOnly
                  value={translatedText}
                  placeholder="Your translation will appear here..."
                  className="w-full h-full min-h-[250px] bg-slate-50/30 rounded-2xl p-6 border-none focus:ring-0 text-xl leading-relaxed text-slate-700 placeholder-slate-300 resize-none font-medium"
                />
                
                {!translatedText && !isTranslating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 pointer-events-none select-none">
                    <Volume2 className="w-32 h-32 text-slate-900" />
                    <p className="mt-4 font-bold text-2xl uppercase tracking-widest">Awaiting Audio</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-4">
                <button
                  onClick={copyText}
                  disabled={!translatedText || isTranslating}
                  className={`py-4.5 px-8 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all duration-300 ${
                    isCopying 
                      ? 'bg-green-500 text-white shadow-[0_10px_20px_rgba(34,197,94,0.2)]' 
                      : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:translate-y-0.5'
                  }`}
                >
                  {isCopying ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy Translation
                    </>
                  )}
                </button>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <History className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}