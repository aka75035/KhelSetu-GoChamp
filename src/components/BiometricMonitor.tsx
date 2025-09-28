import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Zap, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Square,
  Bluetooth,
  Wifi
} from 'lucide-react';
import { useTranslationWithVoice } from '../hooks/useTranslationWithVoice';

interface BiometricData {
  heartRate: number;
  calories: number;
  steps: number;
  temperature: number;
  hydration: number;
  stressLevel: number;
  oxygenSaturation: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
}

interface BiometricMonitorProps {
  isMonitoring: boolean;
  onToggleMonitoring: (monitoring: boolean) => void;
}

export default function BiometricMonitor({ isMonitoring, onToggleMonitoring }: BiometricMonitorProps) {
  const { tForJSX, speakText } = useTranslationWithVoice();
  const [biometricData, setBiometricData] = useState<BiometricData>({
    heartRate: 72,
    calories: 0,
    steps: 0,
    temperature: 36.5,
    hydration: 85,
    stressLevel: 25,
    oxygenSaturation: 98,
    bloodPressure: {
      systolic: 120,
      diastolic: 80
    }
  });

  const [alerts, setAlerts] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(() => {
        setBiometricData(prev => ({
          heartRate: Math.max(60, Math.min(180, prev.heartRate + (Math.random() - 0.5) * 10)),
          calories: prev.calories + Math.random() * 2,
          steps: prev.steps + Math.floor(Math.random() * 3),
          temperature: Math.max(35, Math.min(40, prev.temperature + (Math.random() - 0.5) * 0.2)),
          hydration: Math.max(0, Math.min(100, prev.hydration - Math.random() * 0.5)),
          stressLevel: Math.max(0, Math.min(100, prev.stressLevel + (Math.random() - 0.5) * 5)),
          oxygenSaturation: Math.max(90, Math.min(100, prev.oxygenSaturation + (Math.random() - 0.5) * 2)),
          bloodPressure: {
            systolic: Math.max(90, Math.min(180, prev.bloodPressure.systolic + (Math.random() - 0.5) * 5)),
            diastolic: Math.max(60, Math.min(120, prev.bloodPressure.diastolic + (Math.random() - 0.5) * 3))
          }
        }));
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  useEffect(() => {
    // Check for alerts
    const newAlerts: string[] = [];
    
    if (biometricData.heartRate > 160) {
      newAlerts.push(tForJSX('biometric.alerts.highHeartRate', 'High heart rate detected! Consider taking a break.'));
    }
    if (biometricData.hydration < 60) {
      newAlerts.push(tForJSX('biometric.alerts.lowHydration', 'Low hydration level! Please drink water.'));
    }
    if (biometricData.stressLevel > 80) {
      newAlerts.push(tForJSX('biometric.alerts.highStress', 'High stress level detected! Try relaxation techniques.'));
    }
    if (biometricData.oxygenSaturation < 95) {
      newAlerts.push(tForJSX('biometric.alerts.lowOxygen', 'Low oxygen saturation! Check your breathing.'));
    }

    setAlerts(newAlerts);

    // Speak alerts
    if (newAlerts.length > 0 && isMonitoring) {
      newAlerts.forEach(alert => {
        setTimeout(() => speakText(alert), 1000);
      });
    }
  }, [biometricData, isMonitoring, speakText, tForJSX]);

  const getHeartRateStatus = (hr: number) => {
    if (hr < 60) return { status: 'low', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (hr > 100) return { status: 'high', color: 'text-red-600', bg: 'bg-red-100' };
    return { status: 'normal', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getHydrationStatus = (hydration: number) => {
    if (hydration < 60) return { status: 'low', color: 'text-red-600', bg: 'bg-red-100' };
    if (hydration > 90) return { status: 'high', color: 'text-green-600', bg: 'bg-green-100' };
    return { status: 'normal', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  const heartRateStatus = getHeartRateStatus(biometricData.heartRate);
  const hydrationStatus = getHydrationStatus(biometricData.hydration);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Activity className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">{tForJSX('biometric.title', 'Real-time Biometric Monitor')}</CardTitle>
                <p className="text-green-100">{tForJSX('biometric.subtitle', 'Track your vital signs during training')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Bluetooth className="h-5 w-5 text-green-300" />
                ) : (
                  <Wifi className="h-5 w-5 text-yellow-300" />
                )}
                <span className="text-sm">
                  {isConnected ? tForJSX('biometric.connected', 'Connected') : tForJSX('biometric.connecting', 'Connecting...')}
                </span>
              </div>
              <Button
                onClick={() => onToggleMonitoring(!isMonitoring)}
                className={`${
                  isMonitoring 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    {tForJSX('biometric.stop', 'Stop Monitoring')}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {tForJSX('biometric.start', 'Start Monitoring')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
              <div>
                <h3 className="font-medium text-red-800">{tForJSX('biometric.alerts.title', 'Health Alerts')}</h3>
                <ul className="mt-2 space-y-1">
                  {alerts.map((alert, index) => (
                    <li key={index} className="text-sm text-red-700">• {alert}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Heart Rate */}
        <Card className="relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-20 h-20 ${heartRateStatus.bg} rounded-full -mr-10 -mt-10 opacity-20`}></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{tForJSX('biometric.heartRate', 'Heart Rate')}</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(biometricData.heartRate)}</p>
                <p className="text-sm text-gray-500">BPM</p>
              </div>
              <Heart className={`h-8 w-8 ${heartRateStatus.color}`} />
            </div>
            <div className="mt-4">
              <Badge className={heartRateStatus.bg + ' ' + heartRateStatus.color}>
                {heartRateStatus.status === 'normal' ? tForJSX('biometric.normal', 'Normal') : 
                 heartRateStatus.status === 'high' ? tForJSX('biometric.high', 'High') : 
                 tForJSX('biometric.low', 'Low')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Calories */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{tForJSX('biometric.calories', 'Calories')}</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(biometricData.calories)}</p>
                <p className="text-sm text-gray-500">kcal</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                {tForJSX('biometric.burning', 'Burning')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{tForJSX('biometric.steps', 'Steps')}</p>
                <p className="text-3xl font-bold text-gray-900">{biometricData.steps.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{tForJSX('biometric.today', 'Today')}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (biometricData.steps / 10000) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {tForJSX('biometric.goal', 'Goal: 10,000 steps')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hydration */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{tForJSX('biometric.hydration', 'Hydration')}</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(biometricData.hydration)}%</p>
                <p className="text-sm text-gray-500">{tForJSX('biometric.waterLevel', 'Water Level')}</p>
              </div>
              <Droplets className={`h-8 w-8 ${hydrationStatus.color}`} />
            </div>
            <div className="mt-4">
              <Badge className={hydrationStatus.bg + ' ' + hydrationStatus.color}>
                {hydrationStatus.status === 'normal' ? tForJSX('biometric.normal', 'Normal') : 
                 hydrationStatus.status === 'high' ? tForJSX('biometric.high', 'High') : 
                 tForJSX('biometric.low', 'Low')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Temperature */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5" />
              <span>{tForJSX('biometric.temperature', 'Body Temperature')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{biometricData.temperature.toFixed(1)}°C</p>
              <p className="text-sm text-gray-500 mt-2">{tForJSX('biometric.normal', 'Normal')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Blood Pressure */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>{tForJSX('biometric.bloodPressure', 'Blood Pressure')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {biometricData.bloodPressure.systolic}/{biometricData.bloodPressure.diastolic}
              </p>
              <p className="text-sm text-gray-500 mt-2">mmHg</p>
              <Badge className="bg-green-100 text-green-800 mt-2">
                {tForJSX('biometric.normal', 'Normal')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Oxygen Saturation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>{tForJSX('biometric.oxygenSaturation', 'Oxygen Saturation')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{biometricData.oxygenSaturation}%</p>
              <p className="text-sm text-gray-500 mt-2">SpO2</p>
              <Badge className="bg-green-100 text-green-800 mt-2">
                {tForJSX('biometric.normal', 'Normal')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stress Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>{tForJSX('biometric.stressLevel', 'Stress Level')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{biometricData.stressLevel}%</p>
              <p className="text-sm text-gray-500">{tForJSX('biometric.currentStress', 'Current Stress')}</p>
            </div>
            <div className="flex-1 mx-6">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-300 ${
                    biometricData.stressLevel > 70 ? 'bg-red-500' :
                    biometricData.stressLevel > 40 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${biometricData.stressLevel}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={
                biometricData.stressLevel > 70 ? 'bg-red-100 text-red-800' :
                biometricData.stressLevel > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }>
                {biometricData.stressLevel > 70 ? tForJSX('biometric.high', 'High') :
                 biometricData.stressLevel > 40 ? tForJSX('biometric.medium', 'Medium') : 
                 tForJSX('biometric.low', 'Low')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
