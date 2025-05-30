import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Terminal, 
  Play, 
  Square, 
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react'

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system'
  content: string
  timestamp: Date
}

const TerminalInterface = () => {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentDirectory, setCurrentDirectory] = useState('~')
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands = {
    help: () => [
      'Available commands:',
      '  help           - Show this help message',
      '  about          - About Yethikrishna R',
      '  skills         - List artistic skills',
      '  projects       - Show current projects',
      '  music          - Carnatic fusion compositions',
      '  shooting       - Athletic achievements',
      '  writing        - Literary works',
      '  clear          - Clear terminal',
      '  ls             - List directory contents',
      '  cd <dir>       - Change directory',
      '  status         - System status',
      '  creativity     - Creativity metrics',
      '  challenges     - Active challenges',
      '  keys           - ART KEYS progress'
    ],
    about: () => [
      'Yethikrishna R - Multi-disciplinary Artist',
      '================================',
      'Student by birth, singer by life.',
      'Carnatic musician exploring fusion compositions.',
      'Athletic shooter with precision training.',
      'Author of "The Quantum Lotus".',
      'Founder of YEET artistic community platform.',
      '',
      'Philosophy: Blending tradition with innovation,',
      'discipline with creativity, precision with expression.'
    ],
    skills: () => [
      'Artistic Skills & Disciplines:',
      '=============================',
      '🎵 Carnatic Classical Music    [████████████] 95%',
      '🎯 Athletic Shooting          [███████████□] 92%',
      '✍️  Creative Writing          [██████████□□] 88%',
      '🎼 Music Composition          [█████████□□□] 85%',
      '💻 Technical Innovation       [████████□□□□] 80%',
      '🎨 Visual Arts               [███████□□□□□] 75%',
      '🤝 Community Leadership      [██████████□□] 87%',
      '🧘 Cultural Synthesis        [█████████□□□] 83%'
    ],
    projects: () => [
      'Current Active Projects:',
      '=======================',
      '• YEET Platform Development',
      '• Carnatic Fusion Album: "Digital Ragas"',
      '• Athletic Training: International Competition Prep',
      '• Book Series: "The Quantum Lotus Chronicles"',
      '• Community Challenges: Monthly Art Competitions',
      '• Educational Content: Artistic Methodology',
      '• Cross-cultural Collaborations',
      '• Technical Innovation in Traditional Arts'
    ],
    music: () => [
      'Carnatic Fusion Compositions:',
      '============================',
      '♪ "Digital Hanumatodi" - Raga meets electronic beats',
      '♪ "Quantum Bhairavi" - Traditional meets quantum physics',
      '♪ "Cyber Kalyani" - Classical fusion with cyberpunk',
      '♪ "Athletic Rhythms" - Sports precision in musical timing',
      '♪ "Binary Bhupali" - Technology-inspired classical',
      '',
      'Performance Status: Recording new album',
      'Next Concert: Virtual Reality Performance Hall'
    ],
    shooting: () => [
      'Athletic Shooting Achievements:',
      '==============================',
      '🏆 State Level Championships: 3x Gold',
      '🎯 National Qualifying Scores: 587/600',
      '🏃 Training Hours: 2000+ annually',
      '🎖️ Precision Average: 94.7%',
      '📈 Personal Best: 598/600',
      '',
      'Training Philosophy:',
      'Breath control → Musical phrasing',
      'Focus discipline → Creative concentration',
      'Precision mechanics → Artistic accuracy'
    ],
    writing: () => [
      'Literary Works & Publications:',
      '=============================',
      '📖 "The Quantum Lotus" - Published novel',
      '📝 Weekly Blog: Art & Science Intersection',
      '📰 Articles: Traditional Arts in Digital Age',
      '🎭 Poetry: Fusion of Classical & Contemporary',
      '📚 Educational: Artistic Methodology Guides',
      '',
      'Current Writing:',
      '• "The Quantum Lotus: Parallels" (Sequel)',
      '• YEET Community Stories',
      '• Athletic Arts Philosophy'
    ],
    ls: () => [
      'drwxr-xr-x  8 yeet users  256 Dec 15 10:30 music/',
      'drwxr-xr-x  6 yeet users  192 Dec 15 10:25 athletics/',
      'drwxr-xr-x  5 yeet users  160 Dec 15 10:28 writing/',
      'drwxr-xr-x  4 yeet users  128 Dec 15 10:32 projects/',
      'drwxr-xr-x  3 yeet users   96 Dec 15 10:27 community/',
      '-rw-r--r--  1 yeet users 2048 Dec 15 10:35 philosophy.txt',
      '-rw-r--r--  1 yeet users 1536 Dec 15 10:33 goals.md',
      '-rw-r--r--  1 yeet users 3072 Dec 15 10:36 achievements.log'
    ],
    status: () => [
      'YEET System Status:',
      '==================',
      'Platform Status:    [ONLINE]',
      'Community Members:  1,247 active',
      'Challenges Running: 8 active',
      'Art Keys Unlocked:  2/8 total',
      'Server Uptime:      99.7%',
      'Creative Energy:    [██████████] 100%',
      '',
      'System Resources:',
      'Inspiration:        [████████████] Unlimited',
      'Innovation:         [█████████░░░] 85%',
      'Collaboration:      [███████████░] 92%'
    ],
    creativity: () => [
      'Creativity Metrics Dashboard:',
      '============================',
      'Daily Practice:     ✅ 4.2 hours average',
      'Cross-discipline:   ✅ Music + Athletics + Writing',
      'Innovation Index:   📈 87% (↑15% this month)',
      'Community Impact:   🌟 1,247 artists inspired',
      'Cultural Fusion:    🎭 Ancient + Modern synthesis',
      '',
      'Recent Breakthroughs:',
      '• Athletic timing in musical composition',
      '• Quantum metaphors in literary work',
      '• Digital ragas with traditional instruments'
    ],
    challenges: () => [
      'Active Creative Challenges:',
      '==========================',
      '🎵 December Raga Challenge - 24 participants',
      '🎯 Precision Arts Contest - 31 participants',
      '✍️  Short Story Competition - 18 submissions',
      '🎨 Visual Arts Fusion - 42 entries',
      '🤝 Collaboration Projects - 15 teams',
      '',
      'Upcoming Events:',
      '• New Year Fusion Concert',
      '• Community Art Exhibition',
      '• Athletic Arts Workshop'
    ],
    keys: () => [
      'ART KEYS Progress:',
      '=================',
      '🔓 Harmony Key     - UNLOCKED (Musical mastery)',
      '🔓 Precision Key   - UNLOCKED (Athletic discipline)',
      '🔒 Narrative Key   - In Progress (65% complete)',
      '🔒 Innovation Key  - In Progress (42% complete)',
      '🔒 Aesthetics Key  - Locked (Requires visual arts mastery)',
      '🔒 Synthesis Key   - Locked (Requires 4 keys)',
      '🔒 Community Key   - Locked (1000+ community impact)',
      '🔒 Legacy Key      - Locked (Cultural contribution)',
      '',
      'Next Goal: Complete Narrative Key through storytelling excellence'
    ],
    clear: () => []
  }

  const addLine = (content: string, type: TerminalLine['type'] = 'output') => {
    setLines(prev => [...prev, { 
      type, 
      content, 
      timestamp: new Date() 
    }])
  }

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    addLine(`yeet@platform:${currentDirectory}$ ${cmd}`, 'input')

    if (trimmedCmd === 'clear') {
      setLines([])
      return
    }

    if (trimmedCmd.startsWith('cd ')) {
      const dir = cmd.split(' ')[1]
      if (dir === '..') {
        setCurrentDirectory('~')
      } else {
        setCurrentDirectory(`~/${dir}`)
      }
      return
    }

    const commandKey = trimmedCmd as keyof typeof commands
    if (commands[commandKey]) {
      const output = commands[commandKey]()
      output.forEach(line => addLine(line))
    } else if (trimmedCmd === '') {
      // Do nothing for empty command
    } else {
      addLine(`Command not found: ${trimmedCmd}. Type 'help' for available commands.`, 'error')
    }
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentInput.trim()) {
      executeCommand(currentInput)
      setCurrentInput('')
    }
  }

  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  useEffect(() => {
    // Initial welcome message
    addLine('Welcome to YEET Terminal Interface', 'system')
    addLine('Type "help" for available commands', 'system')
    addLine('', 'system')
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`mx-auto ${isFullscreen ? 'fixed inset-4 z-50' : 'max-w-4xl'}`}
    >
      <Card className="bg-slate-900/95 border-green-500/50 shadow-green-500/20 shadow-lg">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800/80">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-green-400" />
            <span className="text-sm font-mono text-green-400">
              yeet@platform:{currentDirectory}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsActive(!isActive)}
              className="text-green-400 hover:bg-green-400/20"
            >
              {isActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLines([])}
              className="text-green-400 hover:bg-green-400/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-green-400 hover:bg-green-400/20"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Terminal Content */}
        <div 
          ref={terminalRef}
          onClick={handleTerminalClick}
          className={`p-4 font-mono text-sm cursor-text overflow-y-auto ${
            isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-96'
          }`}
        >
          {lines.map((line, index) => (
            <div 
              key={index} 
              className={`mb-1 ${
                line.type === 'input' 
                  ? 'text-green-400' 
                  : line.type === 'error'
                  ? 'text-red-400'
                  : line.type === 'system'
                  ? 'text-blue-400'
                  : 'text-slate-300'
              }`}
            >
              {line.content}
            </div>
          ))}
          
          {/* Current Input Line */}
          <form onSubmit={handleInputSubmit} className="flex items-center">
            <span className="text-green-400 mr-2">
              yeet@platform:{currentDirectory}$
            </span>
            <Input
              ref={inputRef}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              className="bg-transparent border-none p-0 text-green-400 font-mono focus:ring-0 focus:outline-none"
              placeholder="Type a command..."
              autoFocus
            />
          </form>
        </div>
      </Card>
    </motion.div>
  )
}

export default TerminalInterface
