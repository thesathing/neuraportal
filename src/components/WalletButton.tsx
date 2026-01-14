import React, { useState } from 'react'
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Check, AlertTriangle } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { NEURA_TESTNET } from '../config/constants'

const WalletButton: React.FC = () => {
  const { address, isConnected, isConnecting, connect, disconnect, isCorrectNetwork, switchToNeura } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="btn-primary flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <button
        onClick={switchToNeura}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning/20 border border-warning/50 text-warning font-medium hover:bg-warning/30 transition-all"
      >
        <AlertTriangle className="w-4 h-4" />
        Switch to Neura
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-light border border-border hover:border-primary/50 transition-all"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary" />
        <span className="font-mono text-sm">{formatAddress(address!)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-surface border border-border shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-success" />
                Connected to Neura Testnet
              </div>
              <div className="font-mono text-sm">{formatAddress(address!)}</div>
            </div>
            
            <div className="p-2">
              <button
                onClick={copyAddress}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-light transition-colors text-left"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Address'}</span>
              </button>
              
              <a
                href={`${NEURA_TESTNET.blockExplorer}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-light transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Explorer</span>
              </a>
              
              <button
                onClick={() => {
                  disconnect()
                  setShowDropdown(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-error/10 text-error transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WalletButton
