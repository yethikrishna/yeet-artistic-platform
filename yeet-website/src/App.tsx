import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import HomePage from '@/pages/HomePage'
import NavigationHeader from '@/components/NavigationHeader'
import Footer from '@/components/Footer'
import CreativeChallengesPage from '@/pages/CreativeChallengesPage'
import PortfolioPage from '@/pages/PortfolioPage'
import GameificationPage from '@/pages/GameificationPage'
import SecurityPage from '@/pages/SecurityPage'
import AboutPage from '@/pages/AboutPage'
import './App.css'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 font-mono">
          <NavigationHeader />
          <main className="relative">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/challenges" element={<CreativeChallengesPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/gamification" element={<GameificationPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
