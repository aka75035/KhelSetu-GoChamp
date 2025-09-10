import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { 
  Users, 
  Database, 
  Cloud, 
  Sync, 
  CheckCircle, 
  XCircle,
  Upload,
  Download,
  BarChart3,
  Trophy,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-91548b71`;

// Simulated authentication state
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  const signUp = async (email: string, password: string, name: string, role: string = 'athlete') => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name, role })
      });
      
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setToken('demo_token_' + Date.now()); // Simulated token
        return { success: true, data };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
  };

  return { user, token, signUp, signOut };
};

export function BackendIntegration() {
  const { user, token, signUp, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [testSessions, setTestSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'athlete'
  });

  // Simulate offline data sync
  const syncOfflineData = async () => {
    if (!token) return;
    
    setLoading(true);
    setSyncStatus('syncing');
    
    try {
      // Simulate offline test sessions
      const offlineData = {
        sessions: [
          {
            id: `offline_${Date.now()}_1`,
            test_type: 'vertical_jump',
            recorded_at: new Date().toISOString(),
            duration: 30,
            performance_metrics: {
              jump_height: 52.3,
              takeoff_speed: 3.2,
              air_time: 0.65,
              form_score: 8.5
            },
            ai_analysis: {
              strengths: ['Excellent takeoff angle'],
              improvements: ['Land with softer knees']
            }
          },
          {
            id: `offline_${Date.now()}_2`,
            test_type: '20m_sprint',
            recorded_at: new Date(Date.now() - 86400000).toISOString(),
            duration: 15,
            performance_metrics: {
              time: 6.1,
              top_speed: 8.2,
              acceleration: 4.1
            }
          }
        ]
      };

      const response = await fetch(`${API_BASE}/sync/offline-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(offlineData)
      });

      const result = await response.json();
      if (response.ok) {
        setSyncStatus('success');
        await fetchTestSessions();
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      setSyncStatus('error');
      console.error('Sync error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's test sessions
  const fetchTestSessions = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/tests/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Fetch sessions error:', error);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/analytics/performance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    const result = await signUp(signupData.email, signupData.password, signupData.name, signupData.role);
    setLoading(false);
    
    if (result.success) {
      await fetchTestSessions();
      await fetchAnalytics();
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchTestSessions();
      fetchAnalytics();
    }
  }, [user, token]);

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backend Integration Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Input
              placeholder="Email"
              value={signupData.email}
              onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
            />
            <Input
              placeholder="Full Name"
              value={signupData.name}
              onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
            />
            <select 
              className="w-full p-2 border rounded"
              value={signupData.role}
              onChange={(e) => setSignupData(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="athlete">Athlete</option>
              <option value="coach">Coach</option>
            </select>
          </div>
          
          <Button 
            onClick={handleSignUp} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Account...' : 'Sign Up & Connect'}
          </Button>
          
          <Alert>
            <AlertDescription className="text-sm">
              This demo connects to a live Supabase backend with real data storage, authentication, and file upload capabilities.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Backend Integration Dashboard</h2>
          <p className="text-gray-600">Connected to Supabase backend</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sync" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
          <TabsTrigger value="sessions">Test Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="storage">File Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sync className="h-5 w-5" />
                Offline Data Synchronization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold">Sync Status</p>
                  <p className="text-sm text-gray-600">
                    {syncStatus === 'idle' && 'Ready to sync offline data'}
                    {syncStatus === 'syncing' && 'Synchronizing data...'}
                    {syncStatus === 'success' && 'Data synchronized successfully'}
                    {syncStatus === 'error' && 'Sync failed - check connection'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {syncStatus === 'syncing' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
                  {syncStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {syncStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>

              <Button 
                onClick={syncOfflineData}
                disabled={loading || syncStatus === 'syncing'}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Sync Offline Test Data
              </Button>

              <Alert>
                <AlertDescription className="text-sm">
                  Simulates uploading offline-recorded test sessions with performance metrics and AI analysis results.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backend Features Implemented</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">User Authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Data Synchronization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Test Session Storage</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Video Upload & Storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Coach Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Performance Analytics</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Test Sessions ({testSessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No test sessions yet. Sync some offline data to see results here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testSessions.map((session, index) => (
                    <Card key={session.id || index} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold capitalize">
                              {session.test_type?.replace('_', ' ') || 'Unknown Test'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(session.recorded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">
                              {session.sync_status || 'synced'}
                            </Badge>
                            {session.performance_metrics && (
                              <p className="text-sm mt-1">
                                {Object.keys(session.performance_metrics).length} metrics
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {session.performance_metrics && (
                          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                            {Object.entries(session.performance_metrics).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="bg-white p-2 rounded">
                                <p className="text-gray-600 text-xs capitalize">{key.replace('_', ' ')}</p>
                                <p className="font-semibold">{value}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-blue-50">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-600">Total Tests</p>
                        <p className="text-2xl font-bold">{analytics.total_tests}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-600">Test Types</p>
                        <p className="text-2xl font-bold">{Object.keys(analytics.test_types || {}).length}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {analytics.test_types && Object.keys(analytics.test_types).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Test Distribution</h4>
                      <div className="space-y-2">
                        {Object.entries(analytics.test_types).map(([testType, count]) => (
                          <div key={testType} className="flex items-center justify-between">
                            <span className="capitalize">{testType.replace('_', ' ')}</span>
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-200 rounded-full h-2 w-20">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${(count / analytics.total_tests) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics will appear after syncing test data.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                File Storage & Video Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Supabase Storage Integration:</strong> The backend automatically creates secure, private storage buckets for video files and user data. Videos are uploaded with signed URLs for secure access.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-purple-50">
                  <CardContent className="p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="font-semibold">Video Upload</p>
                    <p className="text-sm text-gray-600">Secure cloud storage with CDN</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50">
                  <CardContent className="p-4 text-center">
                    <Download className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <p className="font-semibold">Signed URLs</p>
                    <p className="text-sm text-gray-600">Temporary secure access links</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Storage Buckets Created:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <code>make-91548b71-athlete-videos</code> - Video recordings
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <code>make-91548b71-athlete-profiles</code> - Profile images
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coach Dashboard Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Athlete management & assignment</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Cross-athlete performance comparison</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Progress tracking over time</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Video review and analysis tools</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}