import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { 
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  Smartphone,
  Fingerprint,
  QrCode,
  AlertTriangle,
  CheckCircle,
  Wallet,
  Bitcoin,
  Settings,
  Activity
} from 'lucide-react'

const SecurityPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [blockchainConnected, setBlockchainConnected] = useState(false)

  const securityFeatures = [
    {
      title: 'Multi-Factor Authentication',
      description: 'Secure your account with multiple verification layers',
      icon: Smartphone,
      enabled: twoFactorEnabled,
      status: 'Active',
      color: 'text-green-400'
    },
    {
      title: 'Biometric Security',
      description: 'Use fingerprint or face recognition for access',
      icon: Fingerprint,
      enabled: biometricEnabled,
      status: 'Available',
      color: 'text-blue-400'
    },
    {
      title: 'Blockchain Wallet',
      description: 'Connect Web3 wallet for decentralized authentication',
      icon: Wallet,
      enabled: blockchainConnected,
      status: 'Ready',
      color: 'text-purple-400'
    },
    {
      title: 'End-to-End Encryption',
      description: 'All data protected with military-grade encryption',
      icon: Lock,
      enabled: true,
      status: 'Always On',
      color: 'text-orange-400'
    }
  ]

  const securityMetrics = [
    { label: 'Security Score', value: '96/100', color: 'text-green-400' },
    { label: 'Last Security Scan', value: '2 hours ago', color: 'text-blue-400' },
    { label: 'Threat Level', value: 'Low', color: 'text-green-400' },
    { label: 'Active Sessions', value: '3 devices', color: 'text-orange-400' }
  ]

  const recentActivity = [
    {
      action: 'Successful login',
      location: 'New York, NY',
      device: 'Chrome on MacOS',
      time: '2 minutes ago',
      status: 'safe'
    },
    {
      action: 'Password updated',
      location: 'New York, NY',
      device: 'Chrome on MacOS',
      time: '1 day ago',
      status: 'safe'
    },
    {
      action: '2FA enabled',
      location: 'New York, NY',
      device: 'Mobile App',
      time: '3 days ago',
      status: 'safe'
    },
    {
      action: 'Login attempt blocked',
      location: 'Unknown',
      device: 'Unknown',
      time: '1 week ago',
      status: 'blocked'
    }
  ]

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Header Section */}
      <section className="relative py-16">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/assets/backgrounds/terminal-bg.png)' }}
        />
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Security Center
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Advanced security features protecting your creative work and personal data 
              with enterprise-grade encryption and multi-factor authentication.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Security Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-400/50">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-red-400">
                Security Dashboard
              </CardTitle>
              <CardDescription className="text-center text-lg">
                Your account security status and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {securityMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                      {metric.value}
                    </div>
                    <div className="text-sm text-slate-400">{metric.label}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-green-400">
            Security Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <Card className="bg-slate-900/80 border-slate-700 hover:border-green-400/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center`}>
                            <IconComponent className={`w-6 h-6 ${feature.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${
                            feature.enabled ? 'bg-green-600' : 'bg-slate-600'
                          } text-white mb-2`}>
                            {feature.status}
                          </Badge>
                          <div>
                            <Switch 
                              checked={feature.enabled}
                              onCheckedChange={(checked) => {
                                if (feature.title === 'Multi-Factor Authentication') {
                                  setTwoFactorEnabled(checked)
                                } else if (feature.title === 'Biometric Security') {
                                  setBiometricEnabled(checked)
                                } else if (feature.title === 'Blockchain Wallet') {
                                  setBlockchainConnected(checked)
                                }
                              }}
                              disabled={feature.title === 'End-to-End Encryption'}
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Password & Authentication */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Password Management */}
            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-400">
                  <Key className="w-5 h-5 mr-2" />
                  Password Management
                </CardTitle>
                <CardDescription>
                  Update your password and manage authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      className="bg-slate-800 border-slate-600 pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Update Password
                </Button>
              </CardContent>
            </Card>

            {/* 2FA Setup */}
            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {twoFactorEnabled ? (
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 bg-white p-4 rounded-lg mx-auto">
                      <QrCode className="w-full h-full text-black" />
                    </div>
                    <p className="text-sm text-slate-300">
                      2FA is currently enabled. Use your authenticator app to generate codes.
                    </p>
                    <Button variant="outline" className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                      Disable 2FA
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-300">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                    <div className="w-32 h-32 bg-white p-4 rounded-lg mx-auto">
                      <QrCode className="w-full h-full text-black" />
                    </div>
                    <Input
                      placeholder="Enter verification code"
                      className="bg-slate-800 border-slate-600"
                    />
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Enable 2FA
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Blockchain Integration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-400/50">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-400">
                <Bitcoin className="w-5 h-5 mr-2" />
                Blockchain & Web3 Integration
              </CardTitle>
              <CardDescription>
                Connect your Web3 wallet for decentralized authentication and NFT portfolio integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="bg-orange-600 hover:bg-orange-700 h-16 flex-col">
                  <Wallet className="w-6 h-6 mb-2" />
                  MetaMask
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 h-16 flex-col">
                  <Wallet className="w-6 h-6 mb-2" />
                  WalletConnect
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 h-16 flex-col">
                  <Wallet className="w-6 h-6 mb-2" />
                  Phantom
                </Button>
              </div>
              
              {blockchainConnected && (
                <div className="mt-6 p-4 bg-green-900/50 border border-green-400/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">Wallet Connected</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Address: 0x742d35Cc6634C0532925a3b8D6Ac6E45C0532925
                  </p>
                  <p className="text-sm text-slate-300">
                    Network: Ethereum Mainnet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-orange-400">
            Recent Security Activity
          </h2>
          
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-orange-400" />
                Account Activity Log
              </CardTitle>
              <CardDescription>
                Monitor all security-related activities on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.3 + index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      activity.status === 'blocked' 
                        ? 'bg-red-900/50 border border-red-400/50' 
                        : 'bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.status === 'blocked' 
                          ? 'bg-red-600' 
                          : 'bg-green-600'
                      }`}>
                        {activity.status === 'blocked' ? (
                          <AlertTriangle className="w-4 h-4 text-white" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div>
                        <div className="font-semibold text-white">
                          {activity.action}
                        </div>
                        <div className="text-sm text-slate-400">
                          {activity.device} • {activity.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-slate-400">
                      {activity.time}
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

export default SecurityPage
