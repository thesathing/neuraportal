import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  ArrowLeftRight, 
  Droplets, 
  Coins, 
  Droplet, 
  User, 
  Sprout,
  Menu,
  X,
  ExternalLink,
  Hexagon
} from 'lucide-react'
import WalletButton from './WalletButton'
import BackgroundEffects from './BackgroundEffects'

interface LayoutProps {
  children: React.ReactNode
}

const navItems = [
  { path: '/swap', label: 'Swap', icon: ArrowLeftRight },
  { path: '/pool', label: 'Pool', icon: Droplets },
  { path: '/farming', label: 'Farming', icon: Sprout },
  { path: '/token', label: 'Deploy', icon: Coins },
  { path: '/faucet', label: 'Faucet', icon: Droplet },
  { path: '/account', label: 'Account', icon: User },
]

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundEffects />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Hexagon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-secondary blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Neura DEX
                </h1>
                <p className="text-xs text-gray-500">Testnet Portal</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/swap')
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-gray-400 hover:text-white hover:bg-surface-light'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <a
                href="https://testnet-blockscout.infra.neuraprotocol.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors"
              >
                Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
              
              <WalletButton />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-surface-light border border-border"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-surface">
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/swap')
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-gray-400 hover:text-white hover:bg-surface-light'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20 lg:pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Hexagon className="w-4 h-4 text-primary" />
              <span>Neura DEX Portal © 2025</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Neura Testnet
              </span>
              <span>Chain ID: 267</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
