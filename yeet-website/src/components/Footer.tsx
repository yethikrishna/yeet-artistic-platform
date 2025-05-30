import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Github, 
  Twitter, 
  Instagram, 
  Music, 
  Heart,
  Copyright
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Music, href: '#', label: 'Spotify' },
    { icon: Mail, href: 'mailto:hello@yeet.minimax.io', label: 'Email' }
  ]

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { name: 'Home', href: '/' },
        { name: 'Challenges', href: '/challenges' },
        { name: 'Portfolio', href: '/portfolio' },
        { name: 'Community', href: '#' }
      ]
    },
    {
      title: 'Features',
      links: [
        { name: 'Gamification', href: '/gamification' },
        { name: 'Security', href: '/security' },
        { name: 'Terminal', href: '#' },
        { name: 'ART KEYS', href: '#' }
      ]
    },
    {
      title: 'About',
      links: [
        { name: 'Yethikrishna R', href: '/about' },
        { name: 'Philosophy', href: '#' },
        { name: 'Contact', href: '#' },
        { name: 'Support', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Community Guidelines', href: '#' },
        { name: 'Cookie Policy', href: '#' }
      ]
    }
  ]

  return (
    <footer className="relative mt-20 bg-slate-900/95 border-t border-slate-700">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{ 
          backgroundImage: 'url(/assets/backgrounds/geometric-pattern.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="relative container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="/assets/characters/yeet_penguin_default.png"
                  alt="YEET"
                  className="w-8 h-8"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  YEET
                </span>
              </div>
              
              <p className="text-slate-300 mb-4 max-w-sm">
                Artistic Community Platform by Yethikrishna R. 
                Fusing Carnatic tradition with modern innovation, 
                athletic precision with creative expression.
              </p>
              
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:border-green-400 transition-all duration-300"
                    >
                      <IconComponent className="w-5 h-5" />
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + sectionIndex * 0.1 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-slate-400 hover:text-green-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="border-t border-slate-700 pt-8 mb-8"
        >
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-white mb-2">
              Stay Connected
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Subscribe for updates on new challenges, compositions, and community events.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-l-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-400"
              />
              <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-r-lg transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="border-t border-slate-700 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-slate-400"
        >
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Copyright className="w-4 h-4" />
            <span>{currentYear} YEET by Yethikrishna R. All rights reserved.</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400" />
              <span>for artists worldwide</span>
            </span>
          </div>
        </motion.div>

        {/* Cultural Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-6 pt-6 border-t border-slate-700"
        >
          <p className="text-slate-500 italic text-sm">
            "Student by birth, singer by life" - Yethikrishna R
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
