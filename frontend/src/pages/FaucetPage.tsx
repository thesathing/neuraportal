import React, { useState } from 'react'
import { Droplet, Clock, CheckCircle, Gift, Sparkles, Timer } from 'lucide-react'
import TransactionModal from '../components/TransactionModal'
import { useStore } from '../store/useStore'
import { useWallet } from '../hooks/useWallet'
import { TOKENS } from '../config/constants'

interface FaucetToken {
  symbol: string
  name: string
  address: string
  amount: string
  cooldown: number
  lastClaim?: number
}

const faucetTokens: FaucetToken[] = [
  {
    symbol: 'ANKR',
    name: 'Neura Native Token',
    address: TOKENS.ANKR.address,
    amount: '10',
    cooldown: 24 * 60 * 60 * 1000, // 24 hours
  },
  {
    symbol: 'ztUSD',
    name: 'ztUSD Stablecoin',
    address: TOKENS.ztUSD.address,
    amount: '100',
    cooldown: 12 * 60 * 60 * 1000, // 12 hours
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: TOKENS.USDT.address,
    amount: '100',
    cooldown: 12 * 60 * 60 * 1000, // 12 hours
  },
  {
    symbol: 'wANKR',
    name: 'Wrapped ANKR',
    address: TOKENS.wANKR.address,
    amount: '10',
    cooldown: 24 * 60 * 60 * 1000, // 24 hours
  },
]

const FaucetPage: React.FC = () => {
  const { addTransaction } = useStore()
  const { isConnected, connect, address, fetchBalances } = useWallet()
  
  const [claimingToken, setClaimingToken] = useState<string | null>(null)
  const [claimedTokens, setClaimedTokens] = useState<Record<string, number>>({})
  const [txModal, setTxModal] = useState<{
    isOpen: boolean
    status: 'pending' | 'success' | 'error'
    title: string
    message: string
    txHash?: string
  }>({
    isOpen: false,
    status: 'pending',
    title: '',
    message: '',
  })

  const canClaim = (token: FaucetToken) => {
    const lastClaim = claimedTokens[token.symbol]
    if (!lastClaim) return true
    return Date.now() - lastClaim >= token.cooldown
  }

  const getTimeRemaining = (token: FaucetToken) => {
    const lastClaim = claimedTokens[token.symbol]
    if (!lastClaim) return null
    const remaining = token.cooldown - (Date.now() - lastClaim)
    if (remaining <= 0) return null
    
    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
    return `${hours}h ${minutes}m`
  }

  const handleClaim = async (token: FaucetToken) => {
    if (!isConnected || !canClaim(token)) return

    setClaimingToken(token.symbol)
    setTxModal({
      isOpen: true,
      status: 'pending',
      title: 'Claiming Tokens',
      message: `Claiming ${token.amount} ${token.symbol} from faucet...`,
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
    
    addTransaction({
      hash: mockTxHash,
      type: 'faucet',
      status: 'success',
      timestamp: Date.now(),
      details: `Claimed ${token.amount} ${token.symbol} from faucet`,
    })

    setClaimedTokens((prev) => ({
      ...prev,
      [token.symbol]: Date.now(),
    }))

    setTxModal({
      isOpen: true,
      status: 'success',
      title: 'Tokens Claimed!',
      message: `Successfully claimed ${token.amount} ${token.symbol}`,
      txHash: mockTxHash,
    })

    setClaimingToken(null)
    fetchBalances()
  }

  const totalClaimable = faucetTokens.filter(canClaim).length

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent">
          Testnet Faucet
        </h1>
        <p className="text-gray-400">Get free testnet tokens to explore Neura DEX</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card-glow text-center">
          <Gift className="w-6 h-6 text-primary mx-auto mb-2" />
          <div className="text-sm text-gray-400">Available</div>
          <div className="text-xl font-bold">{totalClaimable} Tokens</div>
        </div>
        <div className="card-glow text-center">
          <Sparkles className="w-6 h-6 text-success mx-auto mb-2" />
          <div className="text-sm text-gray-400">Total Claimed</div>
          <div className="text-xl font-bold">{Object.keys(claimedTokens).length}</div>
        </div>
        <div className="card-glow text-center">
          <Timer className="w-6 h-6 text-secondary mx-auto mb-2" />
          <div className="text-sm text-gray-400">Cooldown</div>
          <div className="text-xl font-bold">12-24h</div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Droplet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">How it works</h3>
            <p className="text-sm text-gray-400">
              Connect your wallet and claim free testnet tokens. Each token has a cooldown period
              before you can claim again. Use these tokens to test swapping, providing liquidity,
              and farming on Neura Testnet.
            </p>
          </div>
        </div>
      </div>

      {/* Faucet Tokens */}
      <div className="space-y-4">
        {faucetTokens.map((token) => {
          const claimable = canClaim(token)
          const timeRemaining = getTimeRemaining(token)
          const isClaiming = claimingToken === token.symbol

          return (
            <div key={token.symbol} className="card-glow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold">
                    {token.symbol.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{token.symbol}</div>
                    <div className="text-sm text-gray-400">{token.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {token.amount} {token.symbol}
                  </div>
                  <div className="text-sm text-gray-400 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    Cooldown: {token.cooldown / (60 * 60 * 1000)}h
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                {timeRemaining ? (
                  <div className="flex items-center gap-2 text-warning">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm">Available in {timeRemaining}</span>
                  </div>
                ) : claimedTokens[token.symbol] ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Ready to claim again!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">Never claimed</span>
                  </div>
                )}

                <button
                  onClick={() => (isConnected ? handleClaim(token) : connect())}
                  disabled={isConnected && (!claimable || isClaiming)}
                  className={`px-6 py-2 rounded-xl font-medium transition-all ${
                    !isConnected
                      ? 'bg-primary text-white hover:bg-primary/80'
                      : claimable && !isClaiming
                      ? 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/30'
                      : 'bg-surface-light text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!isConnected
                    ? 'Connect Wallet'
                    : isClaiming
                    ? 'Claiming...'
                    : claimable
                    ? 'Claim'
                    : 'Cooldown'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Claim All Button */}
      {isConnected && totalClaimable > 1 && (
        <div className="mt-6">
          <button
            onClick={async () => {
              for (const token of faucetTokens) {
                if (canClaim(token)) {
                  await handleClaim(token)
                }
              }
            }}
            className="btn-primary w-full"
          >
            <Gift className="w-5 h-5 inline mr-2" />
            Claim All Available ({totalClaimable} tokens)
          </button>
        </div>
      )}

      <TransactionModal
        isOpen={txModal.isOpen}
        onClose={() => setTxModal({ ...txModal, isOpen: false })}
        status={txModal.status}
        title={txModal.title}
        message={txModal.message}
        txHash={txModal.txHash}
      />
    </div>
  )
}

export default FaucetPage
