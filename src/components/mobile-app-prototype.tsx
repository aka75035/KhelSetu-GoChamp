import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Play, 
  Square, 
  BarChart3, 
  Trophy, 
  Timer, 
  Users, 
  Camera,
  CheckCircle,
  Target,
  TrendingUp,
  Calendar,
  Settings
} from 'lucide-react';

type Screen = 'onboarding' | 'home' | 'test-selection' | 'recording' | 'results' | 'dashboard' | 'coach-view';

export function MobileAppPrototype() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [isRecording, setIsRecording] = useState(false);

  const TestCard = ({ icon: Icon, title, description, difficulty, onSelect }: any) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {difficulty}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MetricCard = ({ label, value, unit, trend }: any) => (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold">{value}<span className="text-sm">{unit}</span></p>
        {trend && (
          <div className="flex items-center justify-center mt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">+{trend}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return (
          <div className="p-6 text-center space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <Trophy className="h-10 w-10 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold">Welcome to AthleteFlow</h1>
              <p className="text-gray-600">
                AI-powered performance testing and analysis for athletes
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Camera className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <p className="font-semibold">Video Analysis</p>
                      <p className="text-sm text-gray-600">AI-powered motion tracking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <p className="font-semibold">Performance Metrics</p>
                      <p className="text-sm text-gray-600">Detailed analytics & insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <p className="font-semibold">Progress Tracking</p>
                      <p className="text-sm text-gray-600">Monitor improvements over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => setCurrentScreen('home')}
              >
                Get Started
              </Button>
              <Button variant="outline" className="w-full">
                Sign in with existing account
              </Button>
            </div>
          </div>
        );

      case 'home':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Hello, Alex</h1>
                <p className="text-gray-600">Ready for your next test?</p>
              </div>
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
            </div>

            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">This Week's Goal</p>
                    <p className="text-2xl font-bold">Complete 5 Tests</p>
                    <p className="text-blue-100">3 of 5 completed</p>
                  </div>
                  <div className="text-right">
                    <Trophy className="h-8 w-8 text-yellow-300" />
                  </div>
                </div>
                <Progress value={60} className="mt-4 bg-blue-400" />
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <MetricCard label="Best Jump" value="52" unit="cm" trend="8" />
              <MetricCard label="Sprint Time" value="6.2" unit="s" />
              <MetricCard label="Tests This Week" value="3" unit="" />
              <MetricCard label="Improvement" value="12" unit="%" trend="5" />
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setCurrentScreen('test-selection')}
              >
                <Play className="h-5 w-5 mr-2" />
                Start New Test
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setCurrentScreen('dashboard')}
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View Progress
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-semibold">Vertical Jump Test</p>
                    <p className="text-sm text-gray-600">2 hours ago • 48cm jump</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-semibold">20m Sprint</p>
                    <p className="text-sm text-gray-600">Yesterday • 6.5s time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'test-selection':
        return (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Choose Your Test</h1>
              <p className="text-gray-600">Select a performance test to begin</p>
            </div>

            <div className="space-y-3">
              <TestCard
                icon={Trophy}
                title="Vertical Jump"
                description="Measure explosive power and jump height"
                difficulty="Beginner"
                onSelect={() => setCurrentScreen('recording')}
              />
              
              <TestCard
                icon={Timer}
                title="20m Sprint"
                description="Test acceleration and top speed"
                difficulty="Intermediate"
                onSelect={() => setCurrentScreen('recording')}
              />
              
              <TestCard
                icon={Target}
                title="Sit-ups (60s)"
                description="Core strength and endurance assessment"
                difficulty="Beginner"
                onSelect={() => setCurrentScreen('recording')}
              />
              
              <TestCard
                icon={BarChart3}
                title="Broad Jump"
                description="Horizontal power and coordination"
                difficulty="Intermediate"
                onSelect={() => setCurrentScreen('recording')}
              />

              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-4 text-center">
                  <div className="text-gray-500">
                    <Settings className="h-6 w-6 mx-auto mb-2" />
                    <p className="font-semibold">Custom Test</p>
                    <p className="text-sm">Create your own test protocol</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setCurrentScreen('home')}
            >
              Back to Home
            </Button>
          </div>
        );

      case 'recording':
        return (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Vertical Jump Test</h1>
              <p className="text-gray-600">Position yourself in the camera frame</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Camera className="h-16 w-16 text-gray-400 mx-auto" />
                    <div>
                      <p className="font-semibold">Camera Feed</p>
                      <p className="text-sm text-gray-600">
                        {isRecording ? 'Recording in progress...' : 'Tap record to start'}
                      </p>
                    </div>
                    {isRecording && (
                      <div className="space-y-2">
                        <div className="bg-red-500 w-3 h-3 rounded-full mx-auto animate-pulse"></div>
                        <p className="text-red-600 font-semibold">00:05</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Instructions</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Stand with feet shoulder-width apart</li>
                  <li>• Keep your full body in frame</li>
                  <li>• Jump as high as possible</li>
                  <li>• Land softly on both feet</li>
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                size="lg"
                onClick={() => {
                  if (isRecording) {
                    setIsRecording(false);
                    setTimeout(() => setCurrentScreen('results'), 1000);
                  } else {
                    setIsRecording(true);
                  }
                }}
              >
                {isRecording ? (
                  <>
                    <Square className="h-5 w-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setCurrentScreen('test-selection')}
              >
                Back to Tests
              </Button>
            </div>
          </div>
        );

      case 'results':
        return (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">Test Complete!</h1>
              <p className="text-gray-600">Here are your results</p>
            </div>

            <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
              <CardContent className="p-6 text-center">
                <p className="text-green-100">Jump Height</p>
                <p className="text-4xl font-bold">52.3 cm</p>
                <div className="flex items-center justify-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-200 mr-1" />
                  <span className="text-green-200">+8% from last test</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Takeoff Speed</p>
                  <p className="text-xl font-bold">3.2 m/s</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Air Time</p>
                  <p className="text-xl font-bold">0.65 s</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Form Score</p>
                  <p className="text-xl font-bold">8.5/10</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Consistency</p>
                  <p className="text-xl font-bold">92%</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Excellent takeoff angle</p>
                    <p className="text-sm text-gray-600">Optimal 45° angle for maximum height</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Improve landing technique</p>
                    <p className="text-sm text-gray-600">Land with softer knees to reduce impact</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                className="w-full"
                onClick={() => setCurrentScreen('test-selection')}
              >
                Take Another Test
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setCurrentScreen('dashboard')}
              >
                View Progress Dashboard
              </Button>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Progress Dashboard</h1>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Last 30 days
              </Button>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tests">Tests</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard label="Total Tests" value="24" unit="" />
                  <MetricCard label="This Week" value="3" unit="" />
                  <MetricCard label="Best Jump" value="52.3" unit="cm" />
                  <MetricCard label="Avg. Sprint" value="6.1" unit="s" />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 h-40 rounded flex items-center justify-center">
                      <p className="text-gray-500">Performance Chart Placeholder</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tests" className="space-y-4">
                <div className="space-y-3">
                  {['Vertical Jump', '20m Sprint', 'Sit-ups', 'Broad Jump'].map((test, i) => (
                    <Card key={test}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{test}</p>
                            <p className="text-sm text-gray-600">{6 - i} tests completed</p>
                          </div>
                          <Badge variant="secondary">{Math.floor(Math.random() * 20 + 80)}%</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 h-48 rounded flex items-center justify-center">
                      <p className="text-gray-500">Trend Analysis Chart</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setCurrentScreen('home')}
            >
              Back to Home
            </Button>
          </div>
        );

      case 'coach-view':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Coach Dashboard</h1>
                <p className="text-gray-600">Manage your athletes</p>
              </div>
              <Badge variant="secondary">
                <Users className="h-4 w-4 mr-1" />
                12 Athletes
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Tests This Week</p>
                  <p className="text-2xl font-bold">47</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Avg. Improvement</p>
                  <p className="text-2xl font-bold">+8.2%</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Athlete Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Alex Johnson', test: 'Vertical Jump', result: '52.3cm', change: '+8%' },
                  { name: 'Sarah Chen', test: '20m Sprint', result: '5.8s', change: '+3%' },
                  { name: 'Mike Torres', test: 'Sit-ups', result: '45 reps', change: '+12%' },
                ].map((athlete, i) => (
                  <Card key={i} className="bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{athlete.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{athlete.name}</p>
                            <p className="text-xs text-gray-600">{athlete.test}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{athlete.result}</p>
                          <p className="text-xs text-green-600">{athlete.change}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Unknown screen</div>;
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white border rounded-2xl overflow-hidden shadow-xl">
      {/* Status Bar */}
      <div className="bg-black text-white px-4 py-1 flex justify-between items-center text-xs">
        <span>9:41</span>
        <span>AthleteFlow</span>
        <span>100%</span>
      </div>

      {/* App Content */}
      <div className="h-[700px] overflow-y-auto">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      {!['onboarding', 'recording'].includes(currentScreen) && (
        <div className="border-t bg-white p-2">
          <div className="flex justify-around">
            {[
              { icon: Trophy, label: 'Home', screen: 'home' },
              { icon: BarChart3, label: 'Progress', screen: 'dashboard' },
              { icon: Play, label: 'Test', screen: 'test-selection' },
              { icon: Users, label: 'Coach', screen: 'coach-view' },
            ].map(({ icon: Icon, label, screen }) => (
              <button
                key={label}
                onClick={() => setCurrentScreen(screen as Screen)}
                className={`flex flex-col items-center p-2 rounded-lg ${
                  currentScreen === screen ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}