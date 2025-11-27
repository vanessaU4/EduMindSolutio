import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Mic, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Settings,
  Monitor,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { mediaService } from '@/services/mediaService';

interface MediaDeviceTest {
  hasAudio: boolean;
  hasVideo: boolean;
  devices: MediaDeviceInfo[];
  permissions: { camera: PermissionState; microphone: PermissionState };
  browserSupport: boolean;
}

interface CameraTestInterfaceProps {
  onCameraReady?: (stream: MediaStream) => void;
  className?: string;
}

export const CameraTestInterface: React.FC<CameraTestInterfaceProps> = ({
  onCameraReady,
  className = ''
}) => {
  const [isTestingCamera, setIsTestingCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<MediaDeviceTest | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [testResults, setTestResults] = useState<{
    browserSupport: boolean;
    permissions: boolean;
    deviceAccess: boolean;
    videoStream: boolean;
    audioStream: boolean;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initializeDeviceInfo();
  }, []);

  const initializeDeviceInfo = async () => {
    try {
      const info = await mediaService.testMediaDevices();
      setDeviceInfo(info);
      
      const cameras = await mediaService.getAvailableCameras();
      setAvailableCameras(cameras);
      
      if (cameras.length > 0 && !selectedCameraId) {
        setSelectedCameraId(cameras[0].deviceId);
      }
    } catch (error) {
      console.error('Failed to initialize device info:', error);
    }
  };

  const runCameraTest = async () => {
    setIsTestingCamera(true);
    setCameraError(null);
    
    const results = {
      browserSupport: false,
      permissions: false,
      deviceAccess: false,
      videoStream: false,
      audioStream: false
    };

    try {
      // Test 1: Browser Support
      results.browserSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      
      if (!results.browserSupport) {
        throw new Error('Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      // Test 2: Device Info
      const info = await mediaService.testMediaDevices();
      setDeviceInfo(info);
      results.deviceAccess = info.hasVideo;
      
      if (!info.hasVideo) {
        throw new Error('No camera detected. Please connect a camera and refresh the page.');
      }

      // Test 3: Permissions
      results.permissions = info.permissions.camera !== 'denied';
      
      if (info.permissions.camera === 'denied') {
        throw new Error('Camera access denied. Please allow camera permissions in your browser settings and refresh the page.');
      }

      // Test 4: Camera Stream
      const constraints = selectedCameraId ? {
        video: {
          deviceId: { exact: selectedCameraId },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      } : {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Test video tracks
      const videoTracks = stream.getVideoTracks();
      results.videoStream = videoTracks.length > 0 && videoTracks[0].readyState === 'live';
      
      // Test audio tracks
      const audioTracks = stream.getAudioTracks();
      results.audioStream = audioTracks.length > 0 && audioTracks[0].readyState === 'live';

      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      onCameraReady?.(stream);

    } catch (error: any) {
      console.error('Camera test failed:', error);
      let errorMessage = 'Camera test failed';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please click "Allow" when prompted and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application. Please close other applications using the camera.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera settings not supported. Trying with basic settings...';
        
        // Retry with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          setCameraStream(basicStream);
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
          }
          results.videoStream = true;
          results.audioStream = true;
          onCameraReady?.(basicStream);
        } catch (basicError) {
          errorMessage = 'Camera not compatible with this device.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setCameraError(errorMessage);
    } finally {
      setTestResults(results);
      setIsTestingCamera(false);
    }
  };

  const stopCameraTest = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setTestResults(null);
  };

  const switchCamera = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    
    if (cameraStream) {
      // Stop current stream
      cameraStream.getTracks().forEach(track => track.stop());
      
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        
        setCameraStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
        onCameraReady?.(newStream);
      } catch (error) {
        console.error('Failed to switch camera:', error);
        setCameraError('Failed to switch camera');
      }
    }
  };

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === undefined) return <RefreshCw className="w-4 h-4 text-gray-400" />;
    return status ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = (status: boolean | undefined) => {
    if (status === undefined) return 'Not tested';
    return status ? 'Passed' : 'Failed';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Camera Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Camera Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Video Preview */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden h-64">
              {cameraStream ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Camera className="w-12 h-12 mx-auto mb-3" />
                    <p>Click "Test Camera" to start</p>
                  </div>
                </div>
              )}
              
              {isTestingCamera && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-center text-white">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Testing camera...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {!cameraStream ? (
                <Button
                  onClick={runCameraTest}
                  disabled={isTestingCamera}
                  className="flex-1"
                >
                  {isTestingCamera ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 mr-2" />
                  )}
                  Test Camera
                </Button>
              ) : (
                <Button
                  onClick={stopCameraTest}
                  variant="outline"
                  className="flex-1"
                >
                  Stop Test
                </Button>
              )}
              
              {availableCameras.length > 1 && (
                <select
                  value={selectedCameraId}
                  onChange={(e) => switchCamera(e.target.value)}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm"
                >
                  {availableCameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId.slice(0, 8)}...`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Error Display */}
            {cameraError && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {cameraError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Diagnostic Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Browser Support</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.browserSupport)}
                  <span className="text-sm">{getStatusText(testResults.browserSupport)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Camera Permissions</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.permissions)}
                  <span className="text-sm">{getStatusText(testResults.permissions)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Device Access</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.deviceAccess)}
                  <span className="text-sm">{getStatusText(testResults.deviceAccess)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Video Stream</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.videoStream)}
                  <span className="text-sm">{getStatusText(testResults.videoStream)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Audio Stream</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.audioStream)}
                  <span className="text-sm">{getStatusText(testResults.audioStream)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Information */}
      {deviceInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Browser Support</span>
                <Badge variant={deviceInfo.browserSupport ? "default" : "destructive"}>
                  {deviceInfo.browserSupport ? "Supported" : "Not Supported"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Camera Permission</span>
                <Badge variant={
                  deviceInfo.permissions.camera === 'granted' ? "default" :
                  deviceInfo.permissions.camera === 'prompt' ? "secondary" : "destructive"
                }>
                  {deviceInfo.permissions.camera}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Microphone Permission</span>
                <Badge variant={
                  deviceInfo.permissions.microphone === 'granted' ? "default" :
                  deviceInfo.permissions.microphone === 'prompt' ? "secondary" : "destructive"
                }>
                  {deviceInfo.permissions.microphone}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available Cameras</span>
                <span className="text-sm">{availableCameras.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Audio Devices</span>
                <span className="text-sm">
                  {deviceInfo.devices.filter(d => d.kind === 'audioinput').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Camera Access Denied</p>
                <p className="text-gray-600">Click the camera icon in your browser's address bar and allow camera access.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Camera Already in Use</p>
                <p className="text-gray-600">Close other applications or browser tabs that might be using your camera.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">No Camera Found</p>
                <p className="text-gray-600">Make sure your camera is connected and recognized by your system.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Poor Video Quality</p>
                <p className="text-gray-600">Ensure good lighting and check if other applications are using your camera.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraTestInterface;
