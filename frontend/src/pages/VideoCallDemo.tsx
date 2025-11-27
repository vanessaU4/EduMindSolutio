import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Phone, 
  Users, 
  Brain, 
  Camera,
  Mic,
  Settings,
  CheckCircle
} from 'lucide-react';
import EnhancedCallInterface from '@/components/media/EnhancedCallInterface';
import MoodDetection from '@/components/media/MoodDetection';
import CameraTestInterface from '@/components/media/CameraTestInterface';

interface MoodData {
  emotion: 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'calm' | 'frustrated';
  confidence: number;
  timestamp: number;
}

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHost: boolean;
  currentMood?: MoodData;
}

const VideoCallDemo: React.FC = () => {
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('video');
  const [participants, setParticipants] = useState<CallParticipant[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      isAudioMuted: false,
      isVideoMuted: false,
      isHost: true,
    },
    {
      id: '2',
      name: 'You',
      isAudioMuted: false,
      isVideoMuted: false,
      isHost: false,
    }
  ]);
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  const [currentMood, setCurrentMood] = useState<MoodData | null>(null);
  const [showMoodDemo, setShowMoodDemo] = useState(false);
  const [showCameraTest, setShowCameraTest] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const handleStartCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setIsInCall(true);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setMoodHistory([]);
    setCurrentMood(null);
  };

  const handleMoodUpdate = (mood: MoodData) => {
    setCurrentMood(mood);
    setMoodHistory(prev => [...prev.slice(-19), mood]);
    
    // Update participant mood
    setParticipants(prev => prev.map(p => 
      p.name === 'You' ? { ...p, currentMood: mood } : p
    ));
  };

  const handleMoodDetected = (mood: MoodData) => {
    setCurrentMood(mood);
    setMoodHistory(prev => [...prev.slice(-9), mood]);
  };

  const handleCameraReady = (stream: MediaStream) => {
    setCameraReady(true);
    console.log('Camera ready for video calls:', stream);
  };

  const getMoodEmoji = (emotion: string) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'sad': return '😢';
      case 'frustrated': return '😤';
      case 'anxious': return '😰';
      case 'calm': return '😌';
      default: return '😐';
    }
  };

  const getMoodStats = (): Array<{emotion: string, percentage: number}> => {
    if (moodHistory.length === 0) return [];
    
    const moodCounts = moodHistory.reduce((acc, mood) => {
      acc[mood.emotion] = (acc[mood.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalMoods = moodHistory.length;
    return Object.entries(moodCounts).map(([emotion, count]) => ({
      emotion,
      percentage: Math.round((count / totalMoods) * 100)
    }));
  };

  if (isInCall) {
    return (
      <div className="min-h-screen bg-gray-100">
        <EnhancedCallInterface
          callId="demo-call-1"
          callType={callType}
          participants={participants}
          onEndCall={handleEndCall}
          onMoodUpdate={handleMoodUpdate}
          className="h-screen"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Video Call with Mood Tracking
          </h1>
          <p className="text-gray-600">
            Experience video calls with real-time mood detection and emotional insights
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => { setShowCameraTest(false); setShowMoodDemo(false); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !showCameraTest && !showMoodDemo
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Video Call Demo
          </button>
          <button
            onClick={() => { setShowCameraTest(true); setShowMoodDemo(false); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showCameraTest
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Camera Test
          </button>
          <button
            onClick={() => { setShowCameraTest(false); setShowMoodDemo(true); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showMoodDemo
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mood Detection
          </button>
        </div>

        {/* Camera Test Interface */}
        {showCameraTest && (
          <CameraTestInterface
            onCameraReady={handleCameraReady}
            className="max-w-4xl mx-auto"
          />
        )}

        {/* Mood Detection Demo */}
        {showMoodDemo && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Mood Detection Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MoodDetection
                  isActive={true}
                  onMoodDetected={handleMoodDetected}
                  showPreview={true}
                />
                
                {currentMood && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Current Mood</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getMoodEmoji(currentMood.emotion)}</span>
                      <div>
                        <Badge className="mb-1">
                          {currentMood.emotion.charAt(0).toUpperCase() + currentMood.emotion.slice(1)}
                        </Badge>
                        <p className="text-sm text-gray-600">
                          Confidence: {Math.round(currentMood.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Video Call Demo */}
        {!showCameraTest && !showMoodDemo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Call Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Start a Call
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cameraReady && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Camera Ready</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">Your camera has been tested and is working properly.</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleStartCall('video')}
                    className="flex items-center gap-2 h-16"
                  >
                    <Video className="w-5 h-5" />
                    Video Call
                  </Button>
                  <Button
                    onClick={() => handleStartCall('audio')}
                    variant="outline"
                    className="flex items-center gap-2 h-16"
                  >
                    <Phone className="w-5 h-5" />
                    Audio Call
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Features:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Real-time mood detection during video calls</li>
                    <li>• Emotional insights and analytics</li>
                    <li>• Privacy-focused local processing</li>
                    <li>• Integration with therapeutic sessions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowCameraTest(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Test Camera
                </Button>
                
                <Button
                  onClick={() => setShowMoodDemo(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Test Mood Detection
                </Button>
                
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-2">Having camera issues?</p>
                  <Button
                    onClick={() => setShowCameraTest(true)}
                    size="sm"
                    variant="secondary"
                    className="w-full"
                  >
                    Run Diagnostics
                  </Button>
                </div>
              </CardContent>
            </Card>

          {/* Current Mood */}
          {currentMood && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Mood</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {getMoodEmoji(currentMood.emotion)}
                  </div>
                  <div>
                    <Badge className="mb-2">
                      {currentMood.emotion.charAt(0).toUpperCase() + currentMood.emotion.slice(1)}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Confidence: {Math.round(currentMood.confidence * 100)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      Detected at {new Date(currentMood.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mood Analytics */}
          {moodHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mood Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getMoodStats().map(({ emotion, percentage }) => (
                    <div key={emotion} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getMoodEmoji(emotion)}</span>
                        <span className="text-sm font-medium capitalize">{emotion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-10">{percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

            {/* How It Works */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>How Video Calls Work</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium mb-2">Camera Access</h3>
                    <p className="text-sm text-gray-600">
                      Securely access your camera during video calls with your permission
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-medium mb-2">AI Analysis</h3>
                    <p className="text-sm text-gray-600">
                      Advanced facial expression analysis to detect emotional states
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Settings className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium mb-2">Privacy First</h3>
                    <p className="text-sm text-gray-600">
                      All processing happens locally on your device for maximum privacy
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Camera access is required for video calls</li>
                    <li>• Use the camera test to troubleshoot issues</li>
                    <li>• Mood detection is optional and can be disabled</li>
                    <li>• All processing happens locally for privacy</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallDemo;
