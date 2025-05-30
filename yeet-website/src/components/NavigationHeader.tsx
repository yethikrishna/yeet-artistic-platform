import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  Home, 
  Trophy, 
  Briefcase, 
  Gamepad2, 
  Shield, 
  Info,
  Terminal,
  Bell
} from 'lucide-react'

const NavigationHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Challenges', href: '/challenges', icon: Trophy },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Gamification', href: '/gamification', icon: Gamepad2 },
    { name: 'Security', href: '/security', icon: Shield },
    { name: 'About', href: '/about', icon: Info },
  ]

  const isActivePath = (path: string) => location.pathname === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.img
              src="/assets/characters/yeet_penguin_default.png"
              alt="YEET"
              className="w-8 h-8"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            />
            <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              YEET
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const IconComponent = item.icon
              const isActive = isActivePath(item.href)
              
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 transition-all duration-200 ${
                      isActive 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Terminal & Notifications */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
            >
              <Terminal className="w-4 h-4 mr-2" />
              Terminal
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="relative text-slate-300 hover:text-white"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t border-slate-700 py-4"
          >
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const IconComponent = item.icon
                const isActive = isActivePath(item.href)
                
                return (
                  <Link 
                    key={item.name} 
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start space-x-2 ${
                        isActive 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
              
              {/* Mobile Terminal & Notifications */}
              <div className="pt-2 border-t border-slate-700 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  Terminal Mode
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:text-white relative"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  <span className="absolute left-6 top-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}

export default NavigationHeader
