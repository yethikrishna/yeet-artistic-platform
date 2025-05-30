import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Mail, 
  Zap, 
  Crown, 
  Star, 
  Gift,
  Check,
  Music,
  Target,
  PenTool
} from 'lucide-react'

const NewsletterSubscription = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const subscriptionTiers = [
    {
      name: 'Explorer',
      icon: Mail,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/30',
      features: [
        'Weekly YEET Newsletter',
        'Community Updates',
        'Basic Challenge Access',
        'Public Portfolio Gallery'
      ],
      requirement: 'Email subscription'
    },
    {
      name: 'Creator',
      icon: Star,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/30',
      features: [
        'Advanced Challenges',
        'Collaboration Tools',
        'Progress Tracking',
        'Mentor Connections'
      ],
      requirement: '30 days active'
    },
    {
      name: 'Virtuoso',
      icon: Crown,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/30',
      features: [
        'Exclusive Workshops',
        'Direct Artist Access',
        'Priority Support',
        'Beta Feature Access'
      ],
      requirement: '3 ART KEYS unlocked'
    },
    {
      name: 'Innovator',
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      borderColor: 'border-orange-400/30',
      features: [
        'Collaborative Projects',
        'Revenue Sharing',
        'Brand Partnerships',
        'Cultural Ambassador'
      ],
      requirement: 'Community contribution'
    }
  ]

  const upcomingContent = [
    {
      title: 'Digital Ragas Masterclass',
      description: 'Learn Carnatic fusion techniques',
      date: 'Jan 15, 2025',
      icon: Music,
      type: 'Workshop'
    },
    {
      title: 'Precision Arts Training',
      description: 'Athletic discipline in creativity',
      date: 'Jan 22, 2025',
      icon: Target,
      type: 'Bootcamp'
    },
    {
      title: 'Quantum Storytelling',
      description: 'Science-inspired narrative writing',
      date: 'Feb 5, 2025',
      icon: PenTool,
      type: 'Course'
    }
  ]

  const handleSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSubscribed(true)
      toast.success('Welcome to the YEET community! Check your email for confirmation.')
    }, 2000)
  }

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <Card className="bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-400/50">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-400">Welcome to YEET!</CardTitle>
            <CardDescription className="text-lg">
              You're now part of the artistic community. Check your email for next steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge className="bg-green-600 text-white">Explorer Level Unlocked</Badge>
              <p className="text-sm text-slate-300">
                Your creative journey begins now. Explore challenges, connect with artists,
                and start building your portfolio.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          Join the YEET Community
        </h2>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Subscribe to unlock progressive features and access exclusive content, 
          challenges, and direct connection with Yethikrishna R.
        </p>
      </motion.div>

      {/* Subscription Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-12"
      >
        <Card className="bg-slate-900/80 border-slate-700 max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-green-400">Start Your Journey</CardTitle>
            <CardDescription className="text-center">
              Enter your email to begin unlocking the YEET experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubscription} className="space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Joining...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Join YEET Community
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription Tiers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mb-12"
      >
        <h3 className="text-2xl font-bold text-center mb-8 text-blue-400">
          Progressive Feature Unlocking
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subscriptionTiers.map((tier, index) => {
            const IconComponent = tier.icon
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <Card 
                  className={`h-full ${tier.bgColor} ${tier.borderColor} border transition-all duration-300 hover:scale-105`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <IconComponent className={`w-6 h-6 ${tier.color}`} />
                      <Badge variant="secondary" className="text-xs">
                        Level {index + 1}
                      </Badge>
                    </div>
                    <CardTitle className={`${tier.color}`}>{tier.name}</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      {tier.requirement}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm">
                          <Check className="w-3 h-3 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Upcoming Content Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h3 className="text-2xl font-bold text-center mb-8 text-purple-400">
          Upcoming Exclusive Content
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingContent.map((content, index) => {
            const IconComponent = content.icon
            return (
              <motion.div
                key={content.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <Card className="bg-slate-900/60 border-slate-700 hover:border-purple-400/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <IconComponent className="w-6 h-6 text-purple-400" />
                      <Badge className="bg-purple-600">{content.type}</Badge>
                    </div>
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                    <CardDescription>{content.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400">{content.date}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

export default NewsletterSubscription
