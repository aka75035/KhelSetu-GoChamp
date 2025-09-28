import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Camera, 
  Video, 
  Square, 
  Play, 
  Pause, 
  RotateCcw,
  Target,
  Zap,
  Eye,
  Settings,
  Download,
  Share2,
  Maximize,
  Minimize,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useTranslationWithVoice } from '../hooks/useTranslationWithVoice';

interface AROverlay {
  id: string;
  type: 'skeleton' | 'angles' | 'trajectory' | 'heatmap';
  visible: boolean;
  color: string;
  opacity: number;
}

interface MovementAnalysis {
  joint: string;
  angle: number;
  optimalAngle: number;
  deviation: number;
  status: 'good' | 'warning' | 'poor';
}

interface ARVisualizationProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

export default function ARVisualization({ isActive, onToggle }: ARVisualizationProps) {
  const { tForJSX, speakText } = useTranslationWithVoice();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [overlays, setOverlays] = useState<AROverlay[]>([
    { id: 'skeleton', type: 'skeleton', visible: true, color: '#00ff00', opacity: 0.8 },
    { id: 'angles', type: 'angles', visible: true, color: '#ff0000', opacity: 0.6 },
    { id: 'trajectory', type: 'trajectory', visible: false, color: '#0000ff', opacity: 0.7 },
    { id: 'heatmap', type: 'heatmap', visible: false, color: '#ffff00', opacity: 0.5 }
  ]);
  const [movementAnalysis, setMovementAnalysis] = useState<MovementAnalysis[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isStreaming && videoRef.current) {
      startARAnalysis();
    }
    return () => {
      stopARAnalysis();
    };
  }, [isStreaming]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        speakText(tForJSX('ar.cameraStarted', 'AR camera started. Movement analysis is now active.'));
      }
    } catch (err: any) {
      setError('Failed to access camera: ' + err.message);
      speakText(tForJSX('ar.cameraError', 'Failed to access camera. Please check permissions.'));
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      speakText(tForJSX('ar.cameraStopped', 'AR camera stopped.'));
    }
  };

  const startARAnalysis = () => {
    // Simulate real-time movement analysis
    const analysisInterval = setInterval(() => {
      if (!isStreaming) {
        clearInterval(analysisInterval);
        return;
      }

      // Generate mock movement analysis data
      const mockAnalysis: MovementAnalysis[] = [
        {
          joint: 'Knee',
          angle: 145,
          optimalAngle: 150,
          deviation: 5,
          status: 'good'
        },
        {
          joint: 'Elbow',
          angle: 120,
          optimalAngle: 135,
          deviation: 15,
          status: 'warning'
        },
        {
          joint: 'Hip',
          angle: 90,
          optimalAngle: 95,
          deviation: 5,
          status: 'good'
        },
        {
          joint: 'Shoulder',
          angle: 80,
          optimalAngle: 90,
          deviation: 10,
          status: 'warning'
        }
      ];

      setMovementAnalysis(mockAnalysis);
    }, 1000);
  };

  const stopARAnalysis = () => {
    setMovementAnalysis([]);
  };

  const toggleOverlay = (overlayId: string) => {
    setOverlays(prev => prev.map(overlay => 
      overlay.id === overlayId 
        ? { ...overlay, visible: !overlay.visible }
        : overlay
    ));
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (videoRef.current?.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const startRecording = () => {
    setIsRecording(true);
    speakText(tForJSX('ar.recordingStarted', 'Recording started. Your movement analysis is being saved.'));
  };

  const stopRecording = () => {
    setIsRecording(false);
    speakText(tForJSX('ar.recordingStopped', 'Recording stopped. Analysis saved successfully.'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'poor': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Eye className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">{tForJSX('ar.title', 'AR Movement Analysis')}</CardTitle>
                <p className="text-indigo-100">{tForJSX('ar.subtitle', 'Real-time form correction and movement tracking')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-white/20 text-white">
                {isStreaming ? tForJSX('ar.active', 'Active') : tForJSX('ar.inactive', 'Inactive')}
              </Badge>
              <Button
                onClick={() => onToggle(!isActive)}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {isActive ? tForJSX('ar.close', 'Close') : tForJSX('ar.open', 'Open')}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AR Camera View */}
        <div className="lg:col-span-3">
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>{tForJSX('ar.cameraView', 'AR Camera View')}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={isStreaming ? stopCamera : startCamera}
                    className={isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                    size="sm"
                  >
                    {isStreaming ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isStreaming ? tForJSX('ar.stop', 'Stop') : tForJSX('ar.start', 'Start')}
                  </Button>
                  <Button
                    onClick={toggleFullscreen}
                    variant="outline"
                    size="sm"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  style={{ display: isStreaming ? 'block' : 'none' }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ display: isStreaming ? 'block' : 'none' }}
                />
                
                {/* AR Overlays */}
                {isStreaming && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Skeleton Overlay */}
                    {overlays.find(o => o.id === 'skeleton')?.visible && (
                      <div className="absolute inset-0">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          {/* Mock skeleton lines */}
                          <line x1="50" y1="10" x2="50" y2="30" stroke="#00ff00" strokeWidth="0.5" opacity="0.8" />
                          <line x1="50" y1="30" x2="45" y2="50" stroke="#00ff00" strokeWidth="0.5" opacity="0.8" />
                          <line x1="50" y1="30" x2="55" y2="50" stroke="#00ff00" strokeWidth="0.5" opacity="0.8" />
                          <line x1="50" y1="30" x2="50" y2="70" stroke="#00ff00" strokeWidth="0.5" opacity="0.8" />
                          <line x1="50" y1="70" x2="45" y2="90" stroke="#00ff00" strokeWidth="0.5" opacity="0.8" />
                          <line x1="50" y1="70" x2="55" y2="90" stroke="#00ff00" strokeWidth="0.5" opacity="0.8" />
                        </svg>
                      </div>
                    )}

                    {/* Angle Overlays */}
                    {overlays.find(o => o.id === 'angles')?.visible && (
                      <div className="absolute top-4 left-4 space-y-2">
                        <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                          Knee: 145°
                        </div>
                        <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                          Elbow: 120°
                        </div>
                        <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                          Hip: 90°
                        </div>
                      </div>
                    )}

                    {/* Trajectory Overlay */}
                    {overlays.find(o => o.id === 'trajectory')?.visible && (
                      <div className="absolute inset-0">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <path d="M20,80 Q50,20 80,80" stroke="#0000ff" strokeWidth="0.3" fill="none" opacity="0.7" />
                        </svg>
                      </div>
                    )}

                    {/* Heatmap Overlay */}
                    {overlays.find(o => o.id === 'heatmap')?.visible && (
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-yellow-500/20 to-green-500/20" />
                    )}
                  </div>
                )}

                {!isStreaming && (
                  <div className="flex items-center justify-center h-96 text-white">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Camera className="h-12 w-12 opacity-70" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{tForJSX('ar.readyToStart', 'Ready to Start')}</h3>
                      <p className="text-gray-300">{tForJSX('ar.clickStart', 'Click "Start" to begin AR analysis')}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recording Controls */}
          {isStreaming && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
                    >
                      {isRecording ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isRecording ? tForJSX('ar.stopRecording', 'Stop Recording') : tForJSX('ar.startRecording', 'Start Recording')}
                    </Button>
                    {isRecording && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">{tForJSX('ar.recording', 'Recording...')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      {tForJSX('ar.download', 'Download')}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      {tForJSX('ar.share', 'Share')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Controls and Analysis */}
        <div className="space-y-6">
          {/* Overlay Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>{tForJSX('ar.overlays', 'AR Overlays')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overlays.map((overlay) => (
                <div key={overlay.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded border-2"
                      style={{ 
                        backgroundColor: overlay.visible ? overlay.color : 'transparent',
                        borderColor: overlay.color,
                        opacity: overlay.opacity
                      }}
                    ></div>
                    <span className="text-sm font-medium capitalize">{overlay.type}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleOverlay(overlay.id)}
                    className={overlay.visible ? 'bg-green-100 text-green-800' : ''}
                  >
                    {overlay.visible ? tForJSX('ar.on', 'On') : tForJSX('ar.off', 'Off')}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Real-time Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>{tForJSX('ar.realTimeAnalysis', 'Real-time Analysis')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {movementAnalysis.map((analysis, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{analysis.joint}</p>
                    <p className="text-xs text-gray-600">
                      {analysis.angle}° / {analysis.optimalAngle}°
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(analysis.status)}`}>
                      {getStatusIcon(analysis.status)}
                      <span className="capitalize">{analysis.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {analysis.deviation > 0 ? '+' : ''}{analysis.deviation}°
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>{tForJSX('ar.performanceMetrics', 'Performance Metrics')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">85%</p>
                <p className="text-sm text-gray-600">{tForJSX('ar.formAccuracy', 'Form Accuracy')}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">12</p>
                <p className="text-sm text-gray-600">{tForJSX('ar.repetitions', 'Repetitions')}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">2.3s</p>
                <p className="text-sm text-gray-600">{tForJSX('ar.avgTime', 'Avg. Time')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
