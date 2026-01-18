"use client"
import React, { useState, useRef } from 'react';
import { Copy, Mic, MicOff, Trash2 } from 'lucide-react';

export default function Translator() {
  const [isRecording, setIsRecording] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [copy, setCopy] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
        console.log(audioBlob)
        await translateAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Failed to access microphone. Please grant permission.');
      console.log(err)
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const translateAudio = async (audioBlob: Blob) => {

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch("/api/translate", {
        method: "POST",
        body: formData
      })
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Translation failed');
      }

      const data = await response.json();
      setTranslatedText(data.text || 'No translation received');
    } catch (error) {
      throw new Error("External API error " , {cause : error});
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function clearText() {
    setTranslatedText('');
  }

  function copyText() {
    navigator.clipboard.writeText(translatedText);
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Speech to Text</h1>
            <p className="text-slate-300">Click the microphone to start recording</p>
          </div>


          <div className="flex justify-center mb-8">
            <button
              onClick={toggleRecording}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${isRecording
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
            {isRecording && (
              <p className="text-slate-400 text-sm mt-2 italic">
                Listening:
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            {!copy ?
              <button
                onClick={copyText}
                className={`flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors`}
              >
                <Copy className="w-4 h-4" />
                Copy
              </button> :
              <button
                className={`flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors`}
              >
                Copied
              </button>
            }
            <button
              onClick={clearText}
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