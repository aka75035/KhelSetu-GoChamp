import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export function SystemDesignDocument() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">AthleteFlow - Performance Testing App</h1>
        <p className="text-lg text-muted-foreground">
          Cross-platform mobile application for AI-powered athletic performance analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Architecture Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Mobile App Layer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary">React Native</Badge>
                <Badge variant="secondary">Expo</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <ul className="text-sm space-y-1 mt-3">
                  <li>• Cross-platform iOS/Android</li>
                  <li>• Offline-first architecture</li>
                  <li>• Camera & sensor access</li>
                  <li>• Local AI processing</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">AI/ML Layer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary">TensorFlow Lite</Badge>
                <Badge variant="secondary">MediaPipe</Badge>
                <Badge variant="secondary">ONNX Runtime</Badge>
                <ul className="text-sm space-y-1 mt-3">
                  <li>• Pose estimation</li>
                  <li>• Motion tracking</li>
                  <li>• Performance metrics</li>
                  <li>• Real-time analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Backend Layer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary">Supabase</Badge>
                <Badge variant="secondary">PostgreSQL</Badge>
                <Badge variant="secondary">Edge Functions</Badge>
                <ul className="text-sm space-y-1 mt-3">
                  <li>• Data synchronization</li>
                  <li>• Cloud storage</li>
                  <li>• Coach dashboard</li>
                  <li>• Progress analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Tech Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Frontend (Mobile App)</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Framework:</strong> React Native with Expo</li>
                <li><strong>State Management:</strong> Zustand or Redux Toolkit</li>
                <li><strong>Navigation:</strong> React Navigation v6</li>
                <li><strong>UI Components:</strong> NativeBase or Tamagui</li>
                <li><strong>Camera:</strong> Expo Camera API</li>
                <li><strong>Local Storage:</strong> Expo SecureStore + SQLite</li>
                <li><strong>Offline Sync:</strong> WatermelonDB</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">AI/ML & Backend</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Pose Detection:</strong> MediaPipe Pose/BlazePose</li>
                <li><strong>ML Runtime:</strong> TensorFlow Lite</li>
                <li><strong>Video Processing:</strong> FFMPEG Mobile</li>
                <li><strong>Backend:</strong> Supabase (PostgreSQL + Auth)</li>
                <li><strong>File Storage:</strong> Supabase Storage</li>
                <li><strong>Real-time:</strong> Supabase Realtime</li>
                <li><strong>Analytics:</strong> Custom metrics dashboard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Core Features & Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Athlete Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• Simple onboarding & profile setup</li>
                <li>• Test selection menu (jump, sprint, sit-ups, custom)</li>
                <li>• Video recording with guidance overlays</li>
                <li>• Real-time performance feedback</li>
                <li>• Offline data storage & analysis</li>
                <li>• Progress dashboard & history</li>
                <li>• Performance metrics visualization</li>
                <li>• Goal setting & tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Coach/Trainer Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• Web dashboard for athlete management</li>
                <li>• Review synced test results</li>
                <li>• Video analysis tools</li>
                <li>• Performance trend analysis</li>
                <li>• Custom test creation</li>
                <li>• Athlete progress reports</li>
                <li>• Team/group management</li>
                <li>• Export capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI/ML Models for Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pose Estimation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Model:</strong> MediaPipe Pose (BlazePose)</p>
                <p><strong>Purpose:</strong> Real-time human pose detection</p>
                <p><strong>Metrics:</strong> Joint angles, body positioning</p>
                <p><strong>Tests:</strong> Jump form, squat depth, running form</p>
              </CardContent>
            </Card>

            <Card className="bg-cyan-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Motion Tracking</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Model:</strong> Optical Flow + Kalman Filter</p>
                <p><strong>Purpose:</strong> Track movement velocity & trajectory</p>
                <p><strong>Metrics:</strong> Speed, acceleration, distance</p>
                <p><strong>Tests:</strong> Sprint speed, jump height</p>
              </CardContent>
            </Card>

            <Card className="bg-pink-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Repetition Counting</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Model:</strong> Custom CNN + LSTM</p>
                <p><strong>Purpose:</strong> Automated exercise counting</p>
                <p><strong>Metrics:</strong> Rep count, tempo, form quality</p>
                <p><strong>Tests:</strong> Push-ups, sit-ups, burpees</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Performance Scoring</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Model:</strong> Custom scoring algorithm</p>
                <p><strong>Purpose:</strong> Standardized performance metrics</p>
                <p><strong>Metrics:</strong> Performance scores, percentiles</p>
                <p><strong>Tests:</strong> Overall fitness assessment</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Schema Design</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Core Tables</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>users</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>• id, email, name, role</li>
                    <li>• profile_data (age, height, weight)</li>
                    <li>• coach_id (for athlete-coach relationship)</li>
                  </ul>
                </div>
                <div>
                  <p><strong>test_sessions</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>• id, user_id, test_type</li>
                    <li>• recorded_at, duration</li>
                    <li>• video_url, analysis_data</li>
                  </ul>
                </div>
                <div>
                  <p><strong>performance_metrics</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>• session_id, metric_type</li>
                    <li>• value, unit, confidence_score</li>
                    <li>• raw_data (JSON)</li>
                  </ul>
                </div>
                <div>
                  <p><strong>test_templates</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>• id, name, description</li>
                    <li>• instructions, expected_metrics</li>
                    <li>• ai_model_config</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Development Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Phase 1: Foundation (Weeks 1-4)</h4>
              <ul className="space-y-1 text-sm">
                <li>• Project setup & development environment</li>
                <li>• Basic React Native app with navigation</li>
                <li>• Camera integration & video recording</li>
                <li>• Local storage implementation</li>
                <li>• Basic pose detection integration</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Phase 2: Core Features (Weeks 5-8)</h4>
              <ul className="space-y-1 text-sm">
                <li>• Test selection & configuration UI</li>
                <li>• AI-powered motion analysis</li>
                <li>• Performance metrics calculation</li>
                <li>• Offline data persistence</li>
                <li>• Basic progress dashboard</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Phase 3: Backend Integration (Weeks 9-12)</h4>
              <ul className="space-y-1 text-sm">
                <li>• Supabase backend setup</li>
                <li>• User authentication system</li>
                <li>• Data synchronization logic</li>
                <li>• Cloud video storage</li>
                <li>• Coach dashboard (web)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Phase 4: Enhancement (Weeks 13-16)</h4>
              <ul className="space-y-1 text-sm">
                <li>• Advanced analytics & insights</li>
                <li>• Custom test builder</li>
                <li>• Team management features</li>
                <li>• Performance optimization</li>
                <li>• Beta testing & refinement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
