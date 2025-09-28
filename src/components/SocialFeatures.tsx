import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Trophy, 
  Users, 
  Target, 
  Clock, 
  Star, 
  Flame,
  Crown,
  Medal,
  Award,
  TrendingUp,
  MessageCircle,
  Heart,
  Share2,
  Calendar,
  MapPin,
  Zap,
  Sword,
  Shield
} from 'lucide-react';
import { useTranslationWithVoice } from '../hooks/useTranslationWithVoice';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  sport: string;
  improvement: number;
  isCurrentUser?: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'global';
  participants: number;
  prize: string;
  endDate: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  isJoined?: boolean;
}

interface Team {
  id: string;
  name: string;
  logo: string;
  members: number;
  score: number;
  rank: number;
  captain: string;
  sport: string;
}

export default function SocialFeatures() {
  const { tForJSX, speakText } = useTranslationWithVoice();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'challenges' | 'teams'>('leaderboard');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    // Simulate data loading
    setLeaderboard([
      { id: '1', name: 'Rajesh Kumar', avatar: '', score: 2850, rank: 1, sport: 'Cricket', improvement: 12, isCurrentUser: false },
      { id: '2', name: 'Priya Sharma', avatar: '', score: 2720, rank: 2, sport: 'Badminton', improvement: 8, isCurrentUser: false },
      { id: '3', name: 'Amit Singh', avatar: '', score: 2650, rank: 3, sport: 'Football', improvement: 15, isCurrentUser: true },
      { id: '4', name: 'Sneha Patel', avatar: '', score: 2580, rank: 4, sport: 'Tennis', improvement: 5, isCurrentUser: false },
      { id: '5', name: 'Vikram Reddy', avatar: '', score: 2450, rank: 5, sport: 'Basketball', improvement: 18, isCurrentUser: false },
    ]);

    setChallenges([
      {
        id: '1',
        title: tForJSX('challenges.dailySteps', 'Daily Steps Challenge'),
        description: tForJSX('challenges.dailyStepsDesc', 'Walk 10,000 steps every day for a week'),
        type: 'individual',
        participants: 1250,
        prize: tForJSX('challenges.prize.badge', 'Achievement Badge'),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        difficulty: 'easy',
        category: 'Fitness',
        isJoined: true
      },
      {
        id: '2',
        title: tForJSX('challenges.sprintMaster', 'Sprint Master'),
        description: tForJSX('challenges.sprintMasterDesc', 'Complete 100m sprint in under 12 seconds'),
        type: 'global',
        participants: 850,
        prize: tForJSX('challenges.prize.trophy', 'Gold Trophy'),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        difficulty: 'hard',
        category: 'Athletics',
        isJoined: false
      },
      {
        id: '3',
        title: tForJSX('challenges.teamWorkout', 'Team Workout Challenge'),
        description: tForJSX('challenges.teamWorkoutDesc', 'Complete group fitness sessions with your team'),
        type: 'team',
        participants: 45,
        prize: tForJSX('challenges.prize.medal', 'Team Medal'),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        difficulty: 'medium',
        category: 'Team Sports',
        isJoined: false
      }
    ]);

    setTeams([
      { id: '1', name: 'Thunder Bolts', logo: '', members: 12, score: 15800, rank: 1, captain: 'Rajesh Kumar', sport: 'Cricket' },
      { id: '2', name: 'Lightning Strikes', logo: '', members: 10, score: 15200, rank: 2, captain: 'Priya Sharma', sport: 'Badminton' },
      { id: '3', name: 'Storm Warriors', logo: '', members: 15, score: 14800, rank: 3, captain: 'Amit Singh', sport: 'Football' },
    ]);
  }, [tForJSX]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleJoinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, isJoined: true, participants: challenge.participants + 1 }
        : challenge
    ));
    speakText(tForJSX('challenges.joined', 'You have joined the challenge! Good luck!'));
  };

  const handleLeaveChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, isJoined: false, participants: challenge.participants - 1 }
        : challenge
    ));
    speakText(tForJSX('challenges.left', 'You have left the challenge.'));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">{tForJSX('social.title', 'Social Features')}</CardTitle>
                <p className="text-purple-100">{tForJSX('social.subtitle', 'Compete, challenge, and connect with athletes worldwide')}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
                onClick={() => setActiveTab('leaderboard')}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Trophy className="h-4 w-4 mr-2" />
                {tForJSX('social.leaderboard', 'Leaderboard')}
              </Button>
              <Button
                variant={activeTab === 'challenges' ? 'default' : 'outline'}
                onClick={() => setActiveTab('challenges')}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Target className="h-4 w-4 mr-2" />
                {tForJSX('social.challenges', 'Challenges')}
              </Button>
              <Button
                variant={activeTab === 'teams' ? 'default' : 'outline'}
                onClick={() => setActiveTab('teams')}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Users className="h-4 w-4 mr-2" />
                {tForJSX('social.teams', 'Teams')}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>{tForJSX('social.globalLeaderboard', 'Global Leaderboard')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                      entry.isCurrentUser 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(entry.rank)}
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback>{entry.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{entry.name}</h3>
                        <p className="text-sm text-gray-600">{entry.sport}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{entry.score.toLocaleString()}</p>
                      <div className="flex items-center text-sm text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +{entry.improvement}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>{tForJSX('social.weeklyAchievements', 'Weekly Achievements')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h3 className="font-semibold">{tForJSX('achievements.streak', '7-Day Streak')}</h3>
                  <p className="text-sm text-gray-600">{tForJSX('achievements.streakDesc', 'Consistent training')}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold">{tForJSX('achievements.speed', 'Speed Demon')}</h3>
                  <p className="text-sm text-gray-600">{tForJSX('achievements.speedDesc', 'Fastest reaction time')}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-semibold">{tForJSX('achievements.accuracy', 'Precision Master')}</h3>
                  <p className="text-sm text-gray-600">{tForJSX('achievements.accuracyDesc', '95% accuracy rate')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                    </div>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {challenge.participants}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    <Badge variant="outline">{challenge.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{tForJSX('challenges.prize', 'Prize')}</p>
                      <p className="text-lg font-bold text-yellow-600">{challenge.prize}</p>
                    </div>
                    <Button
                      onClick={() => challenge.isJoined ? handleLeaveChallenge(challenge.id) : handleJoinChallenge(challenge.id)}
                      className={challenge.isJoined ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                    >
                      {challenge.isJoined ? tForJSX('challenges.leave', 'Leave') : tForJSX('challenges.join', 'Join')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Challenge */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>{tForJSX('challenges.createNew', 'Create New Challenge')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-20 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <div className="text-center">
                    <Sword className="h-6 w-6 mx-auto mb-2" />
                    <span>{tForJSX('challenges.createIndividual', 'Individual Challenge')}</span>
                  </div>
                </Button>
                <Button className="h-20 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
                  <div className="text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2" />
                    <span>{tForJSX('challenges.createTeam', 'Team Challenge')}</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={team.logo} />
                        <AvatarFallback>{team.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <p className="text-sm text-gray-600">{team.sport}</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      #{team.rank}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{tForJSX('teams.members', 'Members')}</span>
                    <span className="font-semibold">{team.members}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{tForJSX('teams.score', 'Team Score')}</span>
                    <span className="font-semibold">{team.score.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{tForJSX('teams.captain', 'Captain')}</span>
                    <span className="font-semibold">{team.captain}</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    {tForJSX('teams.join', 'Join Team')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{tForJSX('teams.createNew', 'Create New Team')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{tForJSX('teams.createTitle', 'Start Your Own Team')}</h3>
                <p className="text-gray-600 mb-4">{tForJSX('teams.createDesc', 'Create a team and invite friends to compete together')}</p>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                  {tForJSX('teams.create', 'Create Team')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
