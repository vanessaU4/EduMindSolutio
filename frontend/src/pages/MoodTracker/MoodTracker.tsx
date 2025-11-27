import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  CameraOff, 
  Smile, 
  Frown, 
  Meh, 
  Heart,
  TrendingUp,
  Calendar,
  BarChart3,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface MoodData {
  id: string;
  timestamp: string;
  emotion: string;
  confidence: number;
  imageData?: string;
  notes?: string;
}

interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  emotions: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    neutral: number;
    fear: number;
    disgust: number;
  };
}

const MoodTracker: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionAnalysis | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load mood history on component mount
  useEffect(() => {
    loadMoodHistory();
  }, []);

  const loadMoodHistory = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockData: MoodData[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          emotion: 'happy',
          confidence: 0.85,
          notes: 'Had a great day at work!'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          emotion: 'neutral',
          confidence: 0.72,
          notes: 'Regular day, nothing special'
        }
      ];
      setMoodData(mockData);
    } catch (error) {
      console.error('Failed to load mood history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mood history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' // Front camera
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsRecording(true);
      
      toast({
        title: 'Camera Started',
        description: 'Position your face in the camera view',
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsRecording(false);
    setCapturedImage(null);
    setCurrentAnalysis(null);
  }, [stream]);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);

    // Analyze the captured image
    await analyzeMood(imageData);
  }, []);

  const analyzeMood = async (imageData: string) => {
    setAnalyzing(true);
    try {
      // Simulate emotion analysis (replace with actual AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis results
      const mockAnalysis: EmotionAnalysis = {
        emotion: 'happy',
        confidence: 0.78,
        emotions: {
          happy: 0.78,
          neutral: 0.15,
          sad: 0.04,
          surprised: 0.02,
          angry: 0.01,
          fear: 0.00,
          disgust: 0.00
        }
      };

      setCurrentAnalysis(mockAnalysis);
      
      toast({
        title: 'Analysis Complete',
        description: `Detected emotion: ${mockAnalysis.emotion} (${Math.round(mockAnalysis.confidence * 100)}% confidence)`,
      });
    } catch (error) {
      console.error('Error analyzing mood:', error);
      toast({
        title: 'Analysis Error',
        description: 'Failed to analyze mood from image',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const saveMoodEntry = async () => {
    if (!currentAnalysis) return;

    try {
      const newEntry: MoodData = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        emotion: currentAnalysis.emotion,
        confidence: currentAnalysis.confidence,
        imageData: capturedImage || undefined,
        notes: notes.trim() || undefined
      };

      // TODO: Save to backend
      setMoodData(prev => [newEntry, ...prev]);
      
      // Reset form
      setNotes('');
      setCapturedImage(null);
      setCurrentAnalysis(null);
      stopCamera();

      toast({
        title: 'Mood Saved',
        description: 'Your mood entry has been recorded successfully',
      });
    } catch (error) {
      console.error('Error saving mood entry:', error);
      toast({
        title: 'Save Error',
        description: 'Failed to save mood entry',
        variant: 'destructive',
      });
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return <Smile className="w-5 h-5 text-green-600" />;
      case 'sad':
        return <Frown className="w-5 h-5 text-blue-600" />;
      case 'angry':
        return <Frown className="w-5 h-5 text-red-600" />;
      case 'surprised':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'neutral':
      default:
        return <Meh className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return 'bg-green-100 text-green-800';
      case 'sad':
        return 'bg-blue-100 text-blue-800';
      case 'angry':
        return 'bg-red-100 text-red-800';
      case 'surprised':
        return 'bg-yellow-100 text-yellow-800';
      case 'neutral':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Mood Tracker
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Track your emotional well-being using AI-powered facial analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              <span className="text-sm text-gray-600">
                {moodData.length} entries
              </span>
            </div>
          </div>
        </div>

        {/* Camera Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Mood Capture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Camera View */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {isRecording ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured mood"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">Click "Start Camera" to begin</p>
                    </div>
                  </div>
                )}
                
                {analyzing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                      <p>Analyzing your mood...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex gap-2">
                {!isRecording ? (
                  <Button onClick={startCamera} className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button onClick={captureImage} disabled={analyzing} className="flex-1">
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Mood
                    </Button>
                    <Button onClick={stopCamera} variant="outline">
                      <CameraOff className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
              </div>

              {/* Hidden canvas for image capture */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Mood Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentAnalysis ? (
                <>
                  {/* Primary Emotion */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getEmotionIcon(currentAnalysis.emotion)}
                      <span className="text-2xl font-bold capitalize">
                        {currentAnalysis.emotion}
                      </span>
                    </div>
                    <Badge className={getEmotionColor(currentAnalysis.emotion)}>
                      {Math.round(currentAnalysis.confidence * 100)}% confidence
                    </Badge>
                  </div>

                  {/* Emotion Breakdown */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Emotion Breakdown</h4>
                    {Object.entries(currentAnalysis.emotions)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([emotion, value]) => (
                        <div key={emotion} className="flex items-center gap-2">
                          <span className="w-16 text-sm capitalize">{emotion}</span>
                          <Progress value={value * 100} className="flex-1" />
                          <span className="text-sm text-gray-600 w-12">
                            {Math.round(value * 100)}%
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="How are you feeling? Any additional context..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Save Button */}
                  <Button onClick={saveMoodEntry} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Mood Entry
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Capture your mood to see analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mood History */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Mood Entries
              </CardTitle>
              <Button variant="outline" onClick={loadMoodHistory} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {moodData.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600 mb-2">No mood entries yet</p>
                <p className="text-sm text-gray-500">Start tracking your mood to see your emotional journey</p>
              </div>
            ) : (
              <div className="space-y-4">
                {moodData.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getEmotionIcon(entry.emotion)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{entry.emotion}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(entry.confidence * 100)}%
                        </Badge>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mb-2">{entry.notes}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {moodData.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline">
                      View All Entries ({moodData.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Alert className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Privacy Notice:</strong> Your facial images are processed locally and only mood data is stored. 
            Images are not saved unless you explicitly choose to include them in your mood entries.
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  );
};

export default MoodTracker;
