import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Music, 
  Target, 
  PenTool, 
  Palette, 
  Users, 
  Clock, 
  Trophy,
  Star,
  Upload,
  Search,
  Filter,
  Calendar,
  Award,
  Zap
} from 'lucide-react'

interface Challenge {
  id: string
  title: string
  description: string
  category: 'music' | 'athletics' | 'writing' | 'visual' | 'collaboration'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  duration: string
  participants: number
  prize: string
  deadline: Date
  requirements: string[]
  progress?: number
  isActive: boolean
  featured?: boolean
}

const CreativeChallengesPage = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  const categories = [
    { id: 'music', name: 'Music', icon: Music, color: 'text-purple-400' },
    { id: 'athletics', name: 'Athletics', icon: Target, color: 'text-orange-400' },
    { id: 'writing', name: 'Writing', icon: PenTool, color: 'text-blue-400' },
    { id: 'visual', name: 'Visual Arts', icon: Palette, color: 'text-pink-400' },
    { id: 'collaboration', name: 'Collaboration', icon: Users, color: 'text-green-400' }
  ]

  const difficulties = [
    { id: 'beginner', name: 'Beginner', color: 'bg-green-600' },
    { id: 'intermediate', name: 'Intermediate', color: 'bg-blue-600' },
    { id: 'advanced', name: 'Advanced', color: 'bg-orange-600' },
    { id: 'expert', name: 'Expert', color: 'bg-red-600' }
  ]

  useEffect(() => {
    // Mock challenges data
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Digital Raga Fusion',
        description: 'Create a 3-minute composition blending traditional Carnatic ragas with modern electronic elements',
        category: 'music',
        difficulty: 'advanced',
        duration: '2 weeks',
        participants: 24,
        prize: 'Studio recording session + ₹10,000',
        deadline: new Date('2025-01-15'),
        requirements: ['Original composition', 'Traditional raga base', 'Digital elements', 'Audio submission'],
        progress: 65,
        isActive: true,
        featured: true
      },
      {
        id: '2',
        title: 'Precision Arts Challenge',
        description: 'Demonstrate artistic precision through any medium, inspired by athletic shooting discipline',
        category: 'athletics',
        difficulty: 'intermediate',
        duration: '10 days',
        participants: 18,
        prize: 'Professional coaching session',
        deadline: new Date('2025-01-10'),
        requirements: ['Precision demonstration', 'Video submission', 'Technique explanation'],
        progress: 40,
        isActive: true
      },
      {
        id: '3',
        title: 'Quantum Storytelling',
        description: 'Write a short story incorporating quantum physics concepts in an accessible, artistic way',
        category: 'writing',
        difficulty: 'expert',
        duration: '3 weeks',
        participants: 31,
        prize: 'Publishing opportunity + ₹15,000',
        deadline: new Date('2025-01-25'),
        requirements: ['1000-3000 words', 'Quantum physics theme', 'Original narrative', 'Scientific accuracy'],
        isActive: true,
        featured: true
      },
      {
        id: '4',
        title: 'Cultural Synthesis Art',
        description: 'Create visual art that represents the fusion of traditional and modern cultural elements',
        category: 'visual',
        difficulty: 'intermediate',
        duration: '2 weeks',
        participants: 42,
        prize: 'Gallery exhibition + art supplies',
        deadline: new Date('2025-01-20'),
        requirements: ['Original artwork', 'Cultural fusion theme', 'Digital submission', 'Artist statement'],
        progress: 25,
        isActive: true
      },
      {
        id: '5',
        title: 'Community Symphony Project',
        description: 'Collaborate with 5+ artists to create a multi-disciplinary performance piece',
        category: 'collaboration',
        difficulty: 'expert',
        duration: '1 month',
        participants: 15,
        prize: 'Performance opportunity + ₹25,000 team prize',
        deadline: new Date('2025-02-15'),
        requirements: ['Team of 5+ artists', 'Multi-disciplinary', 'Performance documentation', 'Collaboration plan'],
        isActive: true,
        featured: true
      },
      {
        id: '6',
        title: 'Beginner\'s Rhythm',
        description: 'Create your first musical composition using basic Carnatic rhythm patterns',
        category: 'music',
        difficulty: 'beginner',
        duration: '1 week',
        participants: 67,
        prize: 'Music learning resources + mentorship',
        deadline: new Date('2025-01-08'),
        requirements: ['Basic composition', 'Carnatic rhythm', 'Audio or notation', 'Learning reflection'],
        progress: 80,
        isActive: true
      }
    ]

    setChallenges(mockChallenges)
    setFilteredChallenges(mockChallenges)
  }, [])

  useEffect(() => {
    let filtered = challenges

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(challenge => challenge.category === selectedCategory)
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(challenge => challenge.difficulty === selectedDifficulty)
    }

    setFilteredChallenges(filtered)
  }, [challenges, searchTerm, selectedCategory, selectedDifficulty])

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.icon : Music
  }

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.color : 'text-gray-400'
  }

  const getDifficultyColor = (difficulty: string) => {
    const diff = difficulties.find(d => d.id === difficulty)
    return diff ? diff.color : 'bg-gray-600'
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Header Section */}
      <section className="relative py-16">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/assets/backgrounds/quantum-energy.png)' }}
        />
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <img
                src="/assets/characters/yeet_penguin_athlete.png"
                alt="Challenge Penguin"
                className="w-24 h-24 object-contain"
              />
            </div>
            
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Creative Challenges
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Push your artistic boundaries through structured challenges that blend 
              tradition with innovation, precision with creativity.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-green-400">
                <Search className="w-5 h-5 mr-2" />
                Find Your Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search challenges..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Difficulty Filter */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white"
                >
                  <option value="all">All Difficulties</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty.id} value={difficulty.id}>
                      {difficulty.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured Challenges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">
            Featured Challenges
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredChallenges.filter(c => c.featured).map((challenge, index) => {
              const IconComponent = getCategoryIcon(challenge.category)
              const daysRemaining = getDaysRemaining(challenge.deadline)
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-400/50 shadow-yellow-400/20 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className={`w-6 h-6 ${getCategoryColor(challenge.category)}`} />
                          <Badge className="bg-yellow-600">Featured</Badge>
                        </div>
                        <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      <CardDescription className="text-slate-300">
                        {challenge.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Challenge Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span>{challenge.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-green-400" />
                          <span>{challenge.participants} participants</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <span className={daysRemaining <= 3 ? 'text-red-400' : 'text-slate-300'}>
                            {daysRemaining} days left
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">Prize</span>
                        </div>
                      </div>

                      {/* Prize */}
                      <div className="p-3 bg-slate-800 rounded-lg">
                        <p className="text-sm text-yellow-400">{challenge.prize}</p>
                      </div>

                      {/* Progress (if participating) */}
                      {challenge.progress && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Your Progress</span>
                            <span>{challenge.progress}%</span>
                          </div>
                          <Progress value={challenge.progress} className="h-2" />
                        </div>
                      )}

                      {/* Action Button */}
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {challenge.progress ? 'Continue Challenge' : 'Join Challenge'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* All Challenges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-green-400">
            All Active Challenges
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredChallenges.filter(c => !c.featured).map((challenge, index) => {
              const IconComponent = getCategoryIcon(challenge.category)
              const daysRemaining = getDaysRemaining(challenge.deadline)
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                >
                  <Card className="bg-slate-900/80 border-slate-700 hover:border-green-400/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className={`w-5 h-5 ${getCategoryColor(challenge.category)}`} />
                          <Badge variant="secondary">{challenge.category}</Badge>
                        </div>
                        <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white text-xs`}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <Clock className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                          <span>{challenge.duration}</span>
                        </div>
                        <div className="text-center">
                          <Users className="w-4 h-4 mx-auto mb-1 text-green-400" />
                          <span>{challenge.participants}</span>
                        </div>
                        <div className="text-center">
                          <Calendar className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                          <span className={daysRemaining <= 3 ? 'text-red-400' : ''}>
                            {daysRemaining}d
                          </span>
                        </div>
                      </div>

                      {challenge.progress && (
                        <div>
                          <Progress value={challenge.progress} className="h-1.5" />
                          <p className="text-xs text-slate-400 mt-1">{challenge.progress}% complete</p>
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                        size="sm"
                      >
                        {challenge.progress ? 'Continue' : 'Join Challenge'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Challenge Creation CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-400/50 max-w-2xl mx-auto">
            <CardHeader>
              <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <CardTitle className="text-2xl text-purple-400">Create Your Own Challenge</CardTitle>
              <CardDescription className="text-lg">
                Have an idea for a creative challenge? Propose it to the community!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Propose Challenge
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default CreativeChallengesPage
