import React, { useState } from 'react'
import { 
  User, 
  Wallet, 
  History, 
  Copy, 
  ExternalLink, 
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Droplets,
  Coins,
  Sprout,
  RefreshCw
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { useWallet } from '../hooks/useWallet'
import { NEURA_TESTNET } from '../config/constants'

const AccountPage: React.FC = () => {
  const { tokens, transactions } = useStore()
  const { address, isConnected, connect, fetchBalances } = useWallet()
  
  const [activeTab, setActiveTab] = useState<'assets' | 'history'>('assets')
  const [copied, setCopied] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchBalances()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'swap':
        return <ArrowUpRight className="w-4 h-4" />
      case 'addLiquidity':
        return <Droplets className="w-4 h-4" />
      case 'removeLiquidity':
        return <ArrowDownLeft className="w-4 h-4" />
      case 'stake':
      case 'unstake':
        return <Sprout className="w-4 h-4" />
      case 'deploy':
        return <Coins className="w-4 h-4" />
      default:
        return <History className="w-4 h-4" />
    }
  }

  const getTxColor = (type: string) => {
    switch (type) {
      case 'swap':
        return 'text-primary bg-primary/20'
      case 'addLiquidity':
        return 'text-success bg-success/20'
      case 'removeLiquidity':
        return 'text-warning bg-warning/20'
      case 'stake':
      case 'unstake':
        return 'text-secondary bg-secondary/20'
      case 'deploy':
        return 'text-accent bg-accent/20'
      default:
        return 'text-gray-400 bg-gray-400/20'
    }
  }

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const totalBalance = tokens.reduce((acc, token) => {
    const balance = parseFloat(token.balance) || 0
    // Mock USD values
    const usdValue = token.symbol === 'ANKR' || token.symbol === 'wANKR' 
      ? balance * 0.05 
      : balance
    return acc + usdValue
  }, 0)

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-glow text-center py-16">
          <div className="w-20 h-20 rounded-full bg-surface-light border border-border mx-auto mb-6 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your account, assets, and transaction history
          </p>
          <button onClick={connect} className="btn-primary">
            <Wallet className="w-5 h-5 inline mr-2" />
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent">
          My Account
        </h1>
        <p className="text-gray-400">Manage your assets and view transaction history</p>
      </div>

      {/* Account Card */}
      <div className="card-glow mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Wallet Address</div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">{`${address?.slice(0, 8)}...${address?.slice(-6)}`}</span>
                <button
                  onClick={copyAddress}
                  className="p-1.5 rounded-lg hover:bg-surface-light transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`${NEURA_TESTNET.blockExplorer}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-surface-light transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Total Balance</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ${totalBalance.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'assets'
              ? 'bg-primary text-white'
              : 'bg-surface-light border border-border hover:border-primary/50'
          }`}
        >
          <Wallet className="w-4 h-4 inline mr-2" />
          Assets
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-primary text-white'
              : 'bg-surface-light border border-border hover:border-primary/50'
          }`}
        >
          <History className="w-4 h-4 inline mr-2" />
          History
        </button>
      </div>

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="card-glow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Your Assets</h3>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-light border border-border hover:border-primary/50 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="space-y-3">
            {tokens.map((token) => {
              const balance = parseFloat(token.balance) || 0
              const usdValue = token.symbol === 'ANKR' || token.symbol === 'wANKR' 
                ? balance * 0.05 
                : balance

              return (
                <div
                  key={token.address}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-light border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold">
                      {token.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold font-mono">
                      {balance.toFixed(4)} {token.symbol}
                    </div>
                    <div className="text-sm text-gray-400">
                      ${usdValue.toFixed(2)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="card-glow">
          <h3 className="text-lg font-semibold mb-6">Transaction History</h3>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No transactions yet</p>
              <p className="text-sm text-gray-500">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.hash}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-light border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTxColor(tx.type)}`}>
                      {getTxIcon(tx.type)}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{tx.type.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-sm text-gray-400">{tx.details}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      tx.status === 'success' ? 'text-success' : 
                      tx.status === 'failed' ? 'text-error' : 'text-warning'
                    }`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </div>
                    <div className="text-sm text-gray-400">{formatTime(tx.timestamp)}</div>
                  </div>
                  <a
                    href={`${NEURA_TESTNET.blockExplorer}/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-surface transition-colors ml-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AccountPage
