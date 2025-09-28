import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Target, 
  Clock, 
  Star,
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  Lightbulb,
  Zap,
  Award
} from 'lucide-react';
import { useTranslationWithVoice } from '../hooks/useTranslationWithVoice';

interface CoachMessage {
  id: string;
  type: 'coach' | 'user';
  message: string;
  timestamp: Date;
  suggestions?: string[];
  confidence?: number;
}

interface AICoachAssistantProps {
  athleteData?: any;
  performanceHistory?: any[];
}

export default function AICoachAssistant({ athleteData, performanceHistory }: AICoachAssistantProps) {
  const { tForJSX, speakText } = useTranslationWithVoice();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [coachPersonality, setCoachPersonality] = useState('motivational');

  const coachPersonalities = {
    motivational: {
      name: 'Motivational Coach',
      icon: '🔥',
      style: 'energetic and encouraging',
      color: 'from-orange-500 to-red-500'
    },
    technical: {
      name: 'Technical Coach',
      icon: '⚙️',
      style: 'analytical and precise',
      color: 'from-blue-500 to-indigo-500'
    },
    supportive: {
      name: 'Supportive Coach',
      icon: '🤗',
      style: 'caring and understanding',
      color: 'from-green-500 to-emerald-500'
    }
  };

  const initialMessages: CoachMessage[] = [
    {
      id: '1',
      type: 'coach',
      message: tForJSX('coach.welcome', 'Welcome! I\'m your AI coach. I\'m here to help you improve your performance with personalized insights and recommendations.'),
      timestamp: new Date(),
      suggestions: [
        tForJSX('coach.suggestions.analyzePerformance', 'Analyze my recent performance'),
        tForJSX('coach.suggestions.createWorkout', 'Create a workout plan'),
        tForJSX('coach.suggestions.nutritionAdvice', 'Give nutrition advice'),
        tForJSX('coach.suggestions.injuryPrevention', 'Help prevent injuries')
      ]
    }
  ];

  useEffect(() => {
    setMessages(initialMessages);
  }, []);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const responses = {
      'analyze': tForJSX('coach.analyzeResponse', 'Based on your recent data, I can see your performance is improving by 12% this month. Your reaction time has decreased by 0.3 seconds, which is excellent!'),
      'workout': tForJSX('coach.workoutResponse', 'I recommend focusing on plyometric exercises this week. Your vertical jump can improve with targeted training. Here\'s a personalized routine...'),
      'nutrition': tForJSX('coach.nutritionResponse', 'Your protein intake looks good, but you need more complex carbs for energy. Try adding quinoa and sweet potatoes to your meals.'),
      'injury': tForJSX('coach.injuryResponse', 'I notice some stress patterns in your movement. Let\'s work on flexibility and proper warm-up routines to prevent injuries.'),
      'default': tForJSX('coach.defaultResponse', 'That\'s a great question! Let me analyze your data and provide you with personalized insights. Can you be more specific about what you\'d like to improve?')
    };

    const lowerMessage = userMessage.toLowerCase();
    let response = responses.default;

    if (lowerMessage.includes('analyze') || lowerMessage.includes('performance')) {
      response = responses.analyze;
    } else if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      response = responses.workout;
    } else if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet')) {
      response = responses.nutrition;
    } else if (lowerMessage.includes('injury') || lowerMessage.includes('prevent')) {
      response = responses.injury;
    }

    setIsTyping(false);
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: CoachMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    const aiResponse = await generateAIResponse(inputMessage);
    
    const coachMessage: CoachMessage = {
      id: (Date.now() + 1).toString(),
      type: 'coach',
      message: aiResponse,
      timestamp: new Date(),
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    };

    setMessages(prev => [...prev, coachMessage]);

    // Speak the AI response
    speakText(aiResponse);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    handleSendMessage();
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input implementation would go here
  };

  const getPerformanceInsights = () => {
    return [
      {
        metric: tForJSX('coach.insights.reactionTime', 'Reaction Time'),
        value: '0.23s',
        improvement: '+15%',
        trend: 'up'
      },
      {
        metric: tForJSX('coach.insights.verticalJump', 'Vertical Jump'),
        value: '32.5"',
        improvement: '+8%',
        trend: 'up'
      },
      {
        metric: tForJSX('coach.insights.endurance', 'Endurance'),
        value: '85%',
        improvement: '+12%',
        trend: 'up'
      }
    ];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Coach Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">{tForJSX('coach.title', 'AI Coach Assistant')}</CardTitle>
                <p className="text-purple-100">{tForJSX('coach.subtitle', 'Your personalized performance coach')}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {Object.entries(coachPersonalities).map(([key, personality]) => (
                <Button
                  key={key}
                  variant={coachPersonality === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCoachPersonality(key)}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <span className="mr-2">{personality.icon}</span>
                  {personality.name}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-96">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>{tForJSX('coach.chat', 'Chat with Coach')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'coach' && <Bot className="h-4 w-4 mt-1" />}
                        {message.type === 'user' && <User className="h-4 w-4 mt-1" />}
                        <div className="flex-1">
                          <p className="text-sm">{message.message}</p>
                          {message.confidence && (
                            <div className="flex items-center mt-2 text-xs opacity-70">
                              <Star className="h-3 w-3 mr-1" />
                              {Math.round(message.confidence * 100)}% confidence
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {messages.length === 1 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">{tForJSX('coach.quickSuggestions', 'Quick suggestions:')}</p>
                  <div className="flex flex-wrap gap-2">
                    {messages[0].suggestions?.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs"
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={tForJSX('coach.inputPlaceholder', 'Ask your coach anything...')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVoiceInput}
                  className={isListening ? 'bg-red-100 text-red-600' : ''}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>{tForJSX('coach.performanceInsights', 'Performance Insights')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getPerformanceInsights().map((insight, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{insight.metric}</p>
                    <p className="text-2xl font-bold text-gray-900">{insight.value}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      {insight.improvement}
                    </Badge>
                    <TrendingUp className="h-4 w-4 text-green-600 mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>{tForJSX('coach.achievements', 'Recent Achievements')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm">{tForJSX('coach.achievement.speed', 'Speed Demon')}</p>
                  <p className="text-xs text-gray-600">{tForJSX('coach.achievement.speedDesc', 'Improved reaction time by 15%')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">{tForJSX('coach.achievement.consistency', 'Consistency King')}</p>
                  <p className="text-xs text-gray-600">{tForJSX('coach.achievement.consistencyDesc', '7 days of consistent training')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
