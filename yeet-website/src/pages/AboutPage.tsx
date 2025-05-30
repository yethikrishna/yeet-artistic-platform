import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Music, 
  Target, 
  BookOpen, 
  Code, 
  Palette,
  Users,
  Star,
  Heart,
  MapPin,
  Calendar,
  Trophy,
  Zap,
  Quote,
  Mail,
  ExternalLink
} from 'lucide-react'

const AboutPage = () => {
  const personalStats = [
    { label: 'Years of Musical Training', value: '15+', icon: Music },
    { label: 'Athletic Shooting Awards', value: '12', icon: Target },
    { label: 'Published Stories', value: '156', icon: BookOpen },
    { label: 'Community Members', value: '1,247', icon: Users },
    { label: 'Creative Projects', value: '89', icon: Palette },
    { label: 'Innovation Index', value: '87%', icon: Zap }
  ]

  const timeline = [
    {
      year: '2008',
      title: 'Musical Journey Begins',
      description: 'Started learning Carnatic classical music, discovering the intersection of mathematics and melody',
      category: 'music'
    },
    {
      year: '2012',
      title: 'Athletic Precision Training',
      description: 'Began competitive shooting, developing discipline and precision that would influence all creative work',
      category: 'athletics'
    },
    {
      year: '2016',
      title: 'Literary Exploration',
      description: 'First published story exploring quantum physics through narrative, beginning the journey into science fiction',
      category: 'writing'
    },
    {
      year: '2019',
      title: 'Digital Innovation',
      description: 'Started incorporating technology into traditional art forms, pioneering digital-classical fusion',
      category: 'technology'
    },
    {
      year: '2022',
      title: 'The Quantum Lotus',
      description: 'Published debut novel exploring the intersection of ancient wisdom and quantum physics',
      category: 'publication'
    },
    {
      year: '2024',
      title: 'YEET Platform Launch',
      description: 'Founded the artistic community platform to connect and inspire creators worldwide',
      category: 'platform'
    }
  ]

  const philosophies = [
    {
      title: 'Student by Birth, Singer by Life',
      description: 'Continuous learning is the foundation of artistic growth. Every experience becomes part of the creative symphony.',
      icon: BookOpen
    },
    {
      title: 'Precision in Expression',
      description: 'Athletic discipline applied to creative work. Every note, word, and brushstroke matters.',
      icon: Target
    },
    {
      title: 'Cultural Synthesis',
      description: 'Blending traditional wisdom with modern innovation to create something entirely new.',
      icon: Zap
    },
    {
      title: 'Community Elevation',
      description: 'True artistry emerges when we lift each other up and share our creative journeys.',
      icon: Users
    }
  ]

  const achievements = [
    'State Level Shooting Champion (3x Gold)',
    'Carnatic Music Performance Certificate',
    'Published Author - "The Quantum Lotus"',
    'Community Platform Founder',
    'Cross-Disciplinary Innovation Award',
    'Cultural Ambassador Recognition'
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'music': return 'text-purple-400'
      case 'athletics': return 'text-orange-400'
      case 'writing': return 'text-blue-400'
      case 'technology': return 'text-green-400'
      case 'publication': return 'text-pink-400'
      case 'platform': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Hero Section */}
      <section className="relative py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/assets/backgrounds/quantum-energy.png)' }}
        />
        
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-8">
              <motion.img
                src="/assets/characters/yeet_penguin_musician.png"
                alt="Yethikrishna R"
                className="w-32 h-32 object-contain"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, delay: 0.3 }}
              />
            </div>
            
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Yethikrishna R
            </h1>
            
            <p className="text-2xl text-slate-300 mb-4">
              Multi-disciplinary Artist • Carnatic Musician • Athletic Shooter • Author
            </p>
            
            <div className="flex justify-center items-center space-x-6 text-slate-400 mb-8">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Founded YEET 2024</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>1,247 Community Members</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-slate-900/80 border-slate-700">
                <CardContent className="p-8">
                  <Quote className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <blockquote className="text-xl text-slate-300 italic text-center">
                    "The intersection of tradition and innovation is where true artistry emerges. 
                    Through the discipline of athletic precision, the soul of classical music, 
                    and the imagination of storytelling, we create something greater than the sum of its parts."
                  </blockquote>
                  <p className="text-center text-slate-400 mt-4">— Yethikrishna R</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Personal Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-green-400">
            Creative Journey in Numbers
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {personalStats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="bg-slate-900/80 border-slate-700 text-center hover:border-green-400/50 transition-all duration-300">
                    <CardContent className="p-4">
                      <IconComponent className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-400">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-purple-400">
            Creative Evolution Timeline
          </h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"></div>
            
            <div className="space-y-12">
              {timeline.map((event, index) => (
                <motion.div
                  key={event.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <Card className={`w-full max-w-md ${
                    index % 2 === 0 ? 'mr-auto' : 'ml-auto'
                  } bg-slate-900/80 border-slate-700 relative`}>
                    
                    {/* Timeline Dot */}
                    <div className={`absolute top-6 ${
                      index % 2 === 0 ? '-right-6' : '-left-6'
                    } w-4 h-4 ${getCategoryColor(event.category).replace('text', 'bg')} rounded-full border-4 border-slate-900`}></div>
                    
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge className={`${getCategoryColor(event.category).replace('text', 'bg')} text-white`}>
                          {event.year}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {event.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Philosophy & Approach */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-orange-400">
            Creative Philosophy
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {philosophies.map((philosophy, index) => {
              const IconComponent = philosophy.icon
              return (
                <motion.div
                  key={philosophy.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                >
                  <Card className="bg-slate-900/80 border-slate-700 h-full hover:border-orange-400/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-400/20 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-orange-400" />
                        </div>
                        <CardTitle className="text-orange-400">{philosophy.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300">{philosophy.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Achievements & Recognition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">
            Achievements & Recognition
          </h2>
          
          <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-400/50">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-slate-300">{achievement}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact & Connect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-8 text-blue-400">
            Let's Create Together
          </h2>
          
          <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-400/50 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-400">Connect with Yethikrishna</CardTitle>
              <CardDescription className="text-lg">
                Join the creative journey and be part of the artistic community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Portfolio
                </Button>
              </div>
              
              <div className="text-sm text-slate-400">
                <p>Open to collaborations in music, writing, athletic training, and innovative projects.</p>
                <p className="mt-2">
                  <strong className="text-blue-400">Email:</strong> yethikrishna@yeet.minimax.io
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default AboutPage
