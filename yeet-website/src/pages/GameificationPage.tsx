import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy,
  Star,
  Zap,
  Target,
  Music,
  PenTool,
  Users,
  Crown,
  Gift,
  Medal,
  Award,
  Lock,
  Unlock,
  TrendingUp
} from 'lucide-react'

const GameificationPage = () => {
  const [userLevel, setUserLevel] = useState(3)
  const [userXP, setUserXP] = useState(2340)
  const [nextLevelXP, setNextLevelXP] = useState(3000)

  const artKeys = [
    {
      id: 'harmony',
      name: 'Harmony Key',
      description: 'Master musical composition and rhythm',
      icon: Music,
      unlocked: true,
      progress: 100,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20',
      requirement: 'Complete 10 musical compositions',
      reward: 'Access to advanced music tools'
    },
    {
      id: 'precision',
      name: 'Precision Key',
      description: 'Achieve athletic-level accuracy in creative work',
      icon: Target,
      unlocked: true,
      progress: 100,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/20',
      requirement: 'Maintain 90%+ quality score for 30 days',
      reward: 'Precision training access'
    },
    {
      id: 'narrative',
      name: 'Narrative Key',
      description: 'Excel in storytelling and written expression',
      icon: PenTool,
      unlocked: false,
      progress: 65,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
      requirement: 'Publish 5 acclaimed stories',
      reward: 'Author mentorship program'
    },
    {
      id: 'innovation',
      name: 'Innovation Key',
      description: 'Pioneer new creative techniques and methods',
      icon: Zap,
      unlocked: false,
      progress: 42,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20',
      requirement: 'Create 3 groundbreaking works',
      reward: 'Innovation lab access'
    },
    {
      id: 'aesthetics',
      name: 'Aesthetics Key',
      description: 'Master visual arts and design principles',
      icon: Trophy,
      unlocked: false,
      progress: 25,
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/20',
      requirement: 'Complete visual arts certification',
      reward: 'Design studio access'
    },
    {
      id: 'synthesis',
      name: 'Synthesis Key',
      description: 'Combine multiple art forms seamlessly',
      icon: Star,
      unlocked: false,
      progress: 15,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/20',
      requirement: 'Master 4 different art forms',
      reward: 'Cross-disciplinary projects'
    },
    {
      id: 'community',
      name: 'Community Key',
      description: 'Lead and inspire other artists',
      icon: Users,
      unlocked: false,
      progress: 8,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      requirement: 'Mentor 50+ community members',
      reward: 'Community leadership role'
    },
    {
      id: 'legacy',
      name: 'Legacy Key',
      description: 'Create lasting cultural impact',
      icon: Crown,
      unlocked: false,
      progress: 3,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/20',
      requirement: 'Achieve cultural recognition',
      reward: 'Hall of Fame induction'
    }
  ]

  const achievements = [
    {
      id: 'first-composition',
      title: 'First Melody',
      description: 'Created your first musical composition',
      icon: Music,
      unlocked: true,
      date: '2024-11-15',
      rarity: 'common'
    },
    {
      id: 'precision-master',
      title: 'Precision Master',
      description: 'Maintained 95%+ accuracy for 30 consecutive days',
      icon: Target,
      unlocked: true,
      date: '2024-12-01',
      rarity: 'rare'
    },
    {
      id: 'storyteller',
      title: 'Master Storyteller',
      description: 'Published 5 stories with 90%+ community rating',
      icon: PenTool,
      unlocked: false,
      progress: 80,
      rarity: 'epic'
    },
    {
      id: 'innovator',
      title: 'Creative Innovator',
      description: 'Pioneered a new artistic technique',
      icon: Zap,
      unlocked: false,
      progress: 45,
      rarity: 'legendary'
    }
  ]

  const leaderboard = [
    { rank: 1, name: 'Yethikrishna R', level: 50, xp: 125000, avatar: '/assets/characters/yeet_penguin_musician.png' },
    { rank: 2, name: 'AriaComposer', level: 42, xp: 98500, avatar: '/assets/characters/yeet_penguin_digital.png' },
    { rank: 3, name: 'PrecisionArtist', level: 38, xp: 87200, avatar: '/assets/characters/yeet_penguin_athlete.png' },
    { rank: 4, name: 'QuantumWriter', level: 35, xp: 76800, avatar: '/assets/characters/yeet_penguin_writer.png' },
    { rank: 5, name: 'CreativeFusion', level: 32, xp: 69400, avatar: '/assets/characters/yeet_penguin_collaborator.png' },
    { rank: 15, name: 'You', level: userLevel, xp: userXP, avatar: '/assets/characters/yeet_penguin_default.png' }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-400/20'
      case 'rare': return 'bg-blue-400/20'
      case 'epic': return 'bg-purple-400/20'
      case 'legendary': return 'bg-orange-400/20'
      default: return 'bg-gray-400/20'
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Header Section */}
      <section className="relative py-16">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/assets/backgrounds/cyberpunk-grid.jpg)' }}
        />
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <img
                src="/assets/characters/yeet_penguin_teacher.png"
                alt="Gamification Penguin"
                className="w-24 h-24 object-contain"
              />
            </div>
            
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              ART KEYS System
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Unlock your creative potential through gamified progression. 
              Collect eight cultural keys and climb the artistic excellence ladder.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* User Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-400/50">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-purple-400">
                Your Creative Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Level Progress */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    Level {userLevel}
                  </div>
                  <div className="text-sm text-slate-400 mb-3">Artisan</div>
                  <Progress 
                    value={(userXP / nextLevelXP) * 100} 
                    className="h-3"
                  />
                  <div className="text-xs text-slate-400 mt-2">
                    {userXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
                  </div>
                </div>

                {/* Keys Unlocked */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-400 mb-2">
                    2/8
                  </div>
                  <div className="text-sm text-slate-400 mb-3">ART KEYS Unlocked</div>
                  <div className="flex justify-center space-x-2">
                    {artKeys.slice(0, 4).map(key => (
                      <div 
                        key={key.id}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          key.unlocked 
                            ? 'border-orange-400 bg-orange-400/20' 
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      >
                        {key.unlocked ? (
                          <Unlock className="w-4 h-4 text-orange-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievement Count */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {achievements.filter(a => a.unlocked).length}
                  </div>
                  <div className="text-sm text-slate-400 mb-3">Achievements</div>
                  <div className="flex justify-center space-x-1">
                    {achievements.map(achievement => (
                      <div 
                        key={achievement.id}
                        className={`w-6 h-6 rounded ${
                          achievement.unlocked ? getRarityBg(achievement.rarity) : 'bg-slate-800'
                        }`}
                      >
                        <Trophy className={`w-4 h-4 m-1 ${
                          achievement.unlocked ? getRarityColor(achievement.rarity) : 'text-slate-600'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ART KEYS Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">
            ART KEYS Collection
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {artKeys.map((key, index) => {
              const IconComponent = key.icon
              
              return (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: key.unlocked ? 1.05 : 1.02 }}
                >
                  <Card 
                    className={`h-full transition-all duration-300 ${
                      key.unlocked 
                        ? `bg-gradient-to-br from-slate-900 to-slate-800 ${key.bgColor} border-opacity-50 shadow-lg`
                        : 'bg-slate-900/60 border-slate-700 opacity-75'
                    }`}
                    style={{ borderColor: key.unlocked ? key.color.replace('text-', '') : undefined }}
                  >
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-3">
                        <div className={`w-16 h-16 rounded-full ${key.bgColor} flex items-center justify-center`}>
                          {key.unlocked ? (
                            <IconComponent className={`w-8 h-8 ${key.color}`} />
                          ) : (
                            <Lock className="w-8 h-8 text-slate-500" />
                          )}
                        </div>
                      </div>
                      
                      <CardTitle className={`text-lg ${key.unlocked ? key.color : 'text-slate-500'}`}>
                        {key.name}
                      </CardTitle>
                      
                      <CardDescription className={key.unlocked ? 'text-slate-300' : 'text-slate-500'}>
                        {key.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className={key.unlocked ? 'text-slate-300' : 'text-slate-500'}>
                            Progress
                          </span>
                          <span className={key.unlocked ? key.color : 'text-slate-500'}>
                            {key.progress}%
                          </span>
                        </div>
                        <Progress 
                          value={key.progress} 
                          className={`h-2 ${!key.unlocked && 'opacity-50'}`}
                        />
                      </div>

                      {/* Requirement */}
                      <div className="text-xs">
                        <div className={`font-semibold mb-1 ${key.unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                          Requirement:
                        </div>
                        <div className={key.unlocked ? 'text-slate-400' : 'text-slate-600'}>
                          {key.requirement}
                        </div>
                      </div>

                      {/* Reward */}
                      <div className="text-xs">
                        <div className={`font-semibold mb-1 ${key.unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                          Reward:
                        </div>
                        <div className={key.unlocked ? key.color : 'text-slate-600'}>
                          {key.reward}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="text-center">
                        {key.unlocked ? (
                          <Badge className="bg-green-600 text-white">
                            <Unlock className="w-3 h-3 mr-1" />
                            Unlocked
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-700 text-slate-400">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-green-400">
            Achievements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                >
                  <Card 
                    className={`${
                      achievement.unlocked 
                        ? `bg-gradient-to-br from-slate-900 to-slate-800 ${getRarityBg(achievement.rarity)} border-opacity-50`
                        : 'bg-slate-900/60 border-slate-700 opacity-75'
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 rounded-full ${getRarityBg(achievement.rarity)} flex items-center justify-center mx-auto mb-3`}>
                        <IconComponent className={`w-6 h-6 ${
                          achievement.unlocked ? getRarityColor(achievement.rarity) : 'text-slate-500'
                        }`} />
                      </div>
                      
                      <h4 className={`font-bold text-sm mb-1 ${
                        achievement.unlocked ? 'text-white' : 'text-slate-500'
                      }`}>
                        {achievement.title}
                      </h4>
                      
                      <p className={`text-xs mb-2 ${
                        achievement.unlocked ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {achievement.description}
                      </p>
                      
                      <Badge 
                        className={`${getRarityBg(achievement.rarity)} ${getRarityColor(achievement.rarity)} text-xs`}
                      >
                        {achievement.rarity}
                      </Badge>
                      
                      {achievement.progress && !achievement.unlocked && (
                        <div className="mt-2">
                          <Progress value={achievement.progress} className="h-1" />
                          <div className="text-xs text-slate-500 mt-1">
                            {achievement.progress}%
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">
            Community Leaderboard
          </h2>
          
          <Card className="bg-slate-900/80 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.1 + index * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.name === 'You' 
                        ? 'bg-green-900/50 border border-green-400/50' 
                        : 'bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        user.rank <= 3 ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {user.rank <= 3 ? (
                          <Crown className="w-5 h-5" />
                        ) : (
                          user.rank
                        )}
                      </div>
                      
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 object-contain"
                      />
                      
                      <div>
                        <div className={`font-semibold ${
                          user.name === 'You' ? 'text-green-400' : 'text-white'
                        }`}>
                          {user.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          Level {user.level}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-blue-400">
                        {user.xp.toLocaleString()} XP
                      </div>
                      <div className="text-xs text-slate-400">
                        #{user.rank}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default GameificationPage
