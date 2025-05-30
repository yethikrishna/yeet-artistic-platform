import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Trophy, 
  Music, 
  Target, 
  BookOpen,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react'

interface StatItem {
  icon: any
  label: string
  value: number
  suffix: string
  color: string
  description: string
}

const CreativeStatsCounter = () => {
  const [stats, setStats] = useState<StatItem[]>([
    {
      icon: Users,
      label: 'Community Members',
      value: 1247,
      suffix: '',
      color: 'text-green-400',
      description: 'Active creators worldwide'
    },
    {
      icon: Trophy,
      label: 'Challenges Completed',
      value: 342,
      suffix: '',
      color: 'text-blue-400',
      description: 'Artistic challenges finished'
    },
    {
      icon: Music,
      label: 'Compositions Created',
      value: 89,
      suffix: '',
      color: 'text-purple-400',
      description: 'Original musical works'
    },
    {
      icon: Target,
      label: 'Precision Score',
      value: 94.7,
      suffix: '%',
      color: 'text-orange-400',
      description: 'Athletic shooting average'
    },
    {
      icon: BookOpen,
      label: 'Stories Published',
      value: 156,
      suffix: '',
      color: 'text-red-400',
      description: 'Creative writing pieces'
    },
    {
      icon: Zap,
      label: 'Innovation Index',
      value: 87,
      suffix: '%',
      color: 'text-yellow-400',
      description: 'Cross-disciplinary creativity'
    }
  ])

  const [currentTime, setCurrentTime] = useState(new Date())
  const [uptime, setUptime] = useState(0)

  // Animated counter hook
  const useAnimatedCounter = (target: number, duration: number = 2000) => {
    const [count, setCount] = useState(0)
    
    useEffect(() => {
      let start = 0
      const increment = target / (duration / 16)
      
      const timer = setInterval(() => {
        start += increment
        if (start >= target) {
          setCount(target)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)
      
      return () => clearInterval(timer)
    }, [target, duration])
    
    return count
  }

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      setUptime(prev => prev + 1)
      
      // Simulate small increments in stats
      setStats(prevStats => 
        prevStats.map(stat => ({
          ...stat,
          value: stat.label === 'Community Members' && Math.random() > 0.95
            ? stat.value + 1
            : stat.value
        }))
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${mins}m`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="max-w-6xl mx-auto"
    >
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          const animatedValue = useAnimatedCounter(stat.value, 2000 + index * 200)
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-slate-900/80 border-slate-700 hover:border-slate-600 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <IconComponent className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-white mb-1">
                    {animatedValue.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    {stat.label}
                  </div>
                  <div className="text-xs text-slate-500">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* System Status Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              {/* System Time */}
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">System Time:</span>
                <span className="text-green-400 font-mono">
                  {currentTime.toLocaleString()}
                </span>
              </div>

              {/* Platform Status */}
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-600 text-white">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  ONLINE
                </Badge>
                <span className="text-slate-400">Uptime: {formatUptime(uptime)}</span>
              </div>

              {/* Trending Indicator */}
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">Activity:</span>
                <Badge variant="secondary" className="bg-blue-600">
                  High
                </Badge>
              </div>

              {/* Innovation Meter */}
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300">Innovation:</span>
                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                    initial={{ width: 0 }}
                    animate={{ width: '87%' }}
                    transition={{ duration: 2, delay: 1.5 }}
                  />
                </div>
                <span className="text-yellow-400 text-xs">87%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Activity Feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="mt-6"
      >
        <Card className="bg-slate-900/40 border-slate-700">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-2">Recent Activity</div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="border-green-400 text-green-400">
                  New member joined
                </Badge>
                <Badge variant="outline" className="border-blue-400 text-blue-400">
                  Challenge completed
                </Badge>
                <Badge variant="outline" className="border-purple-400 text-purple-400">
                  Composition uploaded
                </Badge>
                <Badge variant="outline" className="border-orange-400 text-orange-400">
                  Achievement unlocked
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default CreativeStatsCounter
