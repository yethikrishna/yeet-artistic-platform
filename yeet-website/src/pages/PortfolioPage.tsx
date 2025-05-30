import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  Music, 
  Target, 
  PenTool, 
  Palette,
  Video,
  Image,
  FileText,
  Download,
  Share,
  Heart,
  Eye,
  Star,
  Plus
} from 'lucide-react'

const PortfolioPage = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const portfolioStats = {
    totalWorks: 156,
    views: 12847,
    likes: 2341,
    shares: 456,
    followers: 892
  }

  const portfolioItems = [
    {
      id: '1',
      title: 'Digital Hanumatodi',
      type: 'music',
      description: 'Carnatic raga meets electronic synthesis',
      thumbnail: '/assets/icons/music-notes.jpg',
      likes: 234,
      views: 1247,
      date: '2024-12-10',
      featured: true,
      fileType: 'audio',
      duration: '4:32'
    },
    {
      id: '2',
      title: 'Precision Training Montage',
      type: 'athletics',
      description: 'Athletic shooting discipline documentation',
      thumbnail: '/assets/backgrounds/terminal-bg.png',
      likes: 187,
      views: 934,
      date: '2024-12-08',
      featured: false,
      fileType: 'video',
      duration: '2:15'
    },
    {
      id: '3',
      title: 'The Quantum Lotus - Chapter 1',
      type: 'writing',
      description: 'Opening chapter exploring quantum consciousness',
      thumbnail: '/assets/backgrounds/quantum-energy.png',
      likes: 342,
      views: 2156,
      date: '2024-12-05',
      featured: true,
      fileType: 'text',
      wordCount: 3200
    },
    {
      id: '4',
      title: 'Cultural Synthesis Mandala',
      type: 'visual',
      description: 'Traditional patterns meet digital geometry',
      thumbnail: '/assets/backgrounds/geometric-pattern.jpg',
      likes: 198,
      views: 876,
      date: '2024-12-03',
      featured: false,
      fileType: 'image'
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'music': return Music
      case 'athletics': return Target
      case 'writing': return PenTool
      case 'visual': return Palette
      default: return FileText
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'audio': return Music
      case 'video': return Video
      case 'image': return Image
      case 'text': return FileText
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'music': return 'text-purple-400'
      case 'athletics': return 'text-orange-400'
      case 'writing': return 'text-blue-400'
      case 'visual': return 'text-pink-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Header Section */}
      <section className="relative py-16">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/assets/backgrounds/geometric-pattern.jpg)' }}
        />
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <img
                src="/assets/characters/yeet_penguin_digital.png"
                alt="Portfolio Penguin"
                className="w-24 h-24 object-contain"
              />
            </div>
            
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Creative Portfolio
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Showcase your artistic journey across multiple disciplines. 
              Build your creative legacy with portfolio management tools.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Portfolio Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-slate-900/80 border-slate-700 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-400">{portfolioStats.totalWorks}</div>
                <div className="text-sm text-slate-400">Total Works</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/80 border-slate-700 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-400">{portfolioStats.views.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Views</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/80 border-slate-700 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-400">{portfolioStats.likes.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Likes</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/80 border-slate-700 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-400">{portfolioStats.shares}</div>
                <div className="text-sm text-slate-400">Shares</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/80 border-slate-700 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-400">{portfolioStats.followers}</div>
                <div className="text-sm text-slate-400">Followers</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Upload New Work */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border-green-400/50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-400">
                <Upload className="w-5 h-5 mr-2" />
                Upload New Work
              </CardTitle>
              <CardDescription>
                Share your latest creative work with the YEET community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="bg-purple-600 hover:bg-purple-700 h-20 flex-col">
                  <Music className="w-6 h-6 mb-2" />
                  Music
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700 h-20 flex-col">
                  <Target className="w-6 h-6 mb-2" />
                  Athletics
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 h-20 flex-col">
                  <PenTool className="w-6 h-6 mb-2" />
                  Writing
                </Button>
                <Button className="bg-pink-600 hover:bg-pink-700 h-20 flex-col">
                  <Palette className="w-6 h-6 mb-2" />
                  Visual Art
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 bg-slate-900 border border-slate-700">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="athletics">Athletics</TabsTrigger>
              <TabsTrigger value="writing">Writing</TabsTrigger>
              <TabsTrigger value="visual">Visual</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {/* Featured Works */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">Featured Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolioItems.filter(item => item.featured).map((item, index) => {
                    const TypeIcon = getTypeIcon(item.type)
                    const FileIcon = getFileIcon(item.fileType)
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-400/50 shadow-yellow-400/20 shadow-lg overflow-hidden">
                          <div className="relative h-48">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <FileIcon className="w-12 h-12 text-white" />
                            </div>
                            <Badge className="absolute top-2 right-2 bg-yellow-600">
                              Featured
                            </Badge>
                          </div>
                          
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <TypeIcon className={`w-5 h-5 ${getTypeColor(item.type)}`} />
                                <Badge variant="secondary">{item.type}</Badge>
                              </div>
                              <div className="text-xs text-slate-400">{item.date}</div>
                            </div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                          </CardHeader>
                          
                          <CardContent>
                            <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                  <Eye className="w-4 h-4 mr-1" />
                                  {item.views}
                                </span>
                                <span className="flex items-center">
                                  <Heart className="w-4 h-4 mr-1" />
                                  {item.likes}
                                </span>
                              </div>
                              <span>
                                {item.duration || item.wordCount ? 
                                  (item.duration || `${item.wordCount} words`) : 
                                  'View details'
                                }
                              </span>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button size="sm" className="flex-1">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Share className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* All Works */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-green-400">Recent Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {portfolioItems.map((item, index) => {
                    const TypeIcon = getTypeIcon(item.type)
                    const FileIcon = getFileIcon(item.fileType)
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <Card className="bg-slate-900/80 border-slate-700 hover:border-green-400/50 transition-all duration-300">
                          <div className="relative h-32">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-t-lg"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <FileIcon className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <TypeIcon className={`w-4 h-4 ${getTypeColor(item.type)}`} />
                              <span className="text-xs text-slate-400">{item.date}</span>
                            </div>
                            
                            <h4 className="font-semibold text-sm mb-1 text-white line-clamp-1">
                              {item.title}
                            </h4>
                            
                            <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                              {item.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <div className="flex items-center space-x-2">
                                <span className="flex items-center">
                                  <Eye className="w-3 h-3 mr-1" />
                                  {item.views}
                                </span>
                                <span className="flex items-center">
                                  <Heart className="w-3 h-3 mr-1" />
                                  {item.likes}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Category-specific tabs would show filtered content */}
            {['music', 'athletics', 'writing', 'visual'].map(category => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="text-center py-12">
                  <div className="mb-4">
                    {React.createElement(getTypeIcon(category), {
                      className: `w-16 h-16 mx-auto ${getTypeColor(category)}`
                    })}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 capitalize">{category} Portfolio</h3>
                  <p className="text-slate-400 mb-6">
                    Your {category} works will be displayed here once uploaded
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add {category} Work
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default PortfolioPage
