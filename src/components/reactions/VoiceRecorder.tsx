'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Play, Pause, Square, Trash2, Send, X } from 'lucide-react';
import { VoiceNote } from '@/types';

interface VoiceRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceNoteComplete: (voiceNote: VoiceNote) => void;
  position?: { x: number; y: number };
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isOpen,
  onClose,
  onVoiceNoteComplete,
  position
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (recorderRef.current && !recorderRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      cleanup();
    };
  }, [isOpen, onClose]);

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;

      // Set up audio context for waveform visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Start waveform animation
      const updateWaveform = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Convert to normalized values for visualization
          const normalizedData = Array.from(dataArray)
            .slice(0, 32) // Take first 32 frequency bins
            .map(value => value / 255);
          
          setWaveform(normalizedData);
          animationRef.current = requestAnimationFrame(updateWaveform);
        }
      };

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start waveform visualization
      updateWaveform();
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setWaveform([]);
    setIsPlaying(false);
  };

  const sendVoiceNote = async () => {
    if (!audioBlob) return;

    try {
      // In a real app, you'd upload the audio blob to your storage service
      // For demo purposes, we'll create a mock URL
      const mockUrl = URL.createObjectURL(audioBlob);
      
      const voiceNote: VoiceNote = {
        id: `voice-${Date.now()}`,
        url: mockUrl,
        duration: recordingTime,
        waveform: waveform.length > 0 ? waveform : undefined,
        uploadedAt: new Date()
      };

      onVoiceNoteComplete(voiceNote);
      onClose();
    } catch (err) {
      console.error('Error sending voice note:', err);
      setError('Failed to send voice note');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const recorderStyle = position 
    ? { 
        position: 'fixed' as const, 
        left: position.x, 
        top: position.y,
        zIndex: 1000
      }
    : {};

  return (
    <AnimatePresence>
      <motion.div
        ref={recorderRef}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 overflow-hidden"
        style={recorderStyle}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Voice Note</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Waveform Visualization */}
          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center px-4">
            {isRecording && waveform.length > 0 ? (
              <div className="flex items-center gap-1 h-full">
                {waveform.map((value, index) => (
                  <motion.div
                    key={index}
                    className="bg-blue-500 rounded-full"
                    style={{
                      width: '3px',
                      height: `${Math.max(4, value * 40)}px`
                    }}
                    animate={{
                      height: `${Math.max(4, value * 40)}px`
                    }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            ) : audioBlob ? (
              <div className="flex items-center gap-1 h-full">
                {/* Static waveform for recorded audio */}
                {Array.from({ length: 32 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-gray-400 dark:bg-gray-500 rounded-full"
                    style={{
                      width: '3px',
                      height: `${Math.random() * 30 + 10}px`
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                {isRecording ? 'Recording...' : 'Ready to record'}
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="text-center">
            <span className="text-2xl font-mono text-gray-900 dark:text-gray-100">
              {formatTime(recordingTime)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!audioBlob ? (
              // Recording controls
              <>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              // Playback controls
              <>
                <button
                  onClick={deleteRecording}
                  className="w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                <button
                  onClick={isPlaying ? pauseRecording : playRecording}
                  className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </button>
                
                <button
                  onClick={sendVoiceNote}
                  className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            {!audioBlob ? (
              isRecording ? 'Click stop when finished' : 'Click the microphone to start recording'
            ) : (
              'Play to review, or send your voice note'
            )}
          </div>
        </div>

        {/* Hidden audio element for playback */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}; 