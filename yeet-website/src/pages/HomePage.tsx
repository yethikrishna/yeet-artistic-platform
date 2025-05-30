import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import TerminalInterface from '@/components/TerminalInterface'
import NewsletterSubscription from '@/components/NewsletterSubscription'
import CreativeStatsCounter from '@/components/CreativeStatsCounter'
import { 
  Music, 
  PenTool, 
  Target, 
  BookOpen, 
  Zap, 
  Users, 
  Trophy,
  Code,
  Palette,
  Headphones
} from 'lucide-react'

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setIsVisible(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const creativeCircles = [
    { name: 'Explorer', level: 1, color: 'bg-green-500', description: 'Begin your creative journey' },
    { name: 'Apprentice', level: 2, color: 'bg-blue-500', description: 'Learn fundamental skills' },
    { name: 'Artisan', level: 3, color: 'bg-purple-500', description: 'Develop your craft' },
    { name: 'Virtuoso', level: 4, color: 'bg-orange-500', description: 'Master your art form' },
    { name: 'Innovator', level: 5, color: 'bg-red-500', description: 'Push creative boundaries' },
    { name: 'Creator', level: 6, color: 'bg-yellow-500', description: 'Lead and inspire others' }
  ]

  const artKeys = [
    { name: 'Harmony', icon: Music, description: 'Musical composition mastery', unlocked: true },
    { name: 'Precision', icon: Target, description: 'Athletic precision training', unlocked: true },
    { name: 'Narrative', icon: BookOpen, description: 'Storytelling excellence', unlocked: false },
    { name: 'Innovation', icon: Code, description: 'Technical creativity', unlocked: false },
    { name: 'Aesthetics', icon: Palette, description: 'Visual arts mastery', unlocked: false },
    { name: 'Synthesis', icon: Zap, description: 'Cross-disciplinary fusion', unlocked: false },
    { name: 'Community', icon: Users, description: 'Collaborative leadership', unlocked: false },
    { name: 'Legacy', icon: Trophy, description: 'Cultural impact', unlocked: false }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Cyberpunk Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(/assets/backgrounds/cyberpunk-grid.jpg)' }}
      />
      
      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            {/* YEET Penguin Logo */}
            <div className="flex justify-center mb-6">
              <motion.img
                src="/assets/characters/yeet_penguin_default.png"
                alt="YEET Penguin"
                className="w-32 h-32 object-contain"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, delay: 0.3 }}
              />
            </div>
            
            {/* Main Title */}
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            >
              YEET
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-2 text-slate-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              by Yethikrishna R
            </motion.p>
            
            <motion.p 
              className="text-lg mb-8 text-slate-400 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              Artistic Community Platform • Carnatic Fusion • Athletic Precision • Literary Excellence
            </motion.p>

            {/* Current Time Display */}
            <motion.div 
              className="text-sm text-green-400 mb-8 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              <span className="mr-4">SYSTEM TIME:</span>
              <span>{currentTime.toLocaleString()}</span>
            </motion.div>
          </motion.div>

          {/* Quick Stats */}
          <CreativeStatsCounter />
        </div>
      </section>

      {/* Terminal Interface Section */}
      <section className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <TerminalInterface />
          </motion.div>
        </div>
      </section>

      {/* Creative Circles Overview */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-green-400">Creative Circles</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Progress through six levels of artistic mastery, from Explorer to Creator
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {creativeCircles.map((circle, index) => (
              <motion.div
                key={circle.name}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 2.2 + index * 0.1 }}
              >
                <Card className="bg-slate-900/80 border-slate-700 hover:border-green-400 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-green-400">{circle.name}</CardTitle>
                      <div className={`w-4 h-4 rounded-full ${circle.color}`} />
                    </div>
                    <CardDescription>{circle.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="bg-slate-800">
                      Level {circle.level}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ART KEYS System */}
      <section className="relative z-10 py-16 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-purple-400">ART KEYS Collection</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Unlock eight cultural keys through artistic achievements and community contributions
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {artKeys.map((key, index) => {
              const IconComponent = key.icon
              return (
                <motion.div
                  key={key.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 2.7 + index * 0.1 }}
                >
                  <Card 
                    className={`text-center p-6 transition-all duration-300 ${
                      key.unlocked 
                        ? 'bg-gradient-to-br from-purple-900/80 to-blue-900/80 border-purple-400 shadow-purple-400/20 shadow-lg' 
                        : 'bg-slate-900/60 border-slate-700 opacity-60'
                    }`}
                  >
                    <IconComponent 
                      className={`w-8 h-8 mx-auto mb-3 ${
                        key.unlocked ? 'text-purple-400' : 'text-slate-500'
                      }`}
                    />
                    <h3 className="font-bold mb-2">{key.name}</h3>
                    <p className="text-sm text-slate-400">{key.description}</p>
                    {key.unlocked && (
                      <Badge className="mt-3 bg-purple-600">Unlocked</Badge>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <NewsletterSubscription />
        </div>
      </section>

      {/* Cultural Identity Section */}
      <section className="relative z-10 py-16 bg-slate-900/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 3 }}
          >
            <h2 className="text-4xl font-bold mb-8 text-orange-400">Cultural Foundation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-slate-900/80 border-slate-700">
                <CardHeader>
                  <Music className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <CardTitle className="text-orange-400">Carnatic Fusion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">
                    Traditional South Indian classical music meets contemporary innovation,
                    creating unique cross-cultural compositions.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border-slate-700">
                <CardHeader>
                  <Target className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <CardTitle className="text-orange-400">Athletic Precision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">
                    Shooting sports discipline translated into artistic practice,
                    emphasizing focus, consistency, and excellence.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border-slate-700">
                <CardHeader>
                  <BookOpen className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <CardTitle className="text-orange-400">Literary Excellence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">
                    Author of "The Quantum Lotus" - exploring the intersection
                    of ancient wisdom and modern science through narrative.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
