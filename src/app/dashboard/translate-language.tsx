"use client"
import React, { useState, useRef } from 'react';
import { Copy, Mic, MicOff, Square, Trash2 } from 'lucide-react';

export default function Translator() {
  const [isRecording, setIsRecording] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError('');
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
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to access microphone. Please grant permission.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const translateAudio = async (audioBlob: Blob) => {
    if (!apiKey.trim()) {
      setError('Please enter your Groq API key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-large-v3');

      const response = await fetch('https://api.groq.com/openai/v1/audio/translations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Translation failed');
      }

      const data = await response.json();
      setTranslatedText(data.text || 'No translation received');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed. Check your API key.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording =()=>{
    if(isRecording){
      stopRecording();
    }else{
      startRecording();
    }
  }

  return (
     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Speech to Text</h1>
            <p className="text-slate-300">Click the microphone to start recording</p>
          </div>

          {/* Record Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={toggleRecording}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                isRecording
                  ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
              {isRecording && (
                <span className="absolute -bottom-8 text-red-400 text-sm font-medium">
                  Recording...
                </span>
              )}
            </button>
          </div>

          {/* Transcript Area */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-2">Transcript</label>
            <textarea
              value={translatedText}
              onChange={(e) => setTranslatedText(e.target.value)}
              placeholder="Your speech will appear here..."
              className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {/* {isRecording && (
              <p className="text-slate-400 text-sm mt-2 italic">
                Listening: {interimTranscript}
              </p>
            )} */}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              // onClick={copyText}
              // disabled={!transcript}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button
              // onClick={clearText}
              // disabled={!transcript}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}