import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Send, Trash2 } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
  maxDuration?: number; // in seconds
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  maxDuration = 300 // 5 minutes default
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasRecording, setHasRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Try different MIME types in order of preference
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/wav';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = ''; // Let browser choose
            }
          }
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mimeType || 'audio/webm' 
        });
        setAudioBlob(audioBlob);
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasRecording(true);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    }
  };

  const discardRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setHasRecording(false);
    setRecordingTime(0);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const sendRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, recordingTime);
      discardRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingStatus = () => {
    if (isRecording && !isPaused) return 'Recording...';
    if (isPaused) return 'Paused';
    if (hasRecording) return 'Ready to send';
    return 'Ready to record';
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Voice Message</h3>
        <span className="text-sm text-gray-500">{getRecordingStatus()}</span>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!isRecording && !hasRecording && (
          <button
            onClick={startRecording}
            className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="Start Recording"
          >
            <Mic size={24} />
          </button>
        )}

        {isRecording && (
          <>
            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="flex items-center justify-center w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors"
                title="Pause Recording"
              >
                <MicOff size={20} />
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                title="Resume Recording"
              >
                <Mic size={20} />
              </button>
            )}
            
            <button
              onClick={stopRecording}
              className="flex items-center justify-center w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
              title="Stop Recording"
            >
              <Square size={20} />
            </button>
          </>
        )}
      </div>

      {/* Recording Time */}
      <div className="text-center">
        <div className="text-2xl font-mono text-gray-700">
          {formatTime(recordingTime)}
        </div>
        {maxDuration && (
          <div className="text-sm text-gray-500">
            Max: {formatTime(maxDuration)}
          </div>
        )}
      </div>

      {/* Recording Progress */}
      {isRecording && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
          />
        </div>
      )}

      {/* Audio Playback */}
      {hasRecording && audioUrl && (
        <div className="space-y-3">
          <audio
            controls
            src={audioUrl}
            className="w-full"
            preload="metadata"
          />
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={discardRecording}
              className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Trash2 size={16} className="mr-2" />
              Discard
            </button>
            
            <button
              onClick={sendRecording}
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Send size={16} className="mr-2" />
              Send Voice Message
            </button>
          </div>
        </div>
      )}

      {/* Cancel Button */}
      {onCancel && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
