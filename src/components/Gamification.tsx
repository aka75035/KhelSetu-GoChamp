import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Trophy, 
  Star, 
  Medal, 
  Crown, 
  Zap, 
  Target, 
  Flame,
  Award,
  Gift,
  Coins,
  Gem,
  Shield,
  Sword,
  Heart,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Lock,
  Unlock,
  Sparkles,
  Rocket,
  Diamond
} from 'lucide-react';
import { useTranslationWithVoice } from '../hooks/useTranslationWithVoice';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isEarned: boolean;
  earnedAt?: Date;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  reward: {
    xp: number;
    coins: number;
    gems?: number;
  };
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  expiresAt?: Date;
}

interface Level {
  current: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
}

export default function Gamification() {
  const { tForJSX, speakText } = useTranslationWithVoice();
  const [activeTab, setActiveTab] = useState<'achievements' | 'badges' | 'quests' | 'rewards'>('achievements');
  const [level, setLevel] = useState<Level>({
    current: 15,
    xp: 1250,
    xpToNext: 500,
    totalXp: 8750
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [coins, setCoins] = useState(1250);
  const [gems, setGems] = useState(45);

  useEffect(() => {
    // Initialize achievements
    setAchievements([
      {
        id: '1',
        title: tForJSX('achievements.firstSteps', 'First Steps'),
        description: tForJSX('achievements.firstStepsDesc', 'Complete your first workout'),
        icon: '👟',
        rarity: 'common',
        points: 10,
        isUnlocked: true,
        unlockedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        title: tForJSX('achievements.streakMaster', 'Streak Master'),
        description: tForJSX('achievements.streakMasterDesc', 'Maintain a 7-day workout streak'),
        icon: '🔥',
        rarity: 'rare',
        points: 50,
        isUnlocked: true,
        unlockedAt: new Date('2024-01-22')
      },
      {
        id: '3',
        title: tForJSX('achievements.speedDemon', 'Speed Demon'),
        description: tForJSX('achievements.speedDemonDesc', 'Complete 100m sprint in under 12 seconds'),
        icon: '⚡',
        rarity: 'epic',
        points: 100,
        isUnlocked: false,
        progress: 8,
        maxProgress: 10
      },
      {
        id: '4',
        title: tForJSX('achievements.legend', 'Legend'),
        description: tForJSX('achievements.legendDesc', 'Reach level 20'),
        icon: '👑',
        rarity: 'legendary',
        points: 500,
        isUnlocked: false,
        progress: 15,
        maxProgress: 20
      }
    ]);

    // Initialize badges
    setBadges([
      {
        id: '1',
        name: tForJSX('badges.earlyBird', 'Early Bird'),
        description: tForJSX('badges.earlyBirdDesc', 'Work out before 6 AM'),
        icon: '🌅',
        category: 'Time',
        isEarned: true,
        earnedAt: new Date('2024-01-20')
      },
      {
        id: '2',
        name: tForJSX('badges.nightOwl', 'Night Owl'),
        description: tForJSX('badges.nightOwlDesc', 'Work out after 10 PM'),
        icon: '🦉',
        category: 'Time',
        isEarned: false
      },
      {
        id: '3',
        name: tForJSX('badges.socialButterfly', 'Social Butterfly'),
        description: tForJSX('badges.socialButterflyDesc', 'Invite 5 friends to join'),
        icon: '🦋',
        category: 'Social',
        isEarned: true,
        earnedAt: new Date('2024-01-25')
      },
      {
        id: '4',
        name: tForJSX('badges.perfectionist', 'Perfectionist'),
        description: tForJSX('badges.perfectionistDesc', 'Achieve 100% form accuracy'),
        icon: '💎',
        category: 'Performance',
        isEarned: false
      }
    ]);

    // Initialize quests
    setQuests([
      {
        id: '1',
        title: tForJSX('quests.dailyWorkout', 'Daily Workout'),
        description: tForJSX('quests.dailyWorkoutDesc', 'Complete any workout today'),
        type: 'daily',
        reward: { xp: 50, coins: 25 },
        progress: 1,
        maxProgress: 1,
        isCompleted: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: tForJSX('quests.weeklyChallenge', 'Weekly Challenge'),
        description: tForJSX('quests.weeklyChallengeDesc', 'Complete 5 different workouts this week'),
        type: 'weekly',
        reward: { xp: 200, coins: 100, gems: 5 },
        progress: 3,
        maxProgress: 5,
        isCompleted: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        title: tForJSX('quests.monthlyGoal', 'Monthly Goal'),
        description: tForJSX('quests.monthlyGoalDesc', 'Reach 10,000 total steps this month'),
        type: 'monthly',
        reward: { xp: 500, coins: 250, gems: 15 },
        progress: 7500,
        maxProgress: 10000,
        isCompleted: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ]);
  }, [tForJSX]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="h-4 w-4" />;
      case 'rare': return <Medal className="h-4 w-4" />;
      case 'epic': return <Crown className="h-4 w-4" />;
      case 'legendary': return <Diamond className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      case 'special': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const claimReward = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (quest && quest.isCompleted) {
      setCoins(prev => prev + quest.reward.coins);
      setGems(prev => prev + (quest.reward.gems || 0));
      setLevel(prev => ({
        ...prev,
        xp: prev.xp + quest.reward.xp,
        totalXp: prev.totalXp + quest.reward.xp
      }));
      
      speakText(tForJSX('gamification.rewardClaimed', 'Reward claimed! Great job!'));
    }
  };

  const levelProgress = (level.xp / (level.xp + level.xpToNext)) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">{tForJSX('gamification.title', 'Gamification Hub')}</CardTitle>
                <p className="text-yellow-100">{tForJSX('gamification.subtitle', 'Earn rewards, unlock achievements, and level up!')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm opacity-90">{tForJSX('gamification.level', 'Level')} {level.current}</p>
                <p className="text-xs opacity-75">{level.xp}/{level.xp + level.xpToNext} XP</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">{level.current}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Level Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{tForJSX('gamification.levelProgress', 'Level Progress')}</h3>
              <span className="text-sm text-gray-600">{Math.round(levelProgress)}%</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{level.xp} XP</span>
              <span>{level.xp + level.xpToNext} XP</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Coins className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">{tForJSX('gamification.coins', 'Coins')}</p>
                  <p className="text-2xl font-bold text-gray-900">{coins.toLocaleString()}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Gift className="h-4 w-4 mr-2" />
                {tForJSX('gamification.shop', 'Shop')}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Gem className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">{tForJSX('gamification.gems', 'Gems')}</p>
                  <p className="text-2xl font-bold text-gray-900">{gems}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                {tForJSX('gamification.premium', 'Premium')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b">
        {[
          { key: 'achievements', label: tForJSX('gamification.achievements', 'Achievements'), icon: Trophy },
          { key: 'badges', label: tForJSX('gamification.badges', 'Badges'), icon: Medal },
          { key: 'quests', label: tForJSX('gamification.quests', 'Quests'), icon: Target },
          { key: 'rewards', label: tForJSX('gamification.rewards', 'Rewards'), icon: Gift }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeTab === key ? 'default' : 'ghost'}
            onClick={() => setActiveTab(key as any)}
            className="flex items-center space-x-2"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        ))}
      </div>

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className={`${achievement.isUnlocked ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{achievement.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {getRarityIcon(achievement.rarity)}
                          <span className="ml-1 capitalize">{achievement.rarity}</span>
                        </Badge>
                        {achievement.isUnlocked ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Lock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{tForJSX('gamification.points', 'Points')}: {achievement.points}</span>
                        {achievement.isUnlocked && achievement.unlockedAt && (
                          <span className="text-green-600">
                            {tForJSX('gamification.unlocked', 'Unlocked')} {achievement.unlockedAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {!achievement.isUnlocked && achievement.progress !== undefined && (
                        <div className="mt-2">
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress!) * 100} 
                            className="h-2" 
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {achievement.progress}/{achievement.maxProgress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <Card key={badge.id} className={`${badge.isEarned ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}>
              <CardContent className="pt-6 text-center">
                <div className="text-6xl mb-4">{badge.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{badge.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                <Badge variant="outline" className="mb-3">{badge.category}</Badge>
                {badge.isEarned ? (
                  <div className="flex items-center justify-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{tForJSX('gamification.earned', 'Earned')}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-gray-400">
                    <Lock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{tForJSX('gamification.locked', 'Locked')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quests Tab */}
      {activeTab === 'quests' && (
        <div className="space-y-6">
          {quests.map((quest) => (
            <Card key={quest.id} className={`${quest.isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{quest.title}</h3>
                      <Badge className={getQuestTypeColor(quest.type)}>
                        {quest.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{quest.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{tForJSX('gamification.progress', 'Progress')}</span>
                        <span>{quest.progress}/{quest.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(quest.progress / quest.maxProgress) * 100} 
                        className="h-2" 
                      />
                    </div>

                    <div className="flex items-center space-x-4 mt-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span>{quest.reward.xp} XP</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Coins className="h-4 w-4 text-yellow-600" />
                        <span>{quest.reward.coins} {tForJSX('gamification.coins', 'Coins')}</span>
                      </div>
                      {quest.reward.gems && (
                        <div className="flex items-center space-x-1">
                          <Gem className="h-4 w-4 text-purple-600" />
                          <span>{quest.reward.gems} {tForJSX('gamification.gems', 'Gems')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    {quest.isCompleted ? (
                      <Button 
                        onClick={() => claimReward(quest.id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        {tForJSX('gamification.claim', 'Claim')}
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        {tForJSX('gamification.inProgress', 'In Progress')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: tForJSX('rewards.premiumWorkout', 'Premium Workout'), cost: 100, type: 'coins', icon: '💪' },
            { name: tForJSX('rewards.customAvatar', 'Custom Avatar'), cost: 50, type: 'gems', icon: '👤' },
            { name: tForJSX('rewards.extraStorage', 'Extra Storage'), cost: 200, type: 'coins', icon: '💾' },
            { name: tForJSX('rewards.prioritySupport', 'Priority Support'), cost: 25, type: 'gems', icon: '🎧' },
            { name: tForJSX('rewards.exclusiveBadge', 'Exclusive Badge'), cost: 150, type: 'coins', icon: '🏆' },
            { name: tForJSX('rewards.advancedAnalytics', 'Advanced Analytics'), cost: 75, type: 'gems', icon: '📊' }
          ].map((reward, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="text-6xl mb-4">{reward.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{reward.name}</h3>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {reward.type === 'coins' ? (
                    <Coins className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <Gem className="h-5 w-5 text-purple-600" />
                  )}
                  <span className="text-xl font-bold">{reward.cost}</span>
                </div>
                <Button 
                  className="w-full"
                  disabled={
                    (reward.type === 'coins' && coins < reward.cost) ||
                    (reward.type === 'gems' && gems < reward.cost)
                  }
                >
                  {tForJSX('gamification.purchase', 'Purchase')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
